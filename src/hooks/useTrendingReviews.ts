import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { movieReviewsData } from '@/data/movieReviews';

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

// Cache for trending data
let cachedTrendingData: TrendingReviewData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

export const useTrendingReviews = () => {
  const [trendingReviews, setTrendingReviews] = useState<TrendingReviewData[]>(cachedTrendingData || []);
  const [isLoading, setIsLoading] = useState(!cachedTrendingData);
  const loadingRef = useRef(false);

  const loadTrendingData = async (forceRefresh = false) => {
    // Return cached data if still valid
    if (!forceRefresh && cachedTrendingData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setTrendingReviews(cachedTrendingData);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!db) {
      // Fallback to static data with mock scores
      const staticTrending = movieReviewsData.slice(0, 10).map((review, index) => ({
        reviewId: review.id,
        title: review.title,
        image: review.image,
        weeklyViews: Math.floor(Math.random() * 100) + 10,
        weeklyLikes: Math.floor(Math.random() * 50) + 5,
        weeklyComments: Math.floor(Math.random() * 20),
        weeklyReactions: Math.floor(Math.random() * 30),
        trendingScore: 100 - index * 10,
        rank: index + 1
      }));
      setTrendingReviews(staticTrending);
      setIsLoading(false);
      loadingRef.current = false;
      return;
    }

    try {
      const weekKey = getCurrentWeekKey();
      
      // Start with static reviews (instant)
      const allReviews: { id: string; title: string; image: string }[] = 
        movieReviewsData.map(r => ({ id: r.id, title: r.title, image: r.image }));

      // Fetch Firebase reviews and weekly metrics in parallel
      const [reviewsSnapshot, weeklyMetricsSnapshot] = await Promise.all([
        getDocs(collection(db, 'reviews')),
        getDocs(collection(db, 'weeklyMetrics'))
      ]);

      // Build weekly metrics map filtered by current week
      const weeklyMap = new Map<string, { views: number; likes: number; comments: number; reactions: number }>();
      weeklyMetricsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.weekKey === weekKey) {
          weeklyMap.set(data.reviewId, {
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            reactions: data.reactions || 0
          });
        }
      });

      // Add Firebase reviews
      reviewsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!allReviews.find(r => r.id === docSnap.id)) {
          allReviews.push({
            id: docSnap.id,
            title: data.title,
            image: data.image
          });
        }
      });

      // Calculate scores using weekly metrics
      const trendingData: TrendingReviewData[] = allReviews.map(review => {
        const metrics = weeklyMap.get(review.id) || { views: 0, likes: 0, comments: 0, reactions: 0 };
        const trendingScore = calculateTrendingScore(metrics.views, metrics.likes, metrics.comments, metrics.reactions);

        return {
          reviewId: review.id,
          title: review.title,
          image: review.image,
          weeklyViews: metrics.views,
          weeklyLikes: metrics.likes,
          weeklyComments: metrics.comments,
          weeklyReactions: metrics.reactions,
          trendingScore,
          rank: 0
        };
      }).filter(item => item.trendingScore > 0);

      // Sort and assign ranks
      trendingData.sort((a, b) => b.trendingScore - a.trendingScore);
      trendingData.forEach((item, index) => {
        item.rank = index + 1;
      });

      const result = trendingData.slice(0, 10);
      
      // Update cache
      cachedTrendingData = result;
      cacheTimestamp = Date.now();

      setTrendingReviews(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading trending data:', error);
      setIsLoading(false);
    } finally {
      loadingRef.current = false;
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
