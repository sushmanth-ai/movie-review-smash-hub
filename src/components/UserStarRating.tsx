import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getUserMovieRating, saveUserMovieRating, getDeviceId } from '@/utils/deviceFingerprint';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useToast } from '@/hooks/use-toast';

interface UserStarRatingProps {
  movieId: string;
  onRatingChange?: (newAverage: number, count: number) => void;
}

export const UserStarRating: React.FC<UserStarRatingProps> = ({ movieId, onRatingChange }) => {
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load user's existing rating from localStorage
    const savedRating = getUserMovieRating(movieId);
    if (savedRating) {
      setUserRating(savedRating);
    }
    
    // Load aggregate rating from Firebase
    loadAggregateRating();
  }, [movieId]);

  const loadAggregateRating = async () => {
    if (!db) return;
    
    try {
      const ratingRef = doc(db, 'userRatings', movieId);
      const ratingDoc = await getDoc(ratingRef);
      
      if (ratingDoc.exists()) {
        const data = ratingDoc.data();
        setAverageRating(data.averageRating || 0);
        setRatingCount(data.ratingCount || 0);
      }
    } catch (error) {
      console.error('Error loading aggregate rating:', error);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const previousRating = userRating;
    const deviceHash = getDeviceId();
    
    try {
      // Update local state immediately
      setUserRating(rating);
      saveUserMovieRating(movieId, rating);
      
      if (!db) {
        toast({
          title: 'Rating saved locally!',
          description: `You rated this movie ${rating}/5 stars`,
        });
        setIsSubmitting(false);
        return;
      }

      const ratingRef = doc(db, 'userRatings', movieId);
      
      await runTransaction(db, async (transaction) => {
        const ratingDoc = await transaction.get(ratingRef);
        
        let totalSum = 0;
        let count = 0;
        
        if (ratingDoc.exists()) {
          const data = ratingDoc.data();
          totalSum = data.totalRatingSum || 0;
          count = data.ratingCount || 0;
        }
        
        if (previousRating !== null) {
          // User is updating their rating
          totalSum = totalSum - previousRating + rating;
        } else {
          // New rating
          totalSum = totalSum + rating;
          count = count + 1;
        }
        
        const newAverage = count > 0 ? Math.round((totalSum / count) * 10) / 10 : 0;
        
        transaction.set(ratingRef, {
          movieId,
          totalRatingSum: totalSum,
          ratingCount: count,
          averageRating: newAverage,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
        
        setAverageRating(newAverage);
        setRatingCount(count);
        
        if (onRatingChange) {
          onRatingChange(newAverage, count);
        }
      });
      
      toast({
        title: previousRating ? 'Rating updated!' : 'Thanks for rating!',
        description: `You rated this movie ${rating}/5 stars`,
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Rating saved locally',
        description: 'Rating saved on your device',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/30">
      <div className="flex flex-col items-center gap-3">
        
        {/* Audience Stats - Show First */}
        {ratingCount > 0 && (
          <div className="text-center w-full pb-3 border-b border-blue-500/20">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-2">
              👥 Audience Rating
            </h4>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-blue-400">{averageRating}</span>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              {ratingCount} {ratingCount === 1 ? 'user' : 'users'} rated
            </p>
          </div>
        )}
        
        {/* User's Rating Input - Show After */}
        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wide">
          ⭐ Rate This Movie
        </h4>
        
        {/* Star Rating Input */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={isSubmitting}
              className={`transition-transform duration-200 ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-125'
              }`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-500'
                }`}
              />
            </button>
          ))}
        </div>
        
        {userRating && (
          <p className="text-xs text-purple-300">
            You rated: {userRating}/5 stars
          </p>
        )}
      </div>
    </div>
  );
};
