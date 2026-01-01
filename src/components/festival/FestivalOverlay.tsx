import React from 'react';
import { useFestivalContext } from './FestivalContext';

export const FestivalOverlay: React.FC = () => {
  const { activeFestival, isActive, decorationsEnabled, prefersReducedMotion } = useFestivalContext();
  
  if (!isActive || !activeFestival || !decorationsEnabled) {
    return null;
  }
  
  const { theme } = activeFestival;
  
  return (
    <>
      {/* Base gradient layer */}
      <div 
        className={`
          fixed inset-0 pointer-events-none z-0
          ${!prefersReducedMotion ? 'transition-opacity duration-1000' : ''}
        `}
        style={{
          background: `linear-gradient(
            135deg,
            hsl(${theme.gradient.from} / ${theme.overlayOpacity}) 0%,
            ${theme.gradient.via ? `hsl(${theme.gradient.via} / ${theme.overlayOpacity * 0.7}) 50%,` : ''}
            hsl(${theme.gradient.to} / ${theme.overlayOpacity}) 100%
          )`,
        }}
        aria-hidden="true"
      />
      
      {/* Radial glow accent */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(
            ellipse at 20% 20%,
            hsl(${theme.glowColor} / 0.08) 0%,
            transparent 50%
          ), radial-gradient(
            ellipse at 80% 80%,
            hsl(${theme.glowColor} / 0.05) 0%,
            transparent 40%
          )`,
        }}
        aria-hidden="true"
      />
      
      {/* Subtle vignette for depth */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, hsl(0 0% 0% / 0.3) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
};
