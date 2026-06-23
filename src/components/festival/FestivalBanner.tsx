import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFestivalContext } from './FestivalContext';

export const FestivalBanner: React.FC = () => {
  const { activeFestival, isActive, prefersReducedMotion } = useFestivalContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Reset dismissal when festival changes
  useEffect(() => {
    if (activeFestival) {
      const dismissedFestival = sessionStorage.getItem('dismissed-festival');
      setIsDismissed(dismissedFestival === activeFestival.id);
    }
  }, [activeFestival]);
  
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!isActive || isDismissed) return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isActive, isDismissed]);
  
  if (!isActive || !activeFestival || isDismissed || !isVisible) {
    return null;
  }
  
  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismissed-festival', activeFestival.id);
  };
  
  return (
    <div
      className={`
        fixed top-28 md:top-24 left-1/2 -translate-x-1/2 z-40
        px-4 py-2 rounded-full
        bg-gradient-to-r from-card/95 via-card to-card/95
        border-2 border-primary
        shadow-[0_0_30px_hsl(var(--festival-glow,45_100%_60%)/0.4)]
        ${!prefersReducedMotion ? 'animate-fade-in' : ''}
        flex items-center gap-3
        max-w-[90vw]
      `}
    >
      <span className="text-xl">{activeFestival.bannerEmoji}</span>
      <span className="text-primary font-bold text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">
        {activeFestival.bannerText}
      </span>
      <span className="text-xl">{activeFestival.bannerEmoji}</span>
      
      <button
        onClick={handleDismiss}
        className="ml-2 text-muted-foreground hover:text-primary transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
