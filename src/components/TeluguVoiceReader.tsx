import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface TeluguVoiceReaderProps {
  reviewText: string;
}

export const TeluguVoiceReader: React.FC<TeluguVoiceReaderProps> = ({
  reviewText,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const cancelledRef = useRef(false);
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1500);
  }, []);

  const clearResumeInterval = () => {
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  };

  const stopSpeech = () => {
    cancelledRef.current = true;
    clearResumeInterval();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const getVoice = (): SpeechSynthesisVoice | null => {
    return (
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang.startsWith("en-IN")) ||
      voices.find((v) => v.lang.includes("IN")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  };

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const voice = getVoice();

    // Split into chunks for mobile reliability (max ~200 chars)
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((c) => c.trim().length > 0);

    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length > 200) {
        const parts = sentence.split(/,\s*/);
        let current = "";
        for (const part of parts) {
          if ((current + part).length > 200 && current) {
            chunks.push(current.trim());
            current = part;
          } else {
            current = current ? current + ", " + part : part;
          }
        }
        if (current.trim()) chunks.push(current.trim());
      } else {
        chunks.push(sentence);
      }
    }

    if (chunks.length === 0) {
      setIsPlaying(false);
      return;
    }

    let i = 0;
    cancelledRef.current = false;

    const speakNext = () => {
      if (cancelledRef.current || i >= chunks.length) {
        setIsPlaying(false);
        clearResumeInterval();
        return;
      }

      const chunk = chunks[i].trim();
      if (!chunk) {
        i++;
        speakNext();
        return;
      }

      const utter = new SpeechSynthesisUtterance(chunk);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "en-IN";
      }
      utter.rate = 0.9;
      utter.pitch = 1;
      utter.volume = 1;

      utter.onend = () => {
        i++;
        setTimeout(speakNext, 150);
      };
      utter.onerror = (e) => {
        if (e.error !== "interrupted") {
          console.error("Speech error:", e.error);
        }
        i++;
        setTimeout(speakNext, 150);
      };

      synth.speak(utter);
    };

    setIsPlaying(true);

    // Mobile Chrome workaround: periodically call resume()
    clearResumeInterval();
    resumeIntervalRef.current = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.resume();
      }
    }, 5000);

    speakNext();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggle = async () => {
    if (isPlaying) {
      stopSpeech();
      return;
    }

    if (!("speechSynthesis" in window)) {
      toast({
        title: t("notSupported"),
        description: t("voiceNotSupported"),
        variant: "destructive",
      });
      return;
    }

    // CRITICAL: On mobile, SpeechSynthesis must be triggered in user gesture context.
    // We MUST speak something synchronously first to unlock the audio,
    // then we can speak the real text after the async fetch.
    const synth = window.speechSynthesis;
    synth.cancel();

    // Unlock speech synthesis with a silent utterance (synchronous, in gesture context)
    const unlockUtter = new SpeechSynthesisUtterance(".");
    unlockUtter.volume = 0.01; // near-silent but not 0 (some browsers ignore volume=0)
    unlockUtter.rate = 10; // speak as fast as possible
    const voice = getVoice();
    if (voice) {
      unlockUtter.voice = voice;
      unlockUtter.lang = voice.lang;
    } else {
      unlockUtter.lang = "en-IN";
    }
    synth.speak(unlockUtter);

    setIsLoading(true);
    cancelledRef.current = false;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: reviewText }),
        }
      );

      if (cancelledRef.current) {
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.teluguText) {
          setIsLoading(false);
          // Cancel the unlock utterance before speaking real text
          synth.cancel();
          speakText(data.teluguText);
          return;
        }
      }

      // Fallback: speak original text
      console.warn("Edge function failed, using original text");
      setIsLoading(false);
      synth.cancel();
      speakText(reviewText);
    } catch (err) {
      if (cancelledRef.current) {
        setIsLoading(false);
        return;
      }
      console.warn("Edge function error:", err);
      setIsLoading(false);
      synth.cancel();
      speakText(reviewText);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        {isLoading
          ? t("loading")
          : isPlaying
          ? t("stop")
          : t("reviewVinandi")}
      </Button>
    </div>
  );
};
