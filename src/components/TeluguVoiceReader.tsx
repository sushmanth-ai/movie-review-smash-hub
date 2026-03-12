import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface TeluguVoiceReaderProps {
  reviewText: string;
}

export const TeluguVoiceReader: React.FC<TeluguVoiceReaderProps> = ({
  reviewText
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cancelledRef = useRef(false);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const resumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    if (resumeTimerRef.current) {
      clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    utterancesRef.current = [];
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang.startsWith("en-IN")) ||
      voices.find((v) => v.lang.includes("IN")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null);

  }, []);

  const splitIntoChunks = useCallback((text: string): string[] => {
    // Split on sentence-ending punctuation
    const sentences = text.
    split(/(?<=[.!?:।])\s+/).
    filter((s) => s.trim().length > 0);

    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length > 120) {
        // Split long sentences on commas
        const parts = sentence.split(/[,…]+\s*/);
        let current = "";
        for (const part of parts) {
          if ((current + part).length > 120 && current.trim()) {
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

  const speakChunks = useCallback(
    (chunks: string[]) => {
      const synth = window.speechSynthesis;
      const voice = getVoice();
      let index = 0;
      cancelledRef.current = false;

      // Mobile Chrome workaround: resume every 5s to prevent 15s pause
      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = setInterval(() => {
        if (synth.speaking && !synth.paused) {
          synth.resume();
        }
      }, 5000);

      const speakNext = () => {
        if (cancelledRef.current || index >= chunks.length) {
          setIsPlaying(false);
          if (resumeTimerRef.current) {
            clearInterval(resumeTimerRef.current);
            resumeTimerRef.current = null;
          }
          return;
        }

        const chunk = chunks[index].trim();
        if (!chunk) {
          index++;
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
          index++;
          // Small gap between chunks for natural pacing
          setTimeout(speakNext, 100);
        };

        utter.onerror = (e) => {
          if (e.error !== "interrupted" && e.error !== "canceled") {
            console.error("Speech error:", e.error);
          }
          index++;
          setTimeout(speakNext, 150);
        };

        utterancesRef.current.push(utter);
        synth.speak(utter);
      };

      setIsPlaying(true);
      speakNext();
    },
    [getVoice]
  );

  const convertToTenglish = useCallback(
    async (text: string): Promise<string> => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !anonKey) return text;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`
          },
          body: JSON.stringify({ text })
        }
      );

      if (!response.ok) {
        throw new Error(`Edge function returned ${response.status}`);
      }

      const data = await response.json();
      return data.teluguText || text;
    },
    []
  );

  const handleToggle = async () => {
    if (isPlaying) {
      cleanup();
      return;
    }

    if (!("speechSynthesis" in window)) {
      toast({
        title: t("notSupported"),
        description: t("voiceNotSupported"),
        variant: "destructive"
      });
      return;
    }

    const synth = window.speechSynthesis;

    // CRITICAL: Cancel any existing speech and unlock audio on mobile
    // This MUST happen synchronously in the click handler (user gesture)
    synth.cancel();

    // Speak a silent utterance to unlock speech on iOS/Android
    const silentUtter = new SpeechSynthesisUtterance("");
    silentUtter.volume = 0;
    synth.speak(silentUtter);

    // Wait for voices to load (mobile browsers are slow)
    if (synth.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        const onVoicesChanged = () => {
          resolve();
          synth.removeEventListener("voiceschanged", onVoicesChanged);
        };
        synth.addEventListener("voiceschanged", onVoicesChanged);
        // Fallback timeout
        setTimeout(resolve, 3000);
      });
    }

    setIsLoading(true);
    cancelledRef.current = false;

    try {
      const tenglishText = await convertToTenglish(reviewText);
      if (cancelledRef.current) return;

      setIsLoading(false);

      // Cancel the silent utterance before starting real speech
      synth.cancel();

      // Small delay to ensure cancel takes effect
      await new Promise((r) => setTimeout(r, 50));

      const chunks = splitIntoChunks(tenglishText);
      speakChunks(chunks);
    } catch (err) {
      console.warn("Tenglish conversion failed, using original:", err);
      if (cancelledRef.current) return;

      setIsLoading(false);
      synth.cancel();
      await new Promise((r) => setTimeout(r, 50));

      const chunks = splitIntoChunks(reviewText);
      speakChunks(chunks);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      













      
    </div>);

};