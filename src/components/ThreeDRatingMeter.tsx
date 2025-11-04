import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ThreeDRatingMeterProps {
  rating: number; // Rating out of 5
  size?: number;
}

export const ThreeDRatingMeter: React.FC<ThreeDRatingMeterProps> = ({
  rating,
  size = 140,
}) => {
  const [showRating, setShowRating] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedRating, setAnimatedRating] = useState(0);

  const targetPercentage = Math.min(100, Math.max(0, (rating / 5) * 100));

  useEffect(() => {
    if (showRating) {
      let currentPercentage = 0;
      let currentRating = 0;

      const duration = 2000; // 2 seconds
      const steps = 60; // number of animation frames
      const incrementPercentage = targetPercentage / steps;
      const incrementRating = rating / steps;
      const stepDuration = duration / steps;

      const interval = setInterval(() => {
        currentPercentage += incrementPercentage;
        currentRating += incrementRating;

        if (currentPercentage >= targetPercentage) {
          setAnimatedPercentage(targetPercentage);
          setAnimatedRating(rating);
          clearInterval(interval);
        } else {
          setAnimatedPercentage(currentPercentage);
          setAnimatedRating(currentRating);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [showRating, targetPercentage, rating]);

  if (!showRating) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Button
          onClick={() => setShowRating(true)}
          className="bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:shadow-[0_0_40px_rgba(255,215,0,0.8)] hover:scale-105 transition-all duration-300 border-2 border-primary/50"
        >
          Click to See Rating
        </Button>
      </div>
    );
  }

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
            strokeDasharray={`${(animatedPercentage / 100) * Math.PI * (size - 16)}, 999`}
            fill="none"
            className="transition-all duration-100"
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
        <span className="text-3xl">
          {animatedRating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">/5</span>
      </div>
    </div>
  );
};
