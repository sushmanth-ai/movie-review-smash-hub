import React, { useMemo } from 'react';
import { useFestivalContext } from './FestivalContext';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const ParticleEmoji: Record<string, string[]> = {
  diyas: ['🪔', '✨', '💫'],
  colors: ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠'],
  snowflakes: ['❄️', '❅', '✨', '⭐'],
  hearts: ['💕', '💖', '💗', '❤️', '💘'],
  sparks: ['✨', '🎆', '🎇', '💫', '⭐'],
  pumpkins: ['🎃', '👻', '🦇', '🕷️', '🕸️'],
  petals: ['🌸', '🌺', '🌼', '🏵️', '💐'],
  stars: ['⭐', '🌟', '✨', '💫', '🌙'],
  none: [],
};

export const FestivalParticles: React.FC = () => {
  const { activeFestival, isActive, prefersReducedMotion, decorationsEnabled } = useFestivalContext();
  
  // Generate particles
  const particles = useMemo<Particle[]>(() => {
    if (!isActive || !activeFestival || prefersReducedMotion || !decorationsEnabled) {
      return [];
    }
    
    const count = activeFestival.particles.count;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 16 + Math.random() * 16,
      opacity: 0.4 + Math.random() * 0.4,
    }));
  }, [isActive, activeFestival, prefersReducedMotion, decorationsEnabled]);
  
  if (!isActive || !activeFestival || particles.length === 0) {
    return null;
  }
  
  const emojis = ParticleEmoji[activeFestival.particles.type] || [];
  if (emojis.length === 0) return null;
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => {
        const emoji = emojis[particle.id % emojis.length];
        
        return (
          <div
            key={particle.id}
            className="absolute animate-festival-fall"
            style={{
              left: `${particle.left}%`,
              top: '-5%',
              fontSize: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          >
            {emoji}
          </div>
        );
      })}
    </div>
  );
};
