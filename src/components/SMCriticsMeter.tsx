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

// cubic-bezier easing for ease-out feel
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const SMCriticsMeter: React.FC<SMCriticsMeterProps> = ({ rating, size = 320 }) => {
  const clamped = Math.max(0, Math.min(5, rating || 0));
  // Map 0..5 → -90deg (left) .. +90deg (right)
  const targetAngle = -90 + (clamped / 5) * 180;

  const [animAngle, setAnimAngle] = useState(-90);
  const [animRating, setAnimRating] = useState(0);
  const [settled, setSettled] = useState(false);
  const fromAngleRef = useRef(-90);
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

  const width = size;
  const height = Math.round(size * 0.62);
  const cx = width / 2;
  const cy = height - 16;
  const strokeWidth = Math.round(size * 0.08);
  const r = (width - strokeWidth) / 2 - 8;

  const activeZone = getZone(clamped);

  // Arc path helper for the gauge segments (semicircle from 180° to 360°/0°)
  const polar = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const arcPath = (startRating: number, endRating: number) => {
    // rating 0 → angle 180°, rating 5 → angle 360°
    const a1 = 180 + (startRating / 5) * 180;
    const a2 = 180 + (endRating / 5) * 180;
    const p1 = polar(a1, r);
    const p2 = polar(a2, r);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  // Tick marks (every 0.25 rating)
  const ticks = Array.from({ length: 21 }, (_, i) => i * 0.25);

  return (
    <div
      className="relative mx-auto group transition-transform duration-300 hover:scale-[1.02]"
      style={{ width: "100%", maxWidth: size }}
    >
      {/* Glassmorphism card */}
      <div
        className="relative rounded-2xl overflow-hidden p-4 sm:p-6"
        style={{
          background:
            "linear-gradient(160deg, rgba(20,10,10,0.92), rgba(8,8,12,0.92))",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 20px 60px -20px ${activeZone.glow}, 0 0 40px -10px ${activeZone.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          transition: "box-shadow 700ms ease",
        }}
      >
        {/* Neon outer glow ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 blur-2xl"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${activeZone.glow}, transparent 65%)`,
            transition: "background 700ms ease",
          }}
        />

        <div className="relative">
          <svg
            width="100%"
            viewBox={`0 0 ${width} ${height + 8}`}
            style={{ display: "block" }}
          >
            <defs>
              <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="62%" stopColor="#facc15" />
                <stop offset="85%" stopColor="#22c55e" />
              </linearGradient>
              <radialGradient id="hub-grad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fafafa" />
                <stop offset="45%" stopColor="#a3a3a3" />
                <stop offset="100%" stopColor="#1f1f1f" />
              </radialGradient>
              <linearGradient id="needle-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#d4d4d4" />
                <stop offset="100%" stopColor="#525252" />
              </linearGradient>
              <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <path
              d={arcPath(0, 5)}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
            />

            {/* Color zones */}
            {ZONES.map((z, i) => (
              <path
                key={i}
                d={arcPath(z.from, z.to)}
                fill="none"
                stroke={z.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                filter="url(#arc-glow)"
                style={{ opacity: 0.95 }}
              />
            ))}

            {/* Tick marks */}
            {ticks.map((t, i) => {
              const isMajor = i % 4 === 0;
              const angle = 180 + (t / 5) * 180;
              const inner = polar(angle, r - strokeWidth / 2 - 4);
              const outer = polar(angle, r - strokeWidth / 2 - (isMajor ? 16 : 8));
              return (
                <line
                  key={i}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={isMajor ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)"}
                  strokeWidth={isMajor ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Zone end labels (0 and 5) */}
            <text x={polar(180, r - strokeWidth - 22).x} y={polar(180, r - strokeWidth - 22).y + 4}
              fill="rgba(255,255,255,0.55)" fontSize={size * 0.038} textAnchor="middle" fontWeight={600}>0</text>
            <text x={polar(360, r - strokeWidth - 22).x} y={polar(360, r - strokeWidth - 22).y + 4}
              fill="rgba(255,255,255,0.55)" fontSize={size * 0.038} textAnchor="middle" fontWeight={600}>5</text>

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
                points={`${cx - 5},${cy + 6} ${cx + 5},${cy + 6} ${cx + 1.5},${cy - r + strokeWidth / 2 + 8} ${cx - 1.5},${cy - r + strokeWidth / 2 + 8}`}
                fill="url(#needle-grad)"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth="0.6"
              />
              <circle
                cx={cx}
                cy={cy - r + strokeWidth / 2 + 8}
                r={3.5}
                fill="#ffffff"
                style={{
                  filter: `drop-shadow(0 0 6px ${activeZone.color}) drop-shadow(0 0 14px ${activeZone.glow})`,
                }}
              />
            </g>

            {/* Center hub */}
            <circle
              cx={cx}
              cy={cy}
              r={size * 0.055}
              fill="url(#hub-grad)"
              stroke="rgba(0,0,0,0.7)"
              strokeWidth="1.5"
              style={{
                filter: settled ? `drop-shadow(0 0 10px ${activeZone.glow})` : "none",
                animation: settled ? "smcm-pulse 1.8s ease-in-out infinite" : "none",
              }}
            />
            <circle cx={cx} cy={cy} r={size * 0.018} fill="#0a0a0a" />
          </svg>

          {/* Rating value */}
          <div
            className="absolute left-0 right-0 text-center pointer-events-none"
            style={{ top: `${(height * 0.42) / (height + 8) * 100}%` }}
          >
            <div
              className="font-extrabold tabular-nums tracking-tight inline-block"
              style={{
                fontSize: size * 0.13,
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
                  fontSize: size * 0.06,
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "none",
                }}
              >
                /5
              </span>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="mt-2 text-center">
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

      <style>{`
        @keyframes smcm-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.92; }
          transform-origin: center;
        }
      `}</style>
    </div>
  );
};

export default SMCriticsMeter;
