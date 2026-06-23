import React, { useEffect, useRef, useState } from "react";

interface SMCriticsMeterProps {
  rating: number; // 0 - 5
  size?: number; // optional fixed size; otherwise responsive to container
}

// Zones ordered LEFT → RIGHT (low → high)
const ZONES = [
  { from: 0.0, to: 2.9, color: "#ef4444", glow: "rgba(239,68,68,0.7)" },   // Red
  { from: 2.9, to: 3.5, color: "#f97316", glow: "rgba(249,115,22,0.7)" },  // Orange
  { from: 3.5, to: 3.9, color: "#facc15", glow: "rgba(250,204,21,0.7)" },  // Yellow
  { from: 3.9, to: 5.0, color: "#22c55e", glow: "rgba(34,197,94,0.7)" },   // Green
];

// Map rating (0..5) to needle angle (-90° left .. +90° right), 0° = straight up
const ratingToAngle = (r: number) => (r / 5) * 180 - 90;

// Polar helper: angle in degrees where 0° points UP, clockwise positive
const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

export const SMCriticsMeter: React.FC<SMCriticsMeterProps> = ({ rating, size: sizeProp }) => {
  const clamped = Math.max(0, Math.min(5, rating || 0));
  const targetAngle = ratingToAngle(clamped);

  const [animAngle, setAnimAngle] = useState(-90);
  const [animRating, setAnimRating] = useState(0);

  // Responsive size: track container width, clamp between 220 and 340
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoSize, setAutoSize] = useState<number>(sizeProp ?? 300);
  useEffect(() => {
    if (sizeProp) return;
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || 300;
      setAutoSize(Math.max(220, Math.min(340, w - 16)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [sizeProp]);
  const size = sizeProp ?? autoSize;

  // Trigger animation only when the meter scrolls into view (once per visit)
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const node = containerRef.current;
    if (!node || hasAnimated) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.35) {
            setHasAnimated(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.35, 0.6, 1] }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const start = performance.now();
    const duration = 2000;
    const startAngle = -90;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimAngle(startAngle + eased * (targetAngle - startAngle));
      setAnimRating(eased * clamped);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetAngle, clamped, hasAnimated]);

  // Semicircle layout
  const width = size;
  const height = Math.round(size * 0.62);
  const cx = width / 2;
  const cy = Math.round(size * 0.52);
  const strokeWidth = Math.round(size * 0.08);
  const r = (size - strokeWidth) / 2 - 8;

  const activeZone = ZONES.find((z) => clamped >= z.from && clamped <= z.to) || ZONES[0];

  const ticks = Array.from({ length: 21 }, (_, i) => -90 + (i / 20) * 180);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full mx-auto"
      style={{ maxWidth: 360 }}
    >
      <div className="relative" style={{ width, height: height + 16 }}>
      {/* Glass backdrop (semi-pill shape) */}
      <div
        className="absolute inset-x-0 top-0 rounded-[50%/100%] rounded-b-3xl"
        style={{
          height: height,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08), rgba(0,0,0,0.85) 70%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 20px 60px -20px ${activeZone.glow}, inset 0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)`,
          transition: "box-shadow 600ms ease",
        }}
      />


      <svg
        width={width}
        height={height + 20}
        viewBox={`0 0 ${width} ${height + 20}`}
        className="relative"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <filter id="zone-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
          {/* Single horizontal gradient mapped to the semicircle's x-extent.
              Stops are positioned at the x-projection of each rating boundary
              so colors line up with zones while rendering as ONE continuous band. */}
          <linearGradient
            id="arc-grad"
            gradientUnits="userSpaceOnUse"
            x1={cx - r}
            y1={cy}
            x2={cx + r}
            y2={cy}
          >
            {(() => {
              const xOff = (rating: number) => {
                const deg = ratingToAngle(rating);
                const rad = ((deg - 90) * Math.PI) / 180;
                const x = cx + r * Math.cos(rad);
                return Math.max(0, Math.min(1, (x - (cx - r)) / (2 * r)));
              };
              const bounds = [0, 2.9, 3.5, 3.9, 5];
              const stops: { off: number; color: string }[] = [];
              const blend = 0.012;
              for (let i = 0; i < ZONES.length; i++) {
                const a = xOff(bounds[i]);
                const b = xOff(bounds[i + 1]);
                const startOff = i === 0 ? a : a + blend;
                const endOff = i === ZONES.length - 1 ? b : b - blend;
                stops.push({ off: startOff, color: ZONES[i].color });
                stops.push({ off: endOff, color: ZONES[i].color });
              }
              return stops.map((s, idx) => (
                <stop key={idx} offset={`${(s.off * 100).toFixed(3)}%`} stopColor={s.color} />
              ));
            })()}
          </linearGradient>
        </defs>

        {/* Track (background arc) */}
        <path
          d={arcPath(cx, cy, r, -90, 90)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* Single continuous color arc */}
        <path
          d={arcPath(cx, cy, r, -90, 90)}
          fill="none"
          stroke="url(#arc-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          filter="url(#zone-glow)"
        />

        {/* Tick marks */}
        {ticks.map((deg, i) => {
          const isMajor = i % 5 === 0;
          const innerR = r - strokeWidth / 2 - 4;
          const outerR = innerR - (isMajor ? 12 : 6);
          const p1 = polar(cx, cy, innerR, deg);
          const p2 = polar(cx, cy, outerR, deg);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={isMajor ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)"}
              strokeWidth={isMajor ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle (rotates clockwise from left -90° to right +90°) */}
        <g
          style={{
            transform: `rotate(${animAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "filter 400ms ease",
            filter: `drop-shadow(0 0 8px ${activeZone.glow})`,
          }}
        >
          <polygon
            points={`${cx - 4},${cy + 10} ${cx + 4},${cy + 10} ${cx + 1.5},${cy - r + strokeWidth + 6} ${cx - 1.5},${cy - r + strokeWidth + 6}`}
            fill="url(#needle-grad)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="0.5"
          />
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
      </div>

      {/* Premium rating card below the meter (normal flow, spaced) */}
      <div
        className="flex items-center justify-center w-full"
        style={{ marginTop: "clamp(20px, 4vw, 30px)" }}
      >
        <div
          className="relative flex items-baseline justify-center gap-1"
          style={{
            paddingInline: "clamp(16px, 4vw, 22px)",
            paddingBlock: "clamp(8px, 2vw, 12px)",
            borderRadius: 18,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(20,20,20,0.85) 100%)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            border: `1.5px solid ${activeZone.color}33`,
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.6) inset,
              0 8px 32px -8px rgba(0,0,0,0.8),
              0 0 24px -4px ${activeZone.glow},
              0 0 60px -20px ${activeZone.glow}
            `,
            transition: "border-color 600ms ease, box-shadow 600ms ease",
            animation: "fadeInUp 800ms ease-out forwards",
            opacity: 0,
          }}
        >
          {/* Animated glowing border ring */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[18px]"
            style={{
              padding: 1.5,
              background: `linear-gradient(120deg, transparent 30%, ${activeZone.color}66 50%, transparent 70%)`,
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              animation: "rotateGlow 3s linear infinite",
              opacity: 0.6,
            }}
          />

          {/* Subtle top reflection highlight */}
          <div
            className="pointer-events-none absolute inset-x-3 top-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeZone.color}55, transparent)`,
              borderRadius: "inherit",
            }}
          />

          <span
            className="font-black tabular-nums tracking-tight"
            style={{
              fontSize: Math.max(28, size * 0.13),
              lineHeight: 1,
              color: activeZone.color,
              textShadow: `0 0 18px ${activeZone.glow}`,
              transition: "color 400ms ease, text-shadow 400ms ease",
            }}
          >
            {animRating.toFixed(1)}
          </span>
          <span
            className="font-bold opacity-70"
            style={{
              fontSize: Math.max(14, size * 0.065),
              color: "rgba(255,255,255,0.65)",
            }}
          >
            /5
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rotateGlow {
          0% { filter: hue-rotate(0deg); opacity: 0.5; }
          50% { opacity: 0.9; }
          100% { filter: hue-rotate(360deg); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};


export default SMCriticsMeter;
