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
    // Some mobile browsers need a delay
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
    // Tenglish is Roman script, so English-India voice works best
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
    // Cancel any ongoing speech first
    synth.cancel();

    const voice = getVoice();

    // Split into shorter chunks for mobile reliability (max ~200 chars)
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((c) => c.trim().length > 0);

    // Further split long sentences
    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length > 200) {
        // Split on commas or mid-point
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
        // "interrupted" is normal when cancelling
        if (e.error !== "interrupted") {
          console.error("Speech error:", e.error);
        }
        i++;
        setTimeout(speakNext, 150);
      };

      synth.speak(utter);
    };

    setIsPlaying(true);

    // Mobile Chrome workaround: Chrome pauses speech after ~15 seconds
    // Periodically call resume() to keep it going
    clearResumeInterval();
    resumeIntervalRef.current = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.resume();
      }
      // If speech stopped unexpectedly, clean up
      if (!synth.speaking && !cancelledRef.current && i < chunks.length) {
        // Try to resume by speaking next chunk
        speakNext();
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
        title: t('notSupported'),
        description: t('voiceNotSupported'),
        variant: "destructive",
      });
      return;
    }

    // Mobile browsers require user gesture to init speech - do a silent utterance
    const silentUtter = new SpeechSynthesisUtterance("");
    silentUtter.volume = 0;
    window.speechSynthesis.speak(silentUtter);

    setIsLoading(true);

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

      if (response.ok) {
        const data = await response.json();
        if (data.teluguText) {
          setIsLoading(false);
          speakText(data.teluguText);
          return;
        }
      }

      // If edge function fails, speak original text
      console.warn("Edge function failed, using original text");
      setIsLoading(false);
      speakText(reviewText);
    } catch (err) {
      console.warn("Edge function error:", err);
      setIsLoading(false);
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
          ? t('loading')
          : isPlaying
          ? t('stop')
          : t('reviewVinandi')}
      </Button>
    </div>
  );
};
