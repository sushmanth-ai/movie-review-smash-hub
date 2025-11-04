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

  const speakInChunks = (text: string) => {
    if (!synth) return;

    // Cancel any ongoing speech
    synth.cancel();

    // Split text into smaller chunks (max 200 characters per chunk)
    const chunkSize = 200;
    const chunks: string[] = [];
    
    // Split by sentences first to avoid breaking mid-sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    sentences.forEach(sentence => {
      if ((currentChunk + sentence).length <= chunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    });
    if (currentChunk) chunks.push(currentChunk.trim());

    console.log(`Split text into ${chunks.length} chunks`);

    let currentChunkIndex = 0;

    const speakNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        console.log('All chunks completed');
        setIsSpeaking(false);
        return;
      }

      const chunk = chunks[currentChunkIndex];
      console.log(`Speaking chunk ${currentChunkIndex + 1}/${chunks.length}`);

      const utterance = new SpeechSynthesisUtterance(chunk);
      
      // Get voices
      const voices = synth.getVoices();
      let selectedVoice = voices.find(v => 
        v.lang.toLowerCase().includes('te-in') || 
        v.lang.toLowerCase().includes('te')
      );

      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.toLowerCase().includes('hi-in') || 
          v.lang.toLowerCase().includes('hi')
        );
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = selectedVoice?.lang || 'te-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        console.log(`Chunk ${currentChunkIndex + 1} completed`);
        currentChunkIndex++;
        // Small delay before next chunk to prevent interruption
        setTimeout(speakNextChunk, 50);
      };

      utterance.onerror = (event) => {
        console.error(`Chunk ${currentChunkIndex + 1} error:`, event.error);
        
        if (event.error === 'interrupted' || event.error === 'canceled') {
          // User cancelled, stop everything
          setIsSpeaking(false);
          return;
        }

        // For other errors, try next chunk
        currentChunkIndex++;
        setTimeout(speakNextChunk, 100);
      };

      synth.speak(utterance);
    };

    setIsSpeaking(true);
    // Small delay before starting
    setTimeout(speakNextChunk, 100);
  };

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

    console.log('Starting speech with chunking...');
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
