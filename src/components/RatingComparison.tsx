import React from 'react';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RatingComparisonProps {
  criticRating: number;
  audienceRating: number;
  audienceCount: number;
}

export const RatingComparison: React.FC<RatingComparisonProps> = ({
  criticRating,
  audienceRating,
  audienceCount
}) => {
  const difference = audienceRating - criticRating;
  const absDiff = Math.abs(difference);
  
  const getInsightText = () => {
    if (audienceCount === 0) {
      return "Be the first to rate this movie!";
    }
    if (absDiff < 0.3) {
      return "Critics and audience agree on this one!";
    }
    if (difference > 0) {
      return "Audience loved this movie more than critics.";
    }
    return "Critics appreciated the craft more than viewers.";
  };

  const getInsightIcon = () => {
    if (audienceCount === 0 || absDiff < 0.3) {
      return <Minus className="w-4 h-4 text-blue-400" />;
    }
    if (difference > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
      <h4 className="text-sm font-bold text-primary mb-4 text-center uppercase tracking-wide">
        Rating Comparison
      </h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Critic Rating */}
        <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/30">
          <div className="text-xs text-primary font-bold mb-1">🎬 CRITIC</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-extrabold text-primary">{criticRating}</span>
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
          </div>
        </div>
        
        {/* Audience Rating */}
        <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <div className="text-xs text-blue-400 font-bold mb-1">👥 AUDIENCE</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-extrabold text-blue-400">
              {audienceCount > 0 ? audienceRating : '—'}
            </span>
            {audienceCount > 0 && <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />}
          </div>
          {audienceCount > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              ({audienceCount} votes)
            </div>
          )}
        </div>
      </div>
      
      {/* Insight */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-background/50 rounded-md p-2">
        {getInsightIcon()}
        <span>{getInsightText()}</span>
      </div>
    </div>
  );
};
