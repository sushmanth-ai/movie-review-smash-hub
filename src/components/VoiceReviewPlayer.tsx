import React, { useCallback, useEffect, useRef, useState } from "react";
import { createParser } from "eventsource-parser";
import { Play, Pause, Volume2, Loader2, Mic } from "lucide-react";

interface VoiceReviewPlayerProps {
  text: string;
  autoPlay?: boolean;
  defaultVoice?: "female" | "male";
}

const SAMPLE_RATE = 24000;

export const VoiceReviewPlayer: React.FC<VoiceReviewPlayerProps> = ({
  text,
  autoPlay = true,
  defaultVoice = "male",
}) => {
  const [voice, setVoice] = useState<"female" | "male">(defaultVoice);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused" | "ended" | "error">("idle");
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [needsTap, setNeedsTap] = useState(false);
  const [bars, setBars] = useState<number[]>(() => Array(28).fill(0.1));

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playheadRef = useRef(0);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const totalDurRef = useRef(0);
  const pendingRef = useRef<Uint8Array>(new Uint8Array(0));
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);
  const finishedStreamRef = useRef(false);
  const triedAutoRef = useRef(false);

  const cleanup = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    sourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    sourcesRef.current = [];
    pendingRef.current = new Uint8Array(0);
    playheadRef.current = 0;
    startedAtRef.current = 0;
    pausedAtRef.current = 0;
    totalDurRef.current = 0;
    finishedStreamRef.current = false;
    setProgress(0);
    setDuration(0);
  }, []);

  useEffect(() => () => {
    cleanup();
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, [cleanup]);

  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new Ctx({ sampleRate: SAMPLE_RATE });
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
      analyserRef.current = analyser;
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const scheduleChunk = useCallback((bytes: Uint8Array) => {
    const ctx = ctxRef.current!;
    const merged = new Uint8Array(pendingRef.current.length + bytes.length);
    merged.set(pendingRef.current);
    merged.set(bytes, pendingRef.current.length);
    const usable = merged.length - (merged.length % 2);
    pendingRef.current = merged.slice(usable);
    if (usable === 0) return;
    const samples = new Int16Array(merged.buffer, 0, usable / 2);
    const floats = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) floats[i] = samples[i] / 32768;
    const buf = ctx.createBuffer(1, floats.length, SAMPLE_RATE);
    buf.copyToChannel(floats, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gainRef.current!);
    if (playheadRef.current === 0) {
      playheadRef.current = ctx.currentTime + 0.08;
      startedAtRef.current = playheadRef.current;
    } else {
      playheadRef.current = Math.max(playheadRef.current, ctx.currentTime);
    }
    src.start(playheadRef.current);
    playheadRef.current += buf.duration;
    totalDurRef.current = playheadRef.current - startedAtRef.current;
    setDuration(totalDurRef.current);
    sourcesRef.current.push(src);
    src.onended = () => {
      sourcesRef.current = sourcesRef.current.filter((s) => s !== src);
      if (finishedStreamRef.current && sourcesRef.current.length === 0) {
        setStatus("ended");
      }
    };
  }, []);

  const animate = useCallback(() => {
    const analyser = analyserRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !ctx) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bucket = Math.floor(data.length / 28);
    const next: number[] = [];
    for (let i = 0; i < 28; i++) {
      let sum = 0;
      for (let j = 0; j < bucket; j++) sum += data[i * bucket + j];
      const v = sum / bucket / 255;
      next.push(Math.max(0.08, v));
    }
    setBars(next);
    if (startedAtRef.current && totalDurRef.current > 0) {
      const elapsed = Math.min(totalDurRef.current, ctx.currentTime - startedAtRef.current);
      setProgress(elapsed / totalDurRef.current);
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const start = useCallback(async () => {
    cleanup();
    setStatus("loading");
    setNeedsTap(false);
    try {
      const ctx = await ensureCtx();
      // Test if audio is allowed (autoplay policy)
      if (ctx.state !== "running") {
        setStatus("idle");
        setNeedsTap(true);
        return;
      }
      const abort = new AbortController();
      abortRef.current = abort;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-review`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voice }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`Voice request failed: ${res.status} ${errBody}`);
      }

      setStatus("playing");
      rafRef.current = requestAnimationFrame(animate);

      const parser = createParser({
        onEvent(event) {
          let payload: any;
          try { payload = JSON.parse(event.data); } catch { return; }
          if (payload.type !== "speech.audio.delta" || !payload.audio) return;
          const bin = atob(payload.audio);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          scheduleChunk(arr);
        },
      });

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        parser.feed(value);
      }
      finishedStreamRef.current = true;
      if (sourcesRef.current.length === 0) setStatus("ended");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Voice review error:", err);
      setStatus("error");
    }
  }, [animate, cleanup, ensureCtx, scheduleChunk, text, voice]);

  const pause = useCallback(async () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    await ctx.suspend();
    pausedAtRef.current = ctx.currentTime;
    setStatus("paused");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const resume = useCallback(async () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    await ctx.resume();
    setStatus("playing");
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const handleToggle = useCallback(async () => {
    if (status === "playing") return pause();
    if (status === "paused") return resume();
    await start();
  }, [pause, resume, start, status]);

  // Auto-play attempt on mount
  useEffect(() => {
    if (!autoPlay || triedAutoRef.current || !text) return;
    triedAutoRef.current = true;
    (async () => {
      try {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
        const probe = new Ctx({ sampleRate: SAMPLE_RATE });
        if (probe.state === "suspended") {
          await probe.resume().catch(() => {});
        }
        if (probe.state !== "running") {
          probe.close().catch(() => {});
          setNeedsTap(true);
          return;
        }
        probe.close().catch(() => {});
        start();
      } catch {
        setNeedsTap(true);
      }
    })();
     
  }, [autoPlay, text]);

  // If voice changes mid-play, restart
  useEffect(() => {
    if (status === "playing" || status === "paused") {
      start();
    }
     
  }, [voice]);

  const isLoading = status === "loading";
  const isPlaying = status === "playing";
  const pct = Math.round(progress * 100);
  const elapsed = duration * progress;
  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="w-full my-6 animate-fade-in">
      <div
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 p-5 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(20,14,30,0.95) 0%, rgba(40,20,10,0.9) 50%, rgba(15,10,25,0.95) 100%)",
          boxShadow:
            "0 10px 40px rgba(255,170,60,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(14px) saturate(140%)",
        }}
      >
        {/* subtle glow ring */}
        <div
          aria-hidden
          className="absolute -inset-px rounded-2xl opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 80% at 20% 0%, rgba(255,180,60,0.18), transparent 60%), radial-gradient(60% 80% at 100% 100%, rgba(255,80,60,0.14), transparent 60%)",
          }}
        />

        <div className="relative flex items-center gap-3 sm:gap-4">
          {/* Play / Pause */}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause voice review" : "Play voice review"}
            className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #ffb347 0%, #ff7a00 60%, #ff3b6b 100%)",
              boxShadow:
                "0 8px 22px rgba(255,122,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            )}
          </button>

          {/* Title + waveform */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-amber-300/90 font-semibold">
                AI Voice Review
              </span>
              <span className="ml-auto text-[10px] sm:text-xs text-amber-100/60 tabular-nums">
                {fmt(elapsed)} / {fmt(duration)}
              </span>
            </div>

            {/* Waveform bars */}
            <div className="flex items-end gap-[3px] h-10 sm:h-12">
              {bars.map((b, i) => {
                const h = Math.max(8, Math.min(100, b * 100));
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-[height] duration-75 ease-out"
                    style={{
                      height: `${h}%`,
                      background:
                        "linear-gradient(180deg, #ffd27a 0%, #ff7a00 60%, #ff3b6b 100%)",
                      opacity: isPlaying ? 1 : 0.45,
                      boxShadow: isPlaying ? "0 0 8px rgba(255,140,40,0.6)" : "none",
                    }}
                  />
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-100"
                style={{
                  width: `${pct}%`,
                  background:
                    "linear-gradient(90deg, #ffb347, #ff7a00, #ff3b6b)",
                  boxShadow: "0 0 10px rgba(255,140,40,0.6)",
                }}
              />
            </div>
          </div>

          {/* Voice picker + speaker icon */}
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
            <Volume2 className="w-5 h-5 text-amber-300/80" />
            <div className="flex bg-black/40 border border-white/10 rounded-full p-0.5">
              {(["female", "male"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${
                    voice === v
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow"
                      : "text-amber-100/70 hover:text-amber-100"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile voice picker */}
        <div className="sm:hidden mt-4 flex justify-center">
          <div className="flex bg-black/40 border border-white/10 rounded-full p-0.5">
            {(["female", "male"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all ${
                  voice === v
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                    : "text-amber-100/70"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {needsTap && (
          <div className="relative mt-3 text-center text-xs text-amber-200/80">
            Tap ▶ to start the cinematic voice review
          </div>
        )}
        {status === "error" && (
          <div className="relative mt-3 text-center text-xs text-red-300">
            Voice failed to load. Tap play to retry.
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceReviewPlayer;
