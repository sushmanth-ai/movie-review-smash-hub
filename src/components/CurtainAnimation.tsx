import { useState, useEffect } from 'react';

interface CurtainAnimationProps {
  /** If true, plays every time (e.g. on review navigation). Default: once per session */
  alwaysPlay?: boolean;
  /** A value that, when changed, re-triggers the animation */
  trigger?: any;
}

export const CurtainAnimation = ({ alwaysPlay = false, trigger }: CurtainAnimationProps) => {
  const [phase, setPhase] = useState<'enter' | 'logo' | 'reveal' | 'done'>('done');

  useEffect(() => {
    if (!alwaysPlay && !trigger) {
      const shown = sessionStorage.getItem('curtainShown');
      if (shown) {
        return; // phase already 'done'
      }
      sessionStorage.setItem('curtainShown', 'true');
    }

    // Start the animation
    setPhase('enter');

    // enter → logo (0.3s), logo → reveal (1.2s), reveal → done (1.8s)
    // Snappier for transitions
    const t0 = setTimeout(() => setPhase('logo'), 300);
    const t1 = setTimeout(() => setPhase('reveal'), 1200);
    const t2 = setTimeout(() => setPhase('done'), 1800);
    // Safety: force done after 3s in case something hangs
    const tSafety = setTimeout(() => setPhase('done'), 3000);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(tSafety); };
  }, [alwaysPlay, trigger]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Dark cinematic background with fade out */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: phase === 'reveal' ? 0 : 1 }}
      />

      {/* Radial golden spotlight - slowly breathes */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: 'radial-gradient(circle at center, hsl(42 100% 50% / 0.15) 0%, transparent 70%)',
          opacity: phase === 'reveal' ? 0 : 1,
          transform: phase === 'reveal' ? 'scale(3)' : 'scale(1)',
        }}
      />

      {/* Floating golden particles */}
      {(phase === 'enter' || phase === 'logo') && (
        <div className="absolute inset-0">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `hsl(42 100% ${55 + Math.random() * 20}%)`,
                left: `${10 + Math.random() * 80}%`,
                bottom: '-5%',
                opacity: 0,
                boxShadow: '0 0 6px hsl(42 100% 50% / 0.6)',
                animation: `float-up ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* SM Logo - center stage */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-all"
        style={{
          opacity: phase === 'enter' ? 0 : phase === 'reveal' ? 0 : 1,
          transform:
            phase === 'enter'
              ? 'scale(0.7)'
              : phase === 'reveal'
              ? 'scale(1.3)'
              : 'scale(1)',
          transition: 'opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Pulsing ring */}
        <div
          className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full"
          style={{
            border: '2px solid hsl(42 100% 50% / 0.35)',
            boxShadow:
              '0 0 40px hsl(42 100% 50% / 0.2), inset 0 0 40px hsl(42 100% 50% / 0.08)',
            animation: 'ring-pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* SM text with golden gradient */}
        <h1
          className="text-7xl md:text-9xl font-black tracking-tighter"
          style={{
            background:
              'linear-gradient(180deg, hsl(42 100% 70%), hsl(42 100% 50%), hsl(0 75% 45%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 25px hsl(42 100% 50% / 0.7))',
            animation: phase === 'logo' ? 'text-glow 1s ease-in-out infinite alternate' : 'none',
          }}
        >
          SM
        </h1>

        {/* REVIEWS - letter by letter stagger */}
        <div className="flex gap-0.5 mt-2">
          {'REVIEWS'.split('').map((char, i) => (
            <span
              key={i}
              className="text-base md:text-xl font-bold tracking-[0.3em]"
              style={{
                color: 'hsl(42 100% 50% / 0.85)',
                opacity: 0,
                animation: 'letter-in 0.3s ease-out forwards',
                animationDelay: `${0.5 + i * 0.07}s`,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* 3.0 badge */}
        <span
          className="mt-2 text-xs md:text-sm font-semibold tracking-widest"
          style={{
            color: 'hsl(42 100% 50% / 0.5)',
            opacity: 0,
            animation: 'letter-in 0.4s ease-out forwards',
            animationDelay: '1s',
          }}
        >
          — 3.0 ★★★ —
        </span>
      </div>

      <style>{`
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(0); }
          30% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-100vh); }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes text-glow {
          from { filter: drop-shadow(0 0 20px hsl(42 100% 50% / 0.5)); }
          to { filter: drop-shadow(0 0 40px hsl(42 100% 50% / 0.9)); }
        }
        @keyframes letter-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
