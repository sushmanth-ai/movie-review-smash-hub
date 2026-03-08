import { useState, useEffect } from 'react';

export const CurtainAnimation = () => {
  const [phase, setPhase] = useState<'logo' | 'explode' | 'done'>('logo');

  useEffect(() => {
    const shown = sessionStorage.getItem('curtainShown');
    if (shown) {
      setPhase('done');
      return;
    }

    sessionStorage.setItem('curtainShown', 'true');

    // Logo holds for 1.5s, then explode for 1.5s
    const t1 = setTimeout(() => setPhase('explode'), 1500);
    const t2 = setTimeout(() => setPhase('done'), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Dark cinematic background */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 ${
          phase === 'explode' ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Radial spotlight */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          phase === 'explode' ? 'scale-[3] opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          background: 'radial-gradient(circle at center, hsl(0 60% 18% / 0.6) 0%, transparent 60%)',
        }}
      />

      {/* Particle sparks */}
      {phase === 'logo' && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* Logo text */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
          phase === 'explode' ? 'scale-[2] opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Glowing ring */}
        <div
          className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-primary/40 animate-pulse"
          style={{
            boxShadow: '0 0 60px hsl(42 100% 50% / 0.3), inset 0 0 60px hsl(42 100% 50% / 0.1)',
          }}
        />

        {/* SM text */}
        <h1
          className="text-7xl md:text-9xl font-black tracking-tighter"
          style={{
            background: 'linear-gradient(180deg, hsl(42 100% 65%), hsl(42 100% 50%), hsl(0 75% 45%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px hsl(42 100% 50% / 0.8))',
          }}
        >
          SM
        </h1>

        {/* REVIEWS subtitle with stagger */}
        <div className="flex gap-1 mt-2">
          {'REVIEWS'.split('').map((char, i) => (
            <span
              key={i}
              className="text-lg md:text-2xl font-bold tracking-[0.3em] text-primary/90 animate-fade-in"
              style={{
                animationDelay: `${0.3 + i * 0.08}s`,
                animationFillMode: 'both',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* 3.0 badge */}
        <span
          className="mt-3 text-xs md:text-sm font-semibold tracking-widest text-accent/70 animate-fade-in"
          style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
        >
          — 3.0 ★★★ —
        </span>
      </div>

      {/* Explode particles */}
      {phase === 'explode' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * 360;
            const distance = 80 + Math.random() * 120;
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? 'hsl(42 100% 50%)' : i % 3 === 1 ? 'hsl(0 75% 45%)' : 'hsl(42 100% 70%)',
                  animation: `explode-particle 0.8s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.2}s`,
                  ['--angle' as string]: `${angle}deg`,
                  ['--distance' as string]: `${distance}vh`,
                  boxShadow: '0 0 8px currentColor',
                }}
              />
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes explode-particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * var(--distance)),
              calc(sin(var(--angle)) * var(--distance))
            ) scale(0);
            opacity: 0;
          }
        }
        @keyframes fade-in-letter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
