import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface TeluguVoiceReaderProps {
  reviewText: string;
}
export const TeluguVoiceReader: React.FC<TeluguVoiceReaderProps> = ({
  reviewText
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ready, setReady] = useState(false);
  const {
    toast
  } = useToast();
  const initVoices = () => {
    const synth = window.speechSynthesis;
    let allVoices = synth.getVoices();
    if (allVoices.length === 0) {
      synth.onvoiceschanged = () => {
        allVoices = synth.getVoices();
        setVoices(allVoices);
        setReady(true);
      };
    } else {
      setVoices(allVoices);
      setReady(true);
    }
  };
  const handleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Not Supported",
        description: "Speech synthesis not supported on this device.",
        variant: "destructive"
      });
      return;
    }
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!ready || voices.length === 0) {
      toast({
        title: "Initializing...",
        description: "Tap again after 2 seconds while voices load."
      });
      initVoices();
      return;
    }
    const teluguVoice = voices.find(v => v.lang.toLowerCase().includes("te-in")) || voices.find(v => v.lang.toLowerCase().includes("hi-in")) || voices.find(v => v.lang.toLowerCase().includes("en-in")) || voices[0];
    if (!teluguVoice) {
      toast({
        title: "Voice not found",
        description: "No Indian voice available — try enabling Google voice engine.",
        variant: "destructive"
      });
      return;
    }
    const sentences = reviewText.match(/[^.!?]+[.!?]+/g) || [reviewText];
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
      utter.onerror = e => {
        console.error("Speech error:", e);
        setIsSpeaking(false);
      };
      synth.speak(utter);
      setTimeout(() => synth.resume(), 250);
    };
    setIsSpeaking(true);
    speakNext();
  };

  // Preload voices when page loads (for desktop)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    initVoices();
  }, []);
  return <div className="flex justify-center mt-6">
      
    </div>;
};