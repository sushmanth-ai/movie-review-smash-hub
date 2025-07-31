import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MovieReview, movieReviewsData } from '@/data/movieReviews';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import { MovieCard } from '@/components/MovieCard';
import { TodayViews } from '@/components/TodayViews';
const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [newComment, setNewComment] = useState<{
    [key: string]: string;
  }>({});
  const [showComments, setShowComments] = useState<{
    [key: string]: boolean;
  }>({});
  const {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleShare,
    likedReviews,
    clearLikedReviews,
    todayViews,
    loadTodayViews,
    trackDailyView,
    setupRealTimeViewListener,
    resetTodayViews
  } = useFirebaseOperations();

  const [realTimeViewCount, setRealTimeViewCount] = useState(todayViews);

  // Reset view count on component mount
  useEffect(() => {
    resetTodayViews();
  }, []);
  useEffect(() => {
    initializeReviews();
    loadLikes(setReviews);
    loadComments(setReviews);
    loadTodayViews();
    trackDailyView();

    // Setup real-time listener for view count
    const unsubscribe = setupRealTimeViewListener(setRealTimeViewCount);
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Update realTimeViewCount when todayViews changes
  useEffect(() => {
    setRealTimeViewCount(todayViews);
  }, [todayViews]);
  const initializeReviews = async () => {
    const reviewsWithInteractions: MovieReview[] = movieReviewsData.map(review => ({
      ...review,
      likes: 0,
      comments: []
    }));
    setReviews(reviewsWithInteractions);
  };
  const handleToggleComments = (reviewId: string) => {
    setShowComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };
  const handleCommentChange = (reviewId: string, value: string) => {
    setNewComment(prev => ({
      ...prev,
      [reviewId]: value
    }));
  };
  const handleCommentSubmit = (reviewId: string) => {
    const commentText = newComment[reviewId];
    handleComment(reviewId, commentText, setReviews, setNewComment);
  };
  const filteredReviews = reviews.filter(review => review.title.toLowerCase().includes(searchTerm.toLowerCase()) || review.review.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="min-h-screen" style={{
    background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)'
  }}>
      {/* Fixed Header with Gradient Background */}
      <div className="fixed top-0 left-0 w-full z-50 p-2 shadow-lg border-b" style={{
      background: 'linear-gradient(135deg, #E589A9, #E52042)'
    }}>
        <h1 className="text-center text-lg font-bold mb-2 text-white">
          WELCOME TO SM REVIEW 2.0
        </h1>
        <div className="flex gap-2 mb-2">
          <Input type="text" placeholder="Search for movie Reviews..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-pink-100" />
        </div>
      </div>

      {/* Today Views Card - Outside Header */}
      <div className="container mx-auto px-4 pt-24">
        <TodayViews viewCount={realTimeViewCount} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-0 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => <MovieCard key={review.id} review={review} showComments={showComments[review.id] || false} newComment={newComment[review.id] || ''} onLike={reviewId => handleLike(reviewId, setReviews)} onToggleComments={handleToggleComments} onShare={handleShare} onCommentChange={handleCommentChange} onCommentSubmit={handleCommentSubmit} isLiked={likedReviews.has(review.id)} />)}
        </div>
      </div>
    </div>;
};
export default Index;