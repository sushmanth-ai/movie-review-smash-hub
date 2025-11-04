import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SmartTranslateAndRead } from '@/components/SmartTranslateAndRead';
<SmartTranslateAndRead text={review.text} />


interface SmartTranslateAndReadProps {
  text: string;
}

export const SmartTranslateAndRead: React.FC<SmartTranslateAndReadProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

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

  // Detect if text is Telugu
  const isTelugu = (input: string): boolean => /[\u0C00-\u0C7F]/.test(input);

  // Translate Telugu to English (using MyMemory API – free)
  const translateToEnglish = async (input: string): Promise<string> => {
    try {
      setIsTranslating(true);
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=te|en`
      );
      const data = await response.json();
      setIsTranslating(false);
      return data.responseData.translatedText || input;
    } catch (err) {
      console.error('Translation error:', err);
      setIsTranslating(false);
      return input; // fallback
    }
  };

  // Speak given text in English
  const speakText = (input: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const selectedVoice =
      voices.find(v => v.lang.toLowerCase().includes('en-in')) ||
      voices.find(v => v.lang.toLowerCase().includes('en-gb')) ||
      voices.find(v => v.lang.toLowerCase().includes('en-us')) ||
      voices[0];

    if (!selectedVoice) {
      toast({
        title: 'Voice not found',
        description: 'No English voice available in your browser.',
        variant: 'destructive',
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(input);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synth.speak(utterance);
  };

  const handleClick = async () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Speech synthesis is not available in this browser.',
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

    let textToRead = text;
    if (isTelugu(text)) {
      toast({ title: 'Translating...', description: 'Converting Telugu to English...' });
      textToRead = await translateToEnglish(text);
      setTranslatedText(textToRead);
    } else {
      setTranslatedText(text);
    }

    speakText(textToRead);
  };

  return (
    <div className="flex flex-col items-center mt-6 space-y-3">
      <Button
        onClick={handleClick}
        disabled={isTranslating}
        className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-700 text-white font-semibold text-lg px-8 py-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="w-6 h-6 mr-2" /> Stop Voice
          </>
        ) : isTranslating ? (
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
          Translated: "{translatedText}"
        </p>
      )}
    </div>
  );
};
