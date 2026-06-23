import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createParser } from "eventsource-parser";
import { Play, Pause, Volume2, VolumeX, Loader2, Film, Maximize2, Minimize2 } from "lucide-react";

interface CinematicReviewPlayerProps {
  title: string;
  poster: string;
  images?: string[];
  script: string;
  /** Lines used for the subtitle track. Falls back to sentence-split of `script`. */
  subtitleLines?: string[];
  rating?: number | string;
  voice?: "male" | "female";
  autoPlay?: boolean;
}

const SAMPLE_RATE = 24000;
// ~15 chars/sec is a decent fallback for gpt-4o-mini-tts at speed=1.0
const CHARS_PER_SECOND = 15;

const splitIntoLines = (s: string): string[] => {
  if (!s) return [];
  const out = s
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((l) => l.trim())
    .filter(Boolean) ?? [s];
  // Keep lines reasonably short for subtitle display
  const finalOut: string[] = [];
  for (const line of out) {
    if (line.length <= 90) {
      finalOut.push(line);
    } else {
      const parts = line.split(/,\s+/);
      let buf = "";
      for (const p of parts) {
        if ((buf + ", " + p).trim().length > 90) {
          if (buf) finalOut.push(buf.trim());
          buf = p;
        } else {
          buf = buf ? buf + ", " + p : p;
        }
      }
      if (buf) finalOut.push(buf.trim());
    }
  }
  return finalOut;
};

export const CinematicReviewPlayer: React.FC<CinematicReviewPlayerProps> = ({
  title,
  poster,
  images,
  script,
  subtitleLines,
  rating,
  voice: voiceProp = "male",
  autoPlay = true,
}) => {
  const slideshow = useMemo(() => {
    const arr = [poster, ...(images ?? []).filter(Boolean)].filter(Boolean) as string[];
    return arr.length > 0 ? arr : [poster];
  }, [poster, images]);

  const lines = useMemo(
    () => (subtitleLines && subtitleLines.length > 0 ? subtitleLines : splitIntoLines(script)),
    [subtitleLines, script]
  );

  // Char ranges per line (cumulative) to pick "current" line from elapsed audio time
  const lineMeta = useMemo(() => {
    let cum = 0;
    return lines.map((line) => {
      const start = cum;
      cum += line.length + 1;
      return { line, start, end: cum, words: line.split(/\s+/).filter(Boolean) };
    });
  }, [lines]);
  const totalChars = lineMeta[lineMeta.length - 1]?.end ?? Math.max(1, script.length);

  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused" | "ended" | "error">("idle");
  const [voice, setVoice] = useState<"male" | "female">(voiceProp);
  const [needsTap, setNeedsTap] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bars, setBars] = useState<number[]>(() => Array(36).fill(0.08));
  const [elapsed, setElapsed] = useState(0);
  const [streamDur, setStreamDur] = useState(0); // duration of buffered/scheduled audio so far
  const [sceneIdx, setSceneIdx] = useState(0);
  const [kenBurnsIdx, setKenBurnsIdx] = useState(0);
  const [isFs, setIsFs] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const musicNodesRef = useRef<{ oscs: OscillatorNode[]; lfo?: OscillatorNode } | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const pendingRef = useRef<Uint8Array>(new Uint8Array(0));
  const playheadRef = useRef(0);
  const startedAtRef = useRef(0);
  const totalDurRef = useRef(0);
  const finishedStreamRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);
  const triedAutoRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- Cleanup ----------------------------------------------------------
  const stopMusic = useCallback(() => {
    musicNodesRef.current?.oscs.forEach((o) => { try { o.stop(); } catch {} });
    try { musicNodesRef.current?.lfo?.stop(); } catch {}
    musicNodesRef.current = null;
  }, []);

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
    totalDurRef.current = 0;
    finishedStreamRef.current = false;
    stopMusic();
    setElapsed(0);
    setStreamDur(0);
  }, [stopMusic]);

  useEffect(
    () => () => {
      cleanup();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [cleanup]
  );

  // --- Audio graph setup ------------------------------------------------
  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx: AudioContext = new Ctx({ sampleRate: SAMPLE_RATE });
      const voiceGain = ctx.createGain();
      const musicGain = ctx.createGain();
      const master = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      voiceGain.gain.value = 1.0;
      musicGain.gain.value = 0.10; // soft cinematic pad, well under narration
      master.gain.value = 1.0;
      voiceGain.connect(analyser);
      musicGain.connect(master);
      analyser.connect(master);
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      voiceGainRef.current = voiceGain;
      musicGainRef.current = musicGain;
      masterGainRef.current = master;
      analyserRef.current = analyser;
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const startMusic = useCallback(() => {
    const ctx = ctxRef.current!;
    const out = musicGainRef.current!;
    if (musicNodesRef.current) return;
    // Cinematic pad: 3 detuned sine oscillators (root + fifth + octave), slow LFO on filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.6;
    filter.connect(padGain);
    padGain.connect(out);
    const freqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4 — open Asus chord
    const oscs: OscillatorNode[] = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 === 0 ? "sine" : "triangle";
      o.frequency.value = f + (Math.random() * 1.5 - 0.75); // tiny detune
      const og = ctx.createGain();
      og.gain.value = i === 0 ? 0.5 : 0.25;
      o.connect(og);
      og.connect(filter);
      o.start();
      return o;
    });
    // Slow LFO on filter cutoff for breathing motion
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    musicNodesRef.current = { oscs, lfo };
  }, []);

  // --- Voice streaming --------------------------------------------------
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
    src.connect(voiceGainRef.current!);
    if (playheadRef.current === 0) {
      playheadRef.current = ctx.currentTime + 0.08;
      startedAtRef.current = playheadRef.current;
    } else {
      playheadRef.current = Math.max(playheadRef.current, ctx.currentTime);
    }
    src.start(playheadRef.current);
    playheadRef.current += buf.duration;
    totalDurRef.current = playheadRef.current - startedAtRef.current;
    setStreamDur(totalDurRef.current);
    sourcesRef.current.push(src);
    src.onended = () => {
      sourcesRef.current = sourcesRef.current.filter((s) => s !== src);
      if (finishedStreamRef.current && sourcesRef.current.length === 0) {
        setStatus("ended");
      }
    };
  }, []);

  // --- RAF loop: bars + elapsed + scene rotation ------------------------
  const animate = useCallback(() => {
    const analyser = analyserRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !ctx) return;
    // bars
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const N = 36;
    const bucket = Math.floor(data.length / N);
    const next: number[] = [];
    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (let j = 0; j < bucket; j++) sum += data[i * bucket + j];
      next.push(Math.max(0.06, sum / bucket / 255));
    }
    setBars(next);

    if (startedAtRef.current > 0) {
      const e = Math.max(0, ctx.currentTime - startedAtRef.current);
      const cap = finishedStreamRef.current ? totalDurRef.current : Math.max(totalDurRef.current, e);
      setElapsed(Math.min(e, cap));
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  // --- Start playback ---------------------------------------------------
  const start = useCallback(async () => {
    cleanup();
    setStatus("loading");
    setNeedsTap(false);
    try {
      const ctx = await ensureCtx();
      if (ctx.state !== "running") {
        setStatus("idle");
        setNeedsTap(true);
        return;
      }

      // Kick off cinematic pad immediately for atmosphere
      startMusic();

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
        body: JSON.stringify({ text: script, voice }),
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
      console.error("CinematicReviewPlayer error:", err);
      setStatus("error");
    }
  }, [animate, cleanup, ensureCtx, scheduleChunk, script, startMusic, voice]);

  // --- Controls ---------------------------------------------------------
  const togglePlay = useCallback(async () => {
    const ctx = ctxRef.current;
    if (status === "playing" && ctx) {
      await ctx.suspend();
      setStatus("paused");
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else if (status === "paused" && ctx) {
      await ctx.resume();
      setStatus("playing");
      rafRef.current = requestAnimationFrame(animate);
    } else {
      await start();
    }
  }, [animate, start, status]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (masterGainRef.current && ctxRef.current) {
        masterGainRef.current.gain.setTargetAtTime(next ? 0 : 1, ctxRef.current.currentTime, 0.05);
      }
      return next;
    });
  }, []);

  const toggleFs = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.().catch(() => {});
    } else {
      await document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // --- Auto-play attempt ------------------------------------------------
  useEffect(() => {
    if (!autoPlay || triedAutoRef.current || !script) return;
    triedAutoRef.current = true;
    (async () => {
      try {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
        const probe = new Ctx({ sampleRate: SAMPLE_RATE });
        if (probe.state === "suspended") await probe.resume().catch(() => {});
        const ok = probe.state === "running";
        probe.close().catch(() => {});
        if (!ok) { setNeedsTap(true); return; }
        start();
      } catch {
        setNeedsTap(true);
      }
    })();
     
  }, [autoPlay, script]);

  // Restart on voice change
  useEffect(() => {
    if (status === "playing" || status === "paused") start();
     
  }, [voice]);

  // --- Derived: subtitle line, karaoke word, scene index ---------------
  const estimatedTotal = useMemo(
    () => Math.max(streamDur, totalChars / CHARS_PER_SECOND),
    [streamDur, totalChars]
  );
  const charPos = Math.min(totalChars, (elapsed / Math.max(0.001, estimatedTotal)) * totalChars);

  const activeLineIdx = useMemo(() => {
    if (!lineMeta.length) return 0;
    for (let i = 0; i < lineMeta.length; i++) {
      if (charPos < lineMeta[i].end) return i;
    }
    return lineMeta.length - 1;
  }, [charPos, lineMeta]);

  const activeLine = lineMeta[activeLineIdx];
  const wordPct = activeLine
    ? Math.max(0, Math.min(1, (charPos - activeLine.start) / Math.max(1, activeLine.end - activeLine.start)))
    : 0;
  const activeWordIdx = activeLine ? Math.min(activeLine.words.length - 1, Math.floor(wordPct * activeLine.words.length)) : 0;

  // Rotate scene image based on time (every ~4s)
  useEffect(() => {
    if (slideshow.length <= 1) return;
    const idx = Math.floor(elapsed / 4.0) % slideshow.length;
    setSceneIdx(idx);
    setKenBurnsIdx((k) => (idx !== sceneIdx ? k + 1 : k));
     
  }, [elapsed, slideshow.length]);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const progressPct = estimatedTotal > 0 ? Math.min(100, (elapsed / estimatedTotal) * 100) : 0;

  const kenBurnsClass = kenBurnsIdx % 4;

  return (
    <div className="w-full my-6 animate-fade-in">
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-amber-500/40 shadow-[0_20px_60px_-15px_rgba(255,140,40,0.35)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,4,16,1) 0%, rgba(20,10,8,1) 100%)",
          aspectRatio: isFs ? undefined : "16 / 9",
          height: isFs ? "100vh" : undefined,
        }}
      >
        {/* --- Slideshow layer with Ken Burns --- */}
        <div className="absolute inset-0">
          {slideshow.map((src, i) => {
            const active = i === sceneIdx;
            return (
              <img
                key={src + i}
                src={src}
                alt={`${title} scene ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-in-out ${
                  active ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  animation: active
                    ? `cinKenBurns${kenBurnsClass} 9s ease-in-out forwards`
                    : "none",
                  willChange: "transform",
                }}
                draggable={false}
              />
            );
          })}
          {/* Cinematic vignette + bottom shadow for subtitles */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          {/* Film grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
            }}
          />
        </div>

        {/* --- Top bar: title + REC pill --- */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-amber-400/30">
            <Film className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-bold text-amber-200">
              SM Reviews · AI Cinematic
            </span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/85 border border-red-300/40">
            <span className={`w-2 h-2 rounded-full bg-white ${isPlaying ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-bold text-white tracking-widest">LIVE</span>
          </div>
        </div>

        {/* --- Movie title huge cinematic --- */}
        <div className="absolute top-14 sm:top-16 left-0 right-0 px-4 sm:px-6 z-10 pointer-events-none">
          <h2
            className="text-white font-black leading-tight drop-shadow-[0_3px_18px_rgba(0,0,0,0.85)]"
            style={{
              fontSize: "clamp(20px, 3.6vw, 40px)",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 16px rgba(0,0,0,0.85)",
            }}
          >
            {title}
          </h2>
          {rating !== undefined && rating !== "" && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-400/95 text-black font-extrabold text-xs sm:text-sm shadow-lg">
              ★ {typeof rating === "number" ? rating.toFixed(1) : rating} / 5
            </div>
          )}
        </div>

        {/* --- Waveform overlay (bottom of frame, above subtitles) --- */}
        <div className="absolute left-0 right-0 bottom-24 sm:bottom-28 px-6 sm:px-10 z-10 pointer-events-none">
          <div className="flex items-end justify-center gap-[2px] sm:gap-[3px] h-10 sm:h-14">
            {bars.map((b, i) => {
              const h = Math.max(6, Math.min(100, b * 100));
              return (
                <div
                  key={i}
                  className="w-[3px] sm:w-[4px] rounded-full transition-[height] duration-75 ease-out"
                  style={{
                    height: `${h}%`,
                    background:
                      "linear-gradient(180deg, #ffe7a3 0%, #ffb347 45%, #ff5e3a 100%)",
                    opacity: isPlaying ? 0.95 : 0.35,
                    boxShadow: isPlaying ? "0 0 10px rgba(255,140,40,0.55)" : "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* --- Karaoke subtitles --- */}
        <div className="absolute left-0 right-0 bottom-12 sm:bottom-16 px-4 sm:px-10 z-10 pointer-events-none">
          {activeLine && (
            <div
              key={activeLineIdx}
              className="mx-auto max-w-3xl text-center animate-fade-in"
              style={{ animationDuration: "320ms" }}
            >
              <p
                className="inline-block px-4 py-2 rounded-lg bg-black/55 backdrop-blur-sm"
                style={{
                  fontSize: "clamp(14px, 2.2vw, 22px)",
                  lineHeight: 1.35,
                  fontWeight: 600,
                }}
              >
                {activeLine.words.map((w, i) => {
                  const spoken = i < activeWordIdx;
                  const current = i === activeWordIdx;
                  return (
                    <span
                      key={i}
                      style={{
                        color: current ? "#ffd166" : spoken ? "#ffffff" : "rgba(255,255,255,0.55)",
                        textShadow: current
                          ? "0 0 12px rgba(255,200,80,0.85), 0 1px 3px rgba(0,0,0,0.9)"
                          : "0 1px 3px rgba(0,0,0,0.9)",
                        transition: "color 120ms ease",
                        marginRight: "0.32em",
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </p>
            </div>
          )}
        </div>

        {/* --- Bottom control bar --- */}
        <div className="absolute left-0 right-0 bottom-0 z-20 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-t from-black/85 via-black/55 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #ffb347 0%, #ff7a00 60%, #ff3b6b 100%)",
                boxShadow: "0 6px 18px rgba(255,122,0,0.5)",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>

            <span className="text-[10px] sm:text-xs text-white/85 tabular-nums shrink-0">
              {fmt(elapsed)} / {fmt(estimatedTotal)}
            </span>

            {/* progress */}
            <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-100"
                style={{
                  width: `${progressPct}%`,
                  background:
                    "linear-gradient(90deg, #ffd27a, #ff7a00, #ff3b6b)",
                  boxShadow: "0 0 10px rgba(255,140,40,0.6)",
                }}
              />
            </div>

            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex bg-black/55 border border-white/15 rounded-full p-0.5">
              {(["male", "female"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${
                    voice === v
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                      : "text-amber-100/80 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={toggleFs}
              aria-label={isFs ? "Exit fullscreen" : "Fullscreen"}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isFs ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tap-to-start overlay if autoplay blocked */}
        {needsTap && status !== "playing" && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/55 backdrop-blur-sm"
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #ffb347 0%, #ff7a00 60%, #ff3b6b 100%)",
                boxShadow: "0 14px 40px rgba(255,122,0,0.55)",
              }}
            >
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
            <p className="text-white font-bold tracking-wider text-sm sm:text-base">
              Tap to start cinematic review
            </p>
          </button>
        )}

        {status === "error" && (
          <div className="absolute inset-x-0 bottom-16 z-30 text-center text-xs text-red-200">
            Voice failed to load. Tap ▶ to retry.
          </div>
        )}
      </div>

      <style>{`
        @keyframes cinKenBurns0 {
          0%   { transform: scale(1.05) translate(0,0); }
          100% { transform: scale(1.18) translate(-2%, -1.5%); }
        }
        @keyframes cinKenBurns1 {
          0%   { transform: scale(1.18) translate(-2%, -1%); }
          100% { transform: scale(1.05) translate(1.5%, 1%); }
        }
        @keyframes cinKenBurns2 {
          0%   { transform: scale(1.08) translate(1%, -1%); }
          100% { transform: scale(1.2) translate(-1.5%, 1.5%); }
        }
        @keyframes cinKenBurns3 {
          0%   { transform: scale(1.2) translate(-1%, 1%); }
          100% { transform: scale(1.06) translate(1%, -1%); }
        }
      `}</style>
    </div>
  );
};

export default CinematicReviewPlayer;
