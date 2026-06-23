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
        className={`fixed inset-0 pointer-events-none z-0 ${!prefersReducedMotion ? 'transition-opacity duration-1000' : ''}`}
        style={{
          background: `linear-gradient(
            135deg,
            hsl(${theme.gradient.from} / ${theme.overlayOpacity}) 0%,
            ${theme.gradient.via ? `hsl(${theme.gradient.via} / ${theme.overlayOpacity * 0.8}) 50%,` : ''}
            hsl(${theme.gradient.to} / ${theme.overlayOpacity}) 100%
          )`,
        }}
        aria-hidden="true"
      />

      {/* Animated radial glow pulses */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 15% 15%, hsl(${theme.glowColor} / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 85%, hsl(${theme.glowColor} / 0.07) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, hsl(${theme.glowColor} / 0.04) 0%, transparent 60%)
          `,
          animation: !prefersReducedMotion ? 'festival-glow-shift 8s ease-in-out infinite alternate' : 'none',
        }}
        aria-hidden="true"
      />

      {/* Top decorative border glow */}
      <div
        className="fixed top-0 left-0 right-0 h-1 pointer-events-none z-[6]"
        style={{
          background: `linear-gradient(90deg, 
            transparent, 
            hsl(${activeFestival.colors.primary} / 0.6), 
            hsl(${activeFestival.colors.accent} / 0.6), 
            hsl(${activeFestival.colors.primary} / 0.6), 
            transparent
          )`,
          boxShadow: `0 0 20px hsl(${theme.glowColor} / 0.4)`,
        }}
        aria-hidden="true"
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.35) 100%)',
        }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes festival-glow-shift {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </>
  );
};
