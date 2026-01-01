import React, { useMemo } from 'react';
import { useFestivalContext } from './FestivalContext';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  char: string;
  drift: number;
}

export const FestivalParticles: React.FC = () => {
  const { activeFestival, isActive, prefersReducedMotion, decorationsEnabled } = useFestivalContext();
  
  const particles = useMemo<Particle[]>(() => {
    if (!isActive || !activeFestival || prefersReducedMotion || !decorationsEnabled) {
      return [];
    }
    
    const { theme } = activeFestival;
    const count = theme.particleCount;
    const chars = theme.particles;
    
    if (chars.length === 0) return [];
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 20,
      size: 10 + Math.random() * 14,
      opacity: 0.15 + Math.random() * 0.25,
      char: chars[i % chars.length],
      drift: (Math.random() - 0.5) * 30,
    }));
  }, [isActive, activeFestival, prefersReducedMotion, decorationsEnabled]);
  
  if (!isActive || !activeFestival || particles.length === 0) {
    return null;
  }
  
  const glowColor = activeFestival.theme.glowColor;
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-premium-fall"
          style={{
            left: `${particle.left}%`,
            top: '-5%',
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            color: `hsl(${glowColor})`,
            textShadow: `0 0 ${particle.size / 2}px hsl(${glowColor} / 0.5)`,
            filter: 'blur(0.5px)',
            ['--drift' as string]: `${particle.drift}px`,
          }}
        >
          {particle.char}
        </div>
      ))}
    </div>
  );
};
