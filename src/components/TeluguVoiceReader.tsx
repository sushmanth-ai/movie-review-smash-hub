import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  // Preload voices
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

  const getTeluguVoice = (): SpeechSynthesisVoice | null => {
    // Priority: Telugu > Hindi > any Indian voice
    return (
      voices.find((v) => v.lang.startsWith("te")) ||
      voices.find((v) => v.lang.startsWith("hi")) ||
      voices.find((v) => v.lang.includes("IN")) ||
      null
    );
  };

  const speakTeluguText = (teluguText: string) => {
    const synth = window.speechSynthesis;
    const voice = getTeluguVoice();

    // Split into smaller chunks for mobile reliability
    const chunks = teluguText.match(/[^।.!?]+[।.!?]*/g) || [teluguText];
    let i = 0;
    cancelledRef.current = false;

    const speakNext = () => {
      if (cancelledRef.current || i >= chunks.length) {
        setIsPlaying(false);
        return;
      }

      const chunk = chunks[i].trim();
      if (!chunk) { i++; speakNext(); return; }

      const utter = new SpeechSynthesisUtterance(chunk);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "te-IN";
      }
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.volume = 1;

      utter.onend = () => {
        i++;
        setTimeout(speakNext, 80);
      };
      utter.onerror = (e) => {
        console.error("Speech error:", e);
        setIsPlaying(false);
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
      // Call edge function to translate review to pure Telugu
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
          speakTeluguText(data.teluguText);
          return;
        }
      }

      console.warn("Edge function failed, using original text");
    } catch (err) {
      console.warn("Edge function error:", err);
    }

    // Fallback: speak original text with Telugu voice
    setIsLoading(false);
    speakTeluguText(reviewText);
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
          ? "తెలుగులో మారుస్తోంది..."
          : isPlaying
          ? "🔇 ఆపు"
          : "🔊 తెలుగులో వినండి"}
      </Button>
    </div>
  );
};
