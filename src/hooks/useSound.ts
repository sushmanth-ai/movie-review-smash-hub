import { useCallback } from 'react';
import clickSound from '@/assets/sounds/click.wav';
import popupSound from '@/assets/sounds/popup.mp3';
import bubbleSound from '@/assets/sounds/bubble.mp3';
import spinSound from '@/assets/sounds/spin.mp3';

export type SoundType = 'click' | 'popup' | 'bubble' | 'spin';

export const useSound = () => {
  const playSound = useCallback((type: SoundType) => {
    let soundFile: string;
    
    switch (type) {
      case 'click':
        soundFile = clickSound;
        break;
      case 'popup':
        soundFile = popupSound;
        break;
      case 'bubble':
        soundFile = bubbleSound;
        break;
      case 'spin':
        soundFile = spinSound;
        break;
      default:
        return;
    }
    
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Sound play failed:', err));
  }, []);

  return { playSound };
};
