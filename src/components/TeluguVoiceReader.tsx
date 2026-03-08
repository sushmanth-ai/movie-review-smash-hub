import React, { useState, useRef } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Also stop browser speech synthesis if running
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playWithEdgeFunction = async (): Promise<boolean> => {
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

      if (!response.ok) {
        console.error("Edge function TTS failed:", response.status);
        return false;
      }

      const data = await response.json();
      if (!data.audioContent) return false;

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
      return true;
    } catch (error) {
      console.error("Edge function TTS error:", error);
      return false;
    }
  };

  const playWithBrowserTTS = (): boolean => {
    if (!("speechSynthesis" in window)) return false;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const teluguVoice =
      voices.find((v) => v.lang.toLowerCase().includes("te")) ||
      voices.find((v) => v.lang.toLowerCase().includes("hi-in")) ||
      voices.find((v) => v.lang.toLowerCase().includes("en-in")) ||
      voices[0];

    if (!teluguVoice) return false;

    // Split into chunks for reliability on mobile
    const chunks = reviewText.match(/.{1,200}[.!?।]*/g) || [reviewText];
    let i = 0;

    const speakNext = () => {
      if (i >= chunks.length) {
        setIsPlaying(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(chunks[i]);
      utter.voice = teluguVoice;
      utter.lang = teluguVoice.lang;
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.volume = 1;
      utter.onend = () => {
        i++;
        setTimeout(speakNext, 50);
      };
      utter.onerror = () => setIsPlaying(false);
      synth.speak(utter);
      // Chrome mobile fix: resume after pause
      setTimeout(() => synth.resume(), 250);
    };

    speakNext();
    return true;
  };

  const handleToggle = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);

    // Try edge function (Google Cloud TTS) first, then browser fallback
    const edgeSuccess = await playWithEdgeFunction();

    if (!edgeSuccess) {
      console.log("Falling back to browser TTS");
      // Preload voices on first attempt
      if ("speechSynthesis" in window && window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.getVoices();
        await new Promise((r) => setTimeout(r, 500));
      }
      const browserSuccess = playWithBrowserTTS();
      if (!browserSuccess) {
        setIsPlaying(false);
        toast({
          title: "Voice Not Available",
          description: "Audio playback is not supported on this device.",
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex justify-center mt-6">
      <Button
        onClick={handleToggle}
        disabled={isLoading && !isPlaying}
        variant="outline"
        className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
      >
        {isLoading && !isPlaying ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        {isLoading && !isPlaying
          ? "Loading..."
          : isPlaying
          ? "🔇 Stop Voice"
          : "🔊 Listen in Telugu"}
      </Button>
    </div>
  );
};
