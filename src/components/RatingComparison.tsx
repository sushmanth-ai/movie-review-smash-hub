import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, TrendingDown, Minus, Film } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface RatingComparisonProps {
  criticRating: number;
  movieId: string;
}

export const RatingComparison: React.FC<RatingComparisonProps> = ({
  criticRating,
  movieId
}) => {
  const [audienceRating, setAudienceRating] = useState<number>(0);
  const [audienceCount, setAudienceCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAudienceRating = async () => {
      if (!db || !movieId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const ratingRef = doc(db, 'userRatings', movieId);
        const ratingDoc = await getDoc(ratingRef);
        
        if (ratingDoc.exists()) {
          const data = ratingDoc.data();
          setAudienceRating(data.averageRating || 0);
          setAudienceCount(data.ratingCount || 0);
        }
      } catch (error) {
        console.error('Error loading audience rating:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudienceRating();
  }, [movieId]);
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
    <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-xl p-5 border-2 border-primary/30 shadow-[0_0_25px_rgba(255,215,0,0.2)]">
      {/* Beautiful Heading with Logo */}
      <div className="flex items-center justify-center gap-3 mb-5 pb-3 border-b border-primary/20">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          <Film className="w-5 h-5 text-black" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-extrabold bg-gradient-to-r from-primary via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            SM REVIEWS 3.0
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rating Comparison</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Critic Rating */}
        <div className="text-center p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/40 shadow-inner">
          <div className="text-xs text-primary font-bold mb-2 flex items-center justify-center gap-1">
            🎬 <span>CRITIC</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">{criticRating}</span>
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
        
        {/* Audience Rating */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-500/15 to-blue-500/5 rounded-xl border border-blue-500/40 shadow-inner">
          <div className="text-xs text-blue-400 font-bold mb-2 flex items-center justify-center gap-1">
            👥 <span>AUDIENCE</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            {isLoading ? (
              <span className="text-3xl font-black text-blue-400 animate-pulse">...</span>
            ) : (
              <>
                <span className="text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {audienceCount > 0 ? audienceRating : '—'}
                </span>
                {audienceCount > 0 && <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />}
              </>
            )}
          </div>
          {audienceCount > 0 && (
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              ({audienceCount} votes)
            </div>
          )}
        </div>
      </div>
      
      {/* Insight */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-background/60 rounded-lg p-3 border border-muted/20">
        {getInsightIcon()}
        <span className="font-medium">{getInsightText()}</span>
      </div>
    </div>
  );
};
