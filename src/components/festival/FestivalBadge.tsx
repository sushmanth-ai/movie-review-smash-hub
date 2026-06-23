import React from 'react';
import { useFestivalContext } from './FestivalContext';

interface FestivalBadgeProps {
  className?: string;
}

export const FestivalBadge: React.FC<FestivalBadgeProps> = ({ className = '' }) => {
  const { activeFestival, isActive } = useFestivalContext();

  if (!isActive || !activeFestival) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5 rounded-full
        text-xs font-bold
        bg-gradient-to-r from-primary/20 to-accent/10
        border border-primary/30
        text-primary
        animate-festival-glow
        ${className}
      `}
    >
      <span className="text-sm">{activeFestival.bannerEmoji}</span>
      <span className="hidden sm:inline">{activeFestival.name}</span>
    </span>
  );
};
