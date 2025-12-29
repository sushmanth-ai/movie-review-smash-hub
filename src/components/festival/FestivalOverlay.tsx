import React from 'react';
import { useFestivalContext } from './FestivalContext';

export const FestivalOverlay: React.FC = () => {
  const { activeFestival, isActive, decorationsEnabled, prefersReducedMotion } = useFestivalContext();
  
  if (!isActive || !activeFestival || !decorationsEnabled) {
    return null;
  }
  
  const overlayStyles: Record<string, string> = {
    'diya-glow': 'bg-gradient-to-b from-transparent via-[hsl(45_100%_51%/0.03)] to-[hsl(30_100%_50%/0.08)]',
    'color-dust': 'bg-gradient-to-br from-[hsl(280_100%_50%/0.05)] via-[hsl(180_100%_50%/0.03)] to-[hsl(60_100%_50%/0.05)]',
    'snow-sparkle': 'bg-gradient-to-b from-[hsl(200_100%_95%/0.03)] via-transparent to-[hsl(200_100%_90%/0.05)]',
    'hearts': 'bg-gradient-to-b from-[hsl(340_82%_52%/0.03)] via-transparent to-[hsl(330_100%_71%/0.05)]',
    'fireworks': 'bg-gradient-radial from-[hsl(45_100%_51%/0.05)] via-transparent to-[hsl(300_100%_50%/0.03)]',
    'pumpkins': 'bg-gradient-to-b from-[hsl(30_100%_50%/0.05)] via-transparent to-[hsl(270_100%_30%/0.08)]',
    'rangoli': 'bg-gradient-to-br from-[hsl(45_100%_51%/0.03)] via-[hsl(0_80%_50%/0.02)] to-[hsl(120_60%_50%/0.03)]',
    'flowers': 'bg-gradient-to-b from-[hsl(330_100%_80%/0.03)] via-transparent to-[hsl(45_100%_51%/0.05)]',
    'crescent': 'bg-gradient-to-b from-[hsl(120_50%_40%/0.03)] via-transparent to-[hsl(45_100%_51%/0.05)]',
    'none': '',
  };
  
  const overlayClass = overlayStyles[activeFestival.overlay] || '';
  
  if (!overlayClass) return null;
  
  return (
    <div 
      className={`
        fixed inset-0 pointer-events-none z-0
        ${overlayClass}
        ${!prefersReducedMotion ? 'transition-opacity duration-1000' : ''}
      `}
      aria-hidden="true"
    />
  );
};
