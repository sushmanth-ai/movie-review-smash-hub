import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MovieReview, movieReviewsData } from '@/data/movieReviews';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import { MovieCard } from '@/components/MovieCard';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { TodayViews } from '@/components/TodayViews';
import { ReviewCarousel } from '@/components/ReviewCarousel';

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
    handleReply,
    handleShare,
    likedReviews,
    clearLikedReviews,
    todayViews,
    loadTodayViews,
    trackDailyView,
    setupRealTimeViewListener
  } = useFirebaseOperations();

  const [realTimeViewCount, setRealTimeViewCount] = useState(todayViews);

  // Load reviews from Firebase and merge with static data
  useEffect(() => {
    if (!db) {
      // If Firebase not available, use static data
      initializeReviews();
      return;
    }

    // Listen to Firebase reviews in real-time
    const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const firebaseReviews: MovieReview[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        firebaseReviews.push({
          id: doc.id,
          title: data.title,
          image: data.image,
          review: data.review,
          firstHalf: data.firstHalf,
          secondHalf: data.secondHalf,
          positives: data.positives,
          negatives: data.negatives,
          overall: data.overall,
          rating: data.rating,
          likes: 0,
          comments: []
        });
      });

      // Combine Firebase reviews with static reviews
      const staticReviews: MovieReview[] = movieReviewsData.map(review => ({
        ...review,
        likes: 0,
        comments: []
      }));

      // Firebase reviews first, then static reviews
      const allReviews = [...firebaseReviews, ...staticReviews];
      setReviews(allReviews);
      
      // Load likes and comments for all reviews
      loadLikes(setReviews);
      loadComments(setReviews);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
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

  const handleReplySubmit = (reviewId: string, commentId: string, replyText: string) => {
    handleReply(reviewId, commentId, replyText, setReviews);
  };
  const filteredReviews = reviews.filter(review => review.title.toLowerCase().includes(searchTerm.toLowerCase()) || review.review.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="min-h-screen bg-background">
      {/* Fixed Header with Black and Gold Theme */}
      <div className="fixed top-0 left-0 w-full z-50 p-2 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
        <h1 className="text-center text-lg font-bold mb-2 text-primary">
          WELCOME TO SM REVIEW 2.0
        </h1>
        <div className="flex gap-2 mb-2">
          <Input 
            type="text" 
            placeholder="Search for movie Reviews..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="flex-1 bg-input text-foreground border-primary focus:ring-primary" 
          />
        </div>
      </div>

      {/* Today Views Card - Outside Header */}
      <div className="container mx-auto px-4 pt-24">
        <TodayViews viewCount={realTimeViewCount} />
      </div>

      {/* 3D Carousel */}
      <div className="container mx-auto px-4 pt-4">
        <ReviewCarousel 
          reviews={filteredReviews} 
          onReviewClick={(review) => {
            handleToggleComments(review.id);
            // Scroll to the review card
            const element = document.getElementById(`review-${review.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-0 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => <div key={review.id} id={`review-${review.id}`}><MovieCard review={review} showComments={showComments[review.id] || false} newComment={newComment[review.id] || ''} onLike={reviewId => handleLike(reviewId, setReviews)} onToggleComments={handleToggleComments} onShare={handleShare} onCommentChange={handleCommentChange} onCommentSubmit={handleCommentSubmit} onReplySubmit={handleReplySubmit} isLiked={likedReviews.has(review.id)} /></div>)}
        </div>
      </div>
    </div>;
};
export default Index;