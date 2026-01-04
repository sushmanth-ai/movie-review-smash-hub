import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { MovieReview, movieReviewsData } from '@/data/movieReviews';

export interface TrendingReviewData {
  reviewId: string;
  title: string;
  image: string;
  weeklyViews: number;
  weeklyLikes: number;
  weeklyComments: number;
  weeklyReactions: number;
  trendingScore: number;
  rank: number;
}

// Get the current week's Monday and Sunday in UTC
const getWeekBounds = (): { weekStart: Date; weekEnd: Date } => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() + diffToMonday);
  weekStart.setUTCHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
};

// Get current week key (e.g., "2026-W01")
export const getCurrentWeekKey = (): string => {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Calculate trending score using the formula
const calculateTrendingScore = (
  weeklyViews: number,
  weeklyLikes: number,
  weeklyComments: number,
  weeklyReactions: number
): number => {
  return (weeklyViews * 1) + (weeklyLikes * 3) + (weeklyComments * 5) + (weeklyReactions * 2);
};

export const useTrendingReviews = () => {
  const [trendingReviews, setTrendingReviews] = useState<TrendingReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrendingData = async () => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    try {
      const weekKey = getCurrentWeekKey();
      
      // Get all reviews (Firebase + static)
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const allReviews: { id: string; title: string; image: string }[] = [];
      
      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        allReviews.push({
          id: doc.id,
          title: data.title,
          image: data.image
        });
      });
      
      // Add static reviews
      movieReviewsData.forEach((review) => {
        if (!allReviews.find(r => r.id === review.id)) {
          allReviews.push({
            id: review.id,
            title: review.title,
            image: review.image
          });
        }
      });

      // Get weekly metrics for each review
      const trendingData: TrendingReviewData[] = [];

      for (const review of allReviews) {
        const metricsRef = doc(db, 'weeklyMetrics', `${review.id}_${weekKey}`);
        const metricsSnap = await getDoc(metricsRef);
        
        let weeklyViews = 0;
        let weeklyLikes = 0;
        let weeklyComments = 0;
        let weeklyReactions = 0;

        if (metricsSnap.exists()) {
          const data = metricsSnap.data();
          weeklyViews = data.views || 0;
          weeklyLikes = data.likes || 0;
          weeklyComments = data.comments || 0;
          weeklyReactions = data.reactions || 0;
        }

        // Also get total views/likes if no weekly data
        if (weeklyViews === 0) {
          const viewsRef = doc(db, 'reviewViews', review.id);
          const viewsSnap = await getDoc(viewsRef);
          if (viewsSnap.exists()) {
            weeklyViews = Math.min(viewsSnap.data().count || 0, 50); // Cap for fairness
          }
        }

        if (weeklyLikes === 0) {
          const likesRef = doc(db, 'likes', review.id);
          const likesSnap = await getDoc(likesRef);
          if (likesSnap.exists()) {
            weeklyLikes = Math.min(likesSnap.data().count || 0, 20); // Cap for fairness
          }
        }

        const trendingScore = calculateTrendingScore(
          weeklyViews,
          weeklyLikes,
          weeklyComments,
          weeklyReactions
        );

        if (trendingScore > 0) {
          trendingData.push({
            reviewId: review.id,
            title: review.title,
            image: review.image,
            weeklyViews,
            weeklyLikes,
            weeklyComments,
            weeklyReactions,
            trendingScore,
            rank: 0
          });
        }
      }

      // Sort by trending score and assign ranks
      trendingData.sort((a, b) => b.trendingScore - a.trendingScore);
      trendingData.forEach((item, index) => {
        item.rank = index + 1;
      });

      setTrendingReviews(trendingData.slice(0, 10)); // Top 10
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading trending data:', error);
      setIsLoading(false);
    }
  };

  // Track weekly interaction
  const trackWeeklyInteraction = async (
    reviewId: string,
    type: 'view' | 'like' | 'comment' | 'reaction'
  ) => {
    if (!db) return;

    const weekKey = getCurrentWeekKey();
    const metricsRef = doc(db, 'weeklyMetrics', `${reviewId}_${weekKey}`);

    try {
      const { runTransaction } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const metricsDoc = await transaction.get(metricsRef);
        const currentData = metricsDoc.exists() ? metricsDoc.data() : {
          views: 0,
          likes: 0,
          comments: 0,
          reactions: 0
        };

        const fieldMap = {
          view: 'views',
          like: 'likes',
          comment: 'comments',
          reaction: 'reactions'
        };

        transaction.set(metricsRef, {
          ...currentData,
          [fieldMap[type]]: (currentData[fieldMap[type]] || 0) + 1,
          reviewId,
          weekKey,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      });
    } catch (error) {
      console.error('Error tracking weekly interaction:', error);
    }
  };

  useEffect(() => {
    loadTrendingData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadTrendingData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    trendingReviews,
    isLoading,
    trackWeeklyInteraction,
    refreshTrending: loadTrendingData
  };
};
