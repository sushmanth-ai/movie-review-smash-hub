import React, { useEffect, useState } from "react";

interface SMCriticsMeterProps {
  rating: number; // 0 - 5
  size?: number;
}

const ZONES = [
  { from: 0.0, to: 2.9, color: "#ef4444", glow: "rgba(239,68,68,0.7)" },   // Red
  { from: 2.9, to: 3.5, color: "#f97316", glow: "rgba(249,115,22,0.7)" },  // Orange
  { from: 3.5, to: 3.9, color: "#facc15", glow: "rgba(250,204,21,0.7)" },  // Yellow
  { from: 3.9, to: 5.0, color: "#22c55e", glow: "rgba(34,197,94,0.7)" },   // Green
];

export const SMCriticsMeter: React.FC<SMCriticsMeterProps> = ({ rating, size = 300 }) => {
  const clamped = Math.max(0, Math.min(5, rating || 0));
  const targetAngle = (clamped / 5) * 360; // 0° at top, clockwise

  const [animAngle, setAnimAngle] = useState(0);
  const [animRating, setAnimRating] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimAngle(eased * targetAngle);
      setAnimRating(eased * clamped);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetAngle, clamped]);

  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = Math.round(size * 0.075);
  const r = (size - strokeWidth) / 2 - 6;
  const C = 2 * Math.PI * r;

  const activeZone = ZONES.find((z) => clamped >= z.from && clamped <= z.to) || ZONES[0];

  // Tick marks every 0.25 rating (=> 18° each)
  const ticks = Array.from({ length: 40 }, (_, i) => i * 9); // every 9° = 0.125

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08), rgba(0,0,0,0.85) 70%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            `0 20px 60px -20px ${activeZone.glow}, inset 0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)`,
          transition: "box-shadow 600ms ease",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative"
      >
        <defs>
          {ZONES.map((z, i) => (
            <filter key={i} id={`zone-glow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <radialGradient id="hub-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="45%" stopColor="#a8a8a8" />
            <stop offset="100%" stopColor="#2a2a2a" />
          </radialGradient>
          <linearGradient id="needle-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e5e5e5" />
            <stop offset="100%" stopColor="#6b6b6b" />
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

        {/* Color zones */}
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
                filter={`url(#zone-glow-${i})`}
                style={{ opacity: 0.95 }}
              />
            );
          })}
        </g>

        {/* Tick marks */}
        <g>
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
                stroke={isMajor ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)"}
                strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${animAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "filter 400ms ease",
            filter: `drop-shadow(0 0 8px ${activeZone.glow})`,
          }}
        >
          {/* Needle main */}
          <polygon
            points={`${cx - 4},${cy + 10} ${cx + 4},${cy + 10} ${cx + 1.5},${cy - r + strokeWidth + 6} ${cx - 1.5},${cy - r + strokeWidth + 6}`}
            fill="url(#needle-grad)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="0.5"
          />
          {/* Counterweight */}
          <circle cx={cx} cy={cy + 18} r={6} fill="#3a3a3a" stroke="#1a1a1a" strokeWidth="1" />
        </g>

        {/* Center hub */}
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.055}
          fill="url(#hub-grad)"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="1.5"
        />
        <circle cx={cx} cy={cy} r={size * 0.018} fill="#1a1a1a" />
      </svg>

      {/* Center rating value */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingTop: size * 0.32 }}
      >
        <div className="text-center">
          <div
            className="font-extrabold tabular-nums tracking-tight"
            style={{
              fontSize: size * 0.13,
              lineHeight: 1,
              color: activeZone.color,
              textShadow: `0 0 14px ${activeZone.glow}`,
              transition: "color 400ms ease, text-shadow 400ms ease",
            }}
          >
            {animRating.toFixed(1)}
            <span
              className="opacity-70 font-bold"
              style={{ fontSize: size * 0.065, color: "rgba(255,255,255,0.7)", textShadow: "none" }}
            >
              /5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMCriticsMeter;
