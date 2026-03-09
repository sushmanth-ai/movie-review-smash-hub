import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const cancelledRef = useRef(false);
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const clearResumeInterval = useCallback(() => {
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    cancelledRef.current = true;
    clearResumeInterval();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [clearResumeInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang.startsWith("en-IN")) ||
      voices.find((v) => v.lang.includes("IN")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  }, []);

  const splitIntoChunks = useCallback((text: string): string[] => {
    // Split on sentence endings
    const sentences = text
      .split(/(?<=[.!?:।])\s+/)
      .filter((s) => s.trim().length > 0);

    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length > 150) {
        // Split long sentences on commas or ellipsis
        const parts = sentence.split(/[,…]+\s*/);
        let current = "";
        for (const part of parts) {
          if ((current + part).length > 150 && current.trim()) {
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
    return chunks.filter((c) => c.length > 0);
  }, []);

  const speakText = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const chunks = splitIntoChunks(text);
    let i = 0;
    cancelledRef.current = false;

    const voice = getVoice();

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
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.volume = 1;

      utter.onend = () => {
        i++;
        setTimeout(speakNext, 120);
      };
      utter.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.error("Speech error:", e.error);
        }
        i++;
        setTimeout(speakNext, 200);
      };

      synth.speak(utter);
    };

    setIsPlaying(true);

    // Mobile Chrome workaround: Chrome pauses speech after ~15 seconds
    clearResumeInterval();
    resumeIntervalRef.current = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.resume();
      }
    }, 5000);

    speakNext();
  }, [getVoice, splitIntoChunks, clearResumeInterval]);

  const convertToTenglish = useCallback(async (text: string): Promise<string> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) {
      return text;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Edge function returned ${response.status}`);
    }

    const data = await response.json();
    return data.teluguText || text;
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

    // Mobile browsers need user gesture to init speech
    const synth = window.speechSynthesis;
    synth.cancel();
    const silentUtter = new SpeechSynthesisUtterance("");
    silentUtter.volume = 0;
    synth.speak(silentUtter);

    // Ensure voices are loaded (mobile can be slow)
    if (synth.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        const checkVoices = () => {
          if (synth.getVoices().length > 0) resolve();
          else setTimeout(checkVoices, 100);
        };
        checkVoices();
        setTimeout(resolve, 2000); // Max wait 2s
      });
    }

    setIsLoading(true);

    try {
      const tenglishText = await convertToTenglish(reviewText);
      if (cancelledRef.current) return;
      setIsLoading(false);
      speakText(tenglishText);
    } catch (err) {
      console.warn("Tenglish conversion failed, using original:", err);
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
        {isLoading ? t("loading") : isPlaying ? t("stop") : t("reviewVinandi")}
      </Button>
    </div>
  );
};
