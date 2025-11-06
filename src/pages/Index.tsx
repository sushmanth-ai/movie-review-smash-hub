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
import { CurtainAnimation } from '@/components/CurtainAnimation';
const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [newComment, setNewComment] = useState<{
    [key: string]: string;
  }>({});
  const [showComments, setShowComments] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAllNewReviews, setShowAllNewReviews] = useState(false);
  const [showAllOldReviews, setShowAllOldReviews] = useState(false);
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
    setupRealTimeViewListener,
    loadReviewViews
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
    const unsubscribe = onSnapshot(reviewsQuery, snapshot => {
      const firebaseReviews: MovieReview[] = [];
      snapshot.forEach(doc => {
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

      // Load likes, comments, and views for all reviews
      loadLikes(setReviews);
      loadComments(setReviews);
      loadReviewViews(setReviews);
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
  const handleLikeClick = (reviewId: string) => {
    handleLike(reviewId, setReviews);
  };
  const handleCommentSubmitWrapper = (reviewId: string, commentText: string) => {
    const commentState: {
      [key: string]: string;
    } = {};
    commentState[reviewId] = commentText;
    handleComment(reviewId, commentText, setReviews, () => {});
  };
  const filteredReviews = reviews.filter(review => review.title.toLowerCase().includes(searchTerm.toLowerCase()) || review.review.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Categorize reviews (first 5 as new, rest as old)
  const newReviews = filteredReviews.slice(0, 5);
  const oldReviews = filteredReviews.slice(5);
  return <>
      <CurtainAnimation />
      <div className="min-h-screen bg-background">
      {/* Fixed Header with Black and Gold Theme */}
      <div className="fixed top-0 left-0 w-full z-50 p-2 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
       <div className="flex justify-center items-center mb-2">
  <img src="https://res.cloudinary.com/dvdmk59a1/image/upload/v1762242791/SM_Image_m8js8c.jpg" alt="SM Reviews Logo" className="h-14 w-14 md:h-16 md:w-16 object-cover rounded-full border-2 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
  <span className="text-primary font-extrabold ml-3 mt-1 tracking-wide text-2xl">
    REVIEWS 3.0
  </span>
        </div>


        <div className="flex gap-2 mb-2">
          <Input type="text" placeholder="Search for movie Reviews..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-input text-foreground border-primary focus:ring-primary" />
        </div>
      </div>

      {/* Today Views Card - Outside Header */}
      <div className="container mx-auto px-4 pt-24">
        <TodayViews viewCount={realTimeViewCount} />
      </div>

      {/* 3D Carousel */}
      <div className="container mx-auto px-4 pt-4">
        <ReviewCarousel reviews={filteredReviews} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-0 pb-8">
        {/* New Reviews Section */}
        {newReviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              🎬 New Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showAllNewReviews ? newReviews : newReviews.slice(0, 3)).map(review => (
                <div key={review.id} id={`review-${review.id}`}>
                  <MovieCard review={review} />
                </div>
              ))}
            </div>
            {newReviews.length > 3 && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowAllNewReviews(!showAllNewReviews)}
                  className="bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300"
                >
                  {showAllNewReviews ? 'See Less' : 'See More New Reviews'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Old Reviews Section */}
        {oldReviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              📽️ Old Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showAllOldReviews ? oldReviews : oldReviews.slice(0, 3)).map(review => (
                <div key={review.id} id={`review-${review.id}`}>
                  <MovieCard review={review} />
                </div>
              ))}
            </div>
            {oldReviews.length > 3 && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowAllOldReviews(!showAllOldReviews)}
                  className="bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300"
                >
                  {showAllOldReviews ? 'See Less' : 'See More Old Reviews'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-16 mb-8">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            📞 Contact Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Email Support */}
            <a
              href="mailto:support@smreviews.com"
              className="bg-card border-2 border-primary p-6 rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300 flex flex-col items-center gap-4"
            >
              <div className="text-5xl">📧</div>
              <h3 className="text-xl font-bold text-primary">Email Support</h3>
              <p className="text-muted-foreground text-center">support@smreviews.com</p>
            </a>

            {/* WhatsApp Support */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border-2 border-primary p-6 rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300 flex flex-col items-center gap-4"
            >
              <div className="text-5xl">💬</div>
              <h3 className="text-xl font-bold text-primary">WhatsApp Chat</h3>
              <p className="text-muted-foreground text-center">Chat with us instantly</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  </>;
};
export default Index;