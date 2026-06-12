import React, { useEffect, useRef, useState } from "react";

interface SMCriticsMeterProps {
  rating: number; // 0 - 5
  size?: number;
}

const ZONES = [
  { from: 0.0, to: 2.9, color: "#ef4444", glow: "rgba(239,68,68,0.75)", label: "Flop", emoji: "❌" },
  { from: 2.9, to: 3.5, color: "#f97316", glow: "rgba(249,115,22,0.75)", label: "Average", emoji: "👍" },
  { from: 3.5, to: 3.9, color: "#facc15", glow: "rgba(250,204,21,0.75)", label: "Hit", emoji: "✅" },
  { from: 3.9, to: 5.0, color: "#22c55e", glow: "rgba(34,197,94,0.75)", label: "Blockbuster", emoji: "🔥" },
];

const getZone = (r: number) => {
  if (r >= 4.0) return ZONES[3];
  if (r >= 3.6) return ZONES[2];
  if (r >= 3.0) return ZONES[1];
  return ZONES[0];
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const SMCriticsMeter: React.FC<SMCriticsMeterProps> = ({ rating, size = 320 }) => {
  const clamped = Math.max(0, Math.min(5, rating || 0));
  // 0 rating → 0° (top), 5 rating → 360° (full clockwise)
  const targetAngle = (clamped / 5) * 360;

  const [animAngle, setAnimAngle] = useState(0);
  const [animRating, setAnimRating] = useState(0);
  const [settled, setSettled] = useState(false);
  const fromAngleRef = useRef(0);
  const fromRatingRef = useRef(0);

  useEffect(() => {
    const fromA = fromAngleRef.current;
    const fromR = fromRatingRef.current;
    const duration = 2000;
    const start = performance.now();
    let raf = 0;
    setSettled(false);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const e = easeOut(p);
      setAnimAngle(fromA + (targetAngle - fromA) * e);
      setAnimRating(fromR + (clamped - fromR) * e);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromAngleRef.current = targetAngle;
        fromRatingRef.current = clamped;
        setSettled(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetAngle, clamped]);

  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = Math.round(size * 0.08);
  const r = (size - strokeWidth) / 2 - 8;
  const C = 2 * Math.PI * r;

  const activeZone = getZone(clamped);

  // Tick marks every 9° (0.125 rating)
  const ticks = Array.from({ length: 40 }, (_, i) => i * 9);

  return (
    <div
      className="relative mx-auto group transition-transform duration-300 hover:scale-[1.02]"
      style={{ width: "100%", maxWidth: size }}
    >
      <div
        className="relative rounded-2xl p-4 sm:p-6"
        style={{
          background: "radial-gradient(circle at 50% 30%, #141414, #0a0a0a 70%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 20px 60px -20px ${activeZone.glow}, 0 0 50px -12px ${activeZone.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          transition: "box-shadow 700ms ease",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 blur-2xl"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${activeZone.glow}, transparent 65%)`,
            transition: "background 700ms ease",
          }}
        />

        <div className="relative mx-auto" style={{ width: "100%", maxWidth: size, aspectRatio: "1 / 1" }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
            <defs>
              {ZONES.map((z, i) => (
                <filter key={i} id={`smcm-glow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <radialGradient id="smcm-hub" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fafafa" />
                <stop offset="45%" stopColor="#a3a3a3" />
                <stop offset="100%" stopColor="#1f1f1f" />
              </radialGradient>
              <linearGradient id="smcm-needle" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#d4d4d4" />
                <stop offset="100%" stopColor="#525252" />
              </linearGradient>
            </defs>

            {/* Track */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Color zones (rotated so 0° = top, clockwise) */}
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              {ZONES.map((z, i) => {
                const a1 = (z.from / 5) * 360;
                const a2 = (z.to / 5) * 360;
                const segLen = ((a2 - a1) / 360) * C;
                const offset = -(a1 / 360) * C;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={z.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segLen} ${C - segLen}`}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                    filter={`url(#smcm-glow-${i})`}
                    style={{ opacity: 0.95 }}
                  />
                );
              })}
            </g>

            {/* Tick marks */}
            {ticks.map((deg, i) => {
              const isMajor = i % 5 === 0;
              const innerR = r - strokeWidth / 2 - 4;
              const outerR = innerR - (isMajor ? 12 : 6);
              const rad = ((deg - 90) * Math.PI) / 180;
              const x1 = cx + innerR * Math.cos(rad);
              const y1 = cy + innerR * Math.sin(rad);
              const x2 = cx + outerR * Math.cos(rad);
              const y2 = cy + outerR * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.22)"}
                  strokeWidth={isMajor ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Needle */}
            <g
              style={{
                transform: `rotate(${animAngle}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
                transformBox: "fill-box" as any,
                filter: `drop-shadow(0 0 8px ${activeZone.glow})`,
                willChange: "transform",
              }}
            >
              <polygon
                points={`${cx - 5},${cy + 10} ${cx + 5},${cy + 10} ${cx + 1.5},${cy - r + strokeWidth + 6} ${cx - 1.5},${cy - r + strokeWidth + 6}`}
                fill="url(#smcm-needle)"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.5"
              />
              <circle
                cx={cx}
                cy={cy - r + strokeWidth + 6}
                r={3.5}
                fill="#ffffff"
                style={{
                  filter: `drop-shadow(0 0 6px ${activeZone.color}) drop-shadow(0 0 14px ${activeZone.glow})`,
                }}
              />
              <circle cx={cx} cy={cy + 18} r={6} fill="#3a3a3a" stroke="#1a1a1a" strokeWidth="1" />
            </g>

            {/* Center hub */}
            <circle
              cx={cx}
              cy={cy}
              r={size * 0.06}
              fill="url(#smcm-hub)"
              stroke="rgba(0,0,0,0.7)"
              strokeWidth="1.5"
              style={{
                filter: settled ? `drop-shadow(0 0 10px ${activeZone.glow})` : "none",
              }}
            />
            <circle cx={cx} cy={cy} r={size * 0.02} fill="#0a0a0a" />
          </svg>

          {/* Center rating value */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingTop: size * 0.32 }}
          >
            <div
              className="font-extrabold tabular-nums tracking-tight"
              style={{
                fontSize: size * 0.14,
                lineHeight: 1,
                color: activeZone.color,
                textShadow: `0 0 16px ${activeZone.glow}`,
                transition: "color 500ms ease, text-shadow 500ms ease",
              }}
            >
              {animRating.toFixed(1)}
              <span
                className="opacity-70 font-bold"
                style={{
                  fontSize: size * 0.065,
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "none",
                }}
              >
                /5
              </span>
            </div>
          </div>
        </div>

        {/* Verdict pill */}
        <div className="mt-3 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold tracking-wide"
            style={{
              fontSize: Math.max(14, size * 0.05),
              color: activeZone.color,
              background: `linear-gradient(180deg, ${activeZone.glow.replace("0.75", "0.15")}, rgba(0,0,0,0.4))`,
              border: `1px solid ${activeZone.color}55`,
              boxShadow: `0 0 18px -4px ${activeZone.glow}`,
              transition: "all 500ms ease",
            }}
          >
            <span style={{ fontSize: "1.2em" }}>{activeZone.emoji}</span>
            <span>{activeZone.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMCriticsMeter;
