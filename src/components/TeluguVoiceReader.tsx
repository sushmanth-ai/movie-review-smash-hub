import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeluguVoiceReaderProps {
  reviewText: string;
}

export const TeluguVoiceReader: React.FC<TeluguVoiceReaderProps> = ({ reviewText }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const speechSynth = window.speechSynthesis;
      setSynth(speechSynth);

      // Load voices
      const loadVoices = () => {
        const voices = speechSynth.getVoices();
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
        if (voices.length > 0) {
          setVoicesLoaded(true);
        }
      };

      // Try to load voices immediately
      loadVoices();

      // Also listen for voices changed event
      if (speechSynth.onvoiceschanged !== undefined) {
        speechSynth.onvoiceschanged = loadVoices;
      }

      // Cleanup
      return () => {
        speechSynth.cancel();
      };
    }
  }, []);

  const handleSpeech = () => {
    if (!synth) {
      toast({
        title: "Error",
        description: "Speech synthesis not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    if (isSpeaking) {
      console.log('Stopping speech...');
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    console.log('Starting speech...');
    const utterance = new SpeechSynthesisUtterance(reviewText);
    
    // Get all available voices
    const voices = synth.getVoices();
    console.log('Total voices available:', voices.length);

    // Try to find Telugu voice (te-IN or te)
    let selectedVoice = voices.find(v => 
      v.lang.toLowerCase().includes('te-in') || 
      v.lang.toLowerCase().includes('te')
    );

    // If Telugu not found, try Hindi as fallback (hi-IN)
    if (!selectedVoice) {
      console.log('Telugu voice not found, trying Hindi...');
      selectedVoice = voices.find(v => 
        v.lang.toLowerCase().includes('hi-in') || 
        v.lang.toLowerCase().includes('hi')
      );
    }

    // If still not found, use any female voice or first available voice
    if (!selectedVoice) {
      console.log('No Indian language voices found, using default...');
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.log('No voice selected, using default');
    }

    // Set language
    utterance.lang = selectedVoice?.lang || 'te-IN';
    
    // Adjust speech parameters for better quality
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: `Speech error: ${event.error}`,
        variant: "destructive"
      });
    };

    // Cancel any ongoing speech before starting
    synth.cancel();
    
    // Small delay to ensure cancel completes
    setTimeout(() => {
      synth.speak(utterance);
      console.log('Speech queued');
    }, 100);
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
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
          </>
        ) : (
          <>
            <Volume2 className="w-6 h-6 mr-2" />
            <span>🔊 Read Review</span>
          </>
        )}
        {isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-primary"></span>
          </span>
        )}
      </Button>
    </div>
  );
};
