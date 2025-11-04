import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Languages, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HybridVoiceReaderProps {
  text: string;
}

export const HybridVoiceReader: React.FC<HybridVoiceReaderProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Detect mobile browser
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const allVoices = synth.getVoices();
      if (allVoices.length > 0) setVoices(allVoices);
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const containsTelugu = (input: string): boolean => /[\u0C00-\u0C7F]/.test(input);

  // 🔧 Split and translate Telugu → English safely
  const translateToEnglish = async (input: string): Promise<string> => {
    try {
      // Split text into chunks <= 400 characters
      const chunks: string[] = [];
      for (let i = 0; i < input.length; i += 400) {
        chunks.push(input.slice(i, i + 400));
      }

      let translated = "";

      for (const chunk of chunks) {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            chunk
          )}&langpair=te|en`
        );
        const data = await response.json();
        translated += " " + (data.responseData.translatedText || chunk);
        // Small delay to avoid rate limit
        await new Promise((r) => setTimeout(r, 200));
      }

      return translated.trim();
    } catch (error) {
      console.error("Translation error:", error);
      return input;
    }
  };

  const speakEnglish = (textToSpeak: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const englishVoice =
      voices.find((v) => v.lang.toLowerCase().includes("en-in")) ||
      voices.find((v) => v.lang.toLowerCase().includes("en-gb")) ||
      voices.find((v) => v.lang.toLowerCase().includes("en-us")) ||
      voices[0];

    if (!englishVoice) {
      toast({
        title: "No English voice available",
        description: "Please enable text-to-speech voices in your browser.",
        variant: "destructive",
      });
      return;
    }

    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.voice = englishVoice;
    utter.lang = englishVoice.lang;
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;

    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utter);
  };

  const handleRead = async () => {
    if (typeof window === "undefined") return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    let textToRead = text;

    if (containsTelugu(text)) {
      toast({
        title: "Translating...",
        description: "Converting Telugu to English for voice playback.",
      });
      textToRead = await translateToEnglish(text);
      setTranslatedText(textToRead);
    } else {
      setTranslatedText(text);
    }

    setIsLoading(false);

    // 🖥️ Desktop: Speak directly
    if (!isMobile) {
      speakEnglish(textToRead);
      return;
    }

    // 📱 Mobile: Create downloadable audio link
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      textToRead.substring(0, 200) // Limit Google TTS input
    )}&tl=en&client=tw-ob`;

    toast({
      title: "Voice Ready 🎧",
      description: "Tap below to listen or download the voice file.",
      action: (
        <a
          href={ttsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 font-semibold mt-2"
        >
          <Download className="w-4 h-4 mr-1" /> Play / Download Voice
        </a>
      ),
    });
  };

  return (
    <div className="flex flex-col items-center mt-6 space-y-3">
      <Button
        onClick={handleRead}
        disabled={isLoading}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 text-white font-semibold text-lg px-8 py-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="w-6 h-6 mr-2" /> Stop Voice
          </>
        ) : isLoading ? (
          <>
            <Languages className="w-6 h-6 mr-2" /> Translating...
          </>
        ) : (
          <>
            <Volume2 className="w-6 h-6 mr-2" /> Read Review
          </>
        )}
      </Button>

      {translatedText && (
        <p className="text-sm text-gray-600 italic text-center px-4">
          <strong>English:</strong> "{translatedText}"
        </p>
      )}
    </div>
  );
};
