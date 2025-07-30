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
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  
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
    trackDailyView
  } = useFirebaseOperations();

  useEffect(() => {
    initializeReviews();
    loadLikes(setReviews);
    loadComments(setReviews);
    loadTodayViews();
    trackDailyView();
  }, []);

  const initializeReviews = async () => {
    const reviewsWithInteractions: MovieReview[] = movieReviewsData.map(review => ({
      ...review,
      likes: 0,
      comments: []
    }));
    setReviews(reviewsWithInteractions);
  };

  const handleToggleComments = (reviewId: string) => {
    setShowComments(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const handleCommentChange = (reviewId: string, value: string) => {
    setNewComment(prev => ({ ...prev, [reviewId]: value }));
  };

  const handleCommentSubmit = (reviewId: string) => {
    const commentText = newComment[reviewId];
    handleComment(reviewId, commentText, setReviews, setNewComment);
  };

  const filteredReviews = reviews.filter(review =>
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3a 25%, #2d1b69 50%, #44318d 75%, #6a4c93 100%)' }}>
      {/* Fixed Header with Gradient Background */}
      <div
        className="fixed top-0 left-0 w-full z-50 p-4 shadow-lg border-b"
        style={{
          background: 'linear-gradient(135deg, #E589A9, #E52042)',
        }}
      >
        <h1 className="text-center text-2xl font-bold mb-4 text-white">
          WELCOME TO SM REVIEW 2.0
        </h1>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Search for movie Reviews..."
            className="flex-1 bg-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Today Views Card - Outside Header */}
      <div className="container mx-auto px-4 pt-32">
        <TodayViews viewCount={todayViews} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-0 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <MovieCard
              key={review.id}
              review={review}
              showComments={showComments[review.id] || false}
              newComment={newComment[review.id] || ''}
              onLike={(reviewId) => handleLike(reviewId, setReviews)}
              onToggleComments={handleToggleComments}
              onShare={handleShare}
              onCommentChange={handleCommentChange}
              onCommentSubmit={handleCommentSubmit}
              isLiked={likedReviews.has(review.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
