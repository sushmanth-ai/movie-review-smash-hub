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
  wobble: number;
}

export const FestivalParticles: React.FC = () => {
  const { activeFestival, isActive, prefersReducedMotion, decorationsEnabled } = useFestivalContext();

  const particles = useMemo<Particle[]>(() => {
    if (!isActive || !activeFestival || prefersReducedMotion || !decorationsEnabled) {
      return [];
    }

    const emojis = activeFestival.floatingEmojis || activeFestival.theme.particles;
    const count = activeFestival.theme.particleCount;
    if (emojis.length === 0) return [];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 12 + Math.random() * 18,
      size: 16 + Math.random() * 16,
      opacity: 0.3 + Math.random() * 0.5,
      char: emojis[i % emojis.length],
      drift: (Math.random() - 0.5) * 50,
      wobble: 2 + Math.random() * 4,
    }));
  }, [isActive, activeFestival, prefersReducedMotion, decorationsEnabled]);

  if (!isActive || !activeFestival || particles.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-premium-fall"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
            filter: `drop-shadow(0 0 ${p.size / 3}px hsl(${activeFestival.theme.glowColor} / 0.4))`,
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
};
