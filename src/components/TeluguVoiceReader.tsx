import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceReaderProps {
  text: string;
}

/**
 * Universal Voice Reader
 * - Works on mobile & desktop
 * - Converts Telugu → English, then speaks in English voice
 * - Uses Google Translate TTS (MP3 playback)
 */
export const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const { toast } = useToast();

  // Check if Telugu
  const isTelugu = (input: string) => /[\u0C00-\u0C7F]/.test(input);

  // Translate Telugu -> English
  const translateToEnglish = async (input: string): Promise<string> => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=te|en`
      );
      const data = await res.json();
      return data.responseData.translatedText || input;
    } catch (err) {
      console.error("Translation error:", err);
      return input;
    }
  };

  // Create a playable Google TTS MP3 URL
  const getEnglishVoiceUrl = (text: string) =>
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=en&client=tw-ob`;

  const handleRead = async () => {
    try {
      if (isPlaying) {
        const audio = document.getElementById("voice-audio") as HTMLAudioElement;
        if (audio) audio.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      let englishText = text;

      // Step 1: Translate Telugu to English if needed
      if (isTelugu(text)) {
        toast({ title: "Translating...", description: "Converting Telugu to English..." });
        englishText = await translateToEnglish(text);
      }
      setTranslatedText(englishText);

      // Step 2: Get voice URL
      const url = getEnglishVoiceUrl(englishText);
      setAudioUrl(url);

      // Step 3: Play voice
      const audio = new Audio(url);
      audio.id = "voice-audio";
      audio.play();
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast({ title: "Error", description: "Could not play audio", variant: "destructive" });
      };

      setIsLoading(false);
    } catch (error) {
      console.error("VoiceReader error:", error);
      toast({
        title: "Error",
        description: "Something went wrong while generating voice",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 space-y-3">
      <Button
        onClick={handleRead}
        disabled={isLoading}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 text-white font-semibold text-lg px-8 py-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-6 h-6 mr-2" /> Stop Voice
          </>
        ) : isLoading ? (
          <>
            <Languages className="w-6 h-6 mr-2" /> Generating...
          </>
        ) : (
          <>
            <Volume2 className="w-6 h-6 mr-2" /> Read in English
          </>
        )}
      </Button>

      {translatedText && (
        <p className="text-sm text-gray-600 italic text-center px-4">
          <strong>English:</strong> "{translatedText}"
        </p>
      )}

      {audioUrl && (
        <audio id="voice-audio" src={audioUrl} preload="auto" className="hidden"></audio>
      )}
    </div>
  );
};
