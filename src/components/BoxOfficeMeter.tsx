import React, { useEffect, useState } from "react";

interface BoxOfficeMeterProps {
  rating: number;
}

type Verdict = {
  label: string;
  icon: string;
  percent: number;
  color: string;
  gradient: string;
  glow: string;
};

const getVerdict = (rating: number): Verdict => {
  if (rating >= 4.0)
    return {
      label: "Blockbuster",
      icon: "🔥",
      percent: 100,
      color: "#FFD700",
      gradient: "from-yellow-400 via-amber-500 to-red-600",
      glow: "rgba(255,215,0,0.6)",
    };
  if (rating >= 3.6)
    return {
      label: "Hit",
      icon: "✅",
      percent: 80,
      color: "#FFC107",
      gradient: "from-yellow-300 via-yellow-500 to-amber-600",
      glow: "rgba(255,193,7,0.55)",
    };
  if (rating >= 3.0)
    return {
      label: "Average",
      icon: "👍",
      percent: 60,
      color: "#FFA500",
      gradient: "from-amber-400 via-orange-500 to-orange-600",
      glow: "rgba(255,165,0,0.5)",
    };
  if (rating >= 2.6)
    return {
      label: "Flop",
      icon: "⚠️",
      percent: 40,
      color: "#FF6B35",
      gradient: "from-orange-500 via-red-500 to-red-700",
      glow: "rgba(255,107,53,0.5)",
    };
  return {
    label: "Disaster",
    icon: "❌",
    percent: 20,
    color: "#DC2626",
    gradient: "from-red-600 via-red-700 to-red-900",
    glow: "rgba(220,38,38,0.55)",
  };
};

export const BoxOfficeMeter: React.FC<BoxOfficeMeterProps> = ({ rating }) => {
  const verdict = getVerdict(rating);
  const [fill, setFill] = useState(0);
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setFill(verdict.percent), 200);
    return () => clearTimeout(t);
  }, [verdict.percent]);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1600;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * verdict.percent));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const delay = setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, 200);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [verdict.percent]);

  return (
    <div
      className={`relative max-w-2xl mx-auto mt-6 rounded-2xl overflow-hidden transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        background:
          "linear-gradient(135deg, rgba(20,10,10,0.85), rgba(40,10,10,0.75) 50%, rgba(10,10,10,0.9))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,215,0,0.25)",
        boxShadow: `0 10px 40px -10px ${verdict.glow}, inset 0 1px 0 rgba(255,215,0,0.15)`,
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(255,215,0,0.18), transparent 50%), radial-gradient(circle at 80% 100%, rgba(220,38,38,0.18), transparent 50%)",
        }}
      />

      <div className="relative p-5 sm:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
          <div>
            <h3
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
              style={{
                background:
                  "linear-gradient(90deg,#FFD700,#FFA500,#FF4500,#FFD700)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "festival-shimmer 4s linear infinite",
              }}
            >
              🎬 SM Box Office Prediction Meter
            </h3>
            <p className="text-xs sm:text-sm text-yellow-200/70 mt-1 italic">
              Based on SM Reviews rating analysis.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-yellow-500/30">
            <span className="text-yellow-400 text-sm font-semibold">
              ⭐ {rating.toFixed(1)}/5
            </span>
          </div>
        </div>

        {/* Verdict row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-3xl sm:text-4xl"
              style={{ filter: `drop-shadow(0 0 8px ${verdict.glow})` }}
            >
              {verdict.icon}
            </span>
            <span
              className="text-lg sm:text-2xl font-extrabold uppercase tracking-wider"
              style={{
                color: verdict.color,
                textShadow: `0 0 12px ${verdict.glow}`,
              }}
            >
              {verdict.label}
            </span>
          </div>
          <div
            className="text-2xl sm:text-3xl font-black tabular-nums"
            style={{
              color: verdict.color,
              textShadow: `0 0 14px ${verdict.glow}`,
            }}
          >
            {count}%
          </div>
        </div>

        {/* Meter */}
        <div
          className="relative h-5 sm:h-6 rounded-full overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,215,0,0.2)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)",
          }}
        >
          {/* Tick marks */}
          {[20, 40, 60, 80].map((t) => (
            <div
              key={t}
              className="absolute top-0 bottom-0 w-px bg-white/10"
              style={{ left: `${t}%` }}
            />
          ))}

          {/* Fill */}
          <div
            className={`h-full bg-gradient-to-r ${verdict.gradient} relative transition-all ease-out`}
            style={{
              width: `${fill}%`,
              transitionDuration: "1600ms",
              boxShadow: `0 0 20px ${verdict.glow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
            }}
          >
            {/* moving shimmer */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                animation: "shimmer 2.2s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-yellow-200/60 font-semibold">
          <span>❌ 20</span>
          <span>⚠️ 40</span>
          <span>👍 60</span>
          <span>✅ 80</span>
          <span>🔥 100</span>
        </div>
      </div>
    </div>
  );
};

export default BoxOfficeMeter;
