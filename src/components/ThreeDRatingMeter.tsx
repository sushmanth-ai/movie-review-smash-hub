import React from "react";

interface ThreeDRatingMeterProps {
  rating: number; // Rating out of 5
  size?: number;
}

export const ThreeDRatingMeter: React.FC<ThreeDRatingMeterProps> = ({
  rating,
  size = 140,
}) => {
  const percentage = Math.min(100, Math.max(0, (rating / 5) * 100));

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
    >
      {/* 3D Background Circle */}
      <div
        className="relative w-full h-full rounded-full"
        style={{
          transform: "rotateX(25deg)",
          background:
            "radial-gradient(circle at 30% 30%, #2a2a2a, #000000 80%)",
          boxShadow:
            "inset 0 0 20px rgba(255, 215, 0, 0.2), 0 20px 30px rgba(0,0,0,0.3)",
        }}
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 16) / 2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="14"
            fill="none"
          />
          {/* Golden Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 16) / 2}
            stroke="url(#goldGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * Math.PI * (size - 16)}, 999`}
            fill="none"
            className="transition-all duration-700"
            filter="url(#glow)"
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <filter id="glow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFD700" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Rating Number */}
      <div
        className="absolute flex flex-col items-center justify-center font-extrabold"
        style={{
          transform: "translateZ(35px) rotateX(-25deg)",
          color: "#FFD700",
          textShadow: "0 0 12px rgba(255, 215, 0, 0.8)",
        }}
      >
        <span className="text-3xl">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-400">/5</span>
      </div>
    </div>
  );
};
