import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeluguVoiceReaderProps {
  reviewText: string;
}

export const TeluguVoiceReader: React.FC<TeluguVoiceReaderProps> = ({ reviewText }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();

  // Load voices properly
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const allVoices = synth.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
      }
    };

    // Try now and again on event
    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const speakInChunks = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const teluguVoice =
      voices.find(v => v.lang.toLowerCase().includes('te-in')) ||
      voices.find(v => v.lang.toLowerCase().includes('hi-in')) ||
      voices.find(v => v.lang.toLowerCase().includes('en-in')) ||
      voices[0];

    if (!teluguVoice) {
      toast({
        title: 'Voice not found',
        description: 'Telugu voice not available on this browser. Try English-India voice.',
        variant: 'destructive',
      });
      return;
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let i = 0;

    const speakNext = () => {
      if (i >= sentences.length) {
        setIsSpeaking(false);
        return;
      }

      const utter = new SpeechSynthesisUtterance(sentences[i]);
      utter.voice = teluguVoice;
      utter.lang = teluguVoice.lang;
      utter.rate = 0.9;
      utter.pitch = 1;
      utter.volume = 1;

      utter.onend = () => {
        i++;
        setTimeout(speakNext, 50);
      };

      utter.onerror = (e) => {
        console.error('Speech error:', e);
        setIsSpeaking(false);
      };

      synth.speak(utter);
    };

    setIsSpeaking(true);
    speakNext();
  };

  const handleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: 'Error',
        description: 'Speech synthesis not supported in this browser',
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

    if (voices.length === 0) {
      toast({
        title: 'Loading voices...',
        description: 'Please wait 1–2 seconds and try again',
      });
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      return;
    }

    speakInChunks(reviewText);
  };

  return (
    <div className="flex justify-center mt-6">
      <Button
        onClick={handleSpeech}
        className="relative bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:shadow-[0_0_40px_rgba(255,215,0,0.8)] hover:scale-105 transition-all duration-300 border-2 border-primary/50"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="w-6 h-6 mr-2" />
            <span>🛑 Stop Voice</span>
          </>
        ) : (
          <>
            <Volume2 className="w-6 h-6 mr-2" />
            <span>🔊 Read Review</span>
          </>
        )}
      </Button>
    </div>
  );
};
