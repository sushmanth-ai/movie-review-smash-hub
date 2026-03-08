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
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const stopSpeech = () => {
    cancelledRef.current = true;
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
    const voice = getVoice();

    // Split by sentences for reliability
    const chunks = text
      .split(/(?<=[.!?])\s+/)
      .filter((c) => c.trim().length > 0);

    let i = 0;
    cancelledRef.current = false;

    const speakNext = () => {
      if (cancelledRef.current || i >= chunks.length) {
        setIsPlaying(false);
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
        setTimeout(speakNext, 100);
      };
      utter.onerror = (e) => {
        console.error("Speech error:", e);
        i++;
        setTimeout(speakNext, 100);
      };

      synth.speak(utter);
      // Chrome mobile workaround
      setTimeout(() => synth.resume(), 200);
    };

    setIsPlaying(true);
    speakNext();
  };

  const handleToggle = async () => {
    if (isPlaying) {
      stopSpeech();
      return;
    }

    if (!("speechSynthesis" in window)) {
      toast({
        title: "Not Supported",
        description: "Voice playback is not supported on this device.",
        variant: "destructive",
      });
      return;
    }

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
          ? "Loading..."
          : isPlaying
          ? "🔇 Stop"
          : "🔊 Review Vinandi"}
      </Button>
    </div>
  );
};
