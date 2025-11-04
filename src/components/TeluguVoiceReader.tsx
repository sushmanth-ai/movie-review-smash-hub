import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UniversalEnglishReaderProps {
  text: string;
}

export const UniversalEnglishReader: React.FC<UniversalEnglishReaderProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const allVoices = synth.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // Check if text contains Telugu
  const containsTelugu = (input: string): boolean => /[\u0C00-\u0C7F]/.test(input);

  // Translate Telugu → English using MyMemory free API
  const translateToEnglish = async (input: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=te|en`
      );
      const data = await response.json();
      return data.responseData.translatedText || input;
    } catch (error) {
      console.error('Translation error:', error);
      return input;
    }
  };

  // Speak in English
  const speakEnglish = (textToSpeak: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const englishVoice =
      voices.find(v => v.lang.toLowerCase().includes('en-in')) ||
      voices.find(v => v.lang.toLowerCase().includes('en-gb')) ||
      voices.find(v => v.lang.toLowerCase().includes('en-us')) ||
      voices[0];

    if (!englishVoice) {
      toast({
        title: 'No English voice available',
        description: 'Please enable text-to-speech voices in your browser.',
        variant: 'destructive',
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = englishVoice;
    utterance.lang = englishVoice.lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utterance);
  };

  const handleRead = async () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Speech synthesis is not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    let textToRead = text;

    // Detect Telugu and translate if needed
    if (containsTelugu(text)) {
      toast({
        title: 'Translating...',
        description: 'Converting Telugu to English for speech.',
      });
      textToRead = await translateToEnglish(text);
      setTranslatedText(textToRead);
    } else {
      setTranslatedText(text);
    }

    setIsLoading(false);
    speakEnglish(textToRead);
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
            <Volume2 className="w-6 h-6 mr-2" /> Read in English
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
