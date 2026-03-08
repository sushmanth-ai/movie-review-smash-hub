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
import { TrendingReviews } from '@/components/TrendingReviews';
import { useTrendingReviews } from '@/hooks/useTrendingReviews';
import { useSound } from '@/hooks/useSound';
import { NotificationBell } from '@/components/NotificationBell';
import { useAutoSubscribe } from '@/hooks/useAutoSubscribe';
import { useToast } from '@/hooks/use-toast';
import { StoryCircles } from '@/components/StoryCircles';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/i18n/LanguageContext';

const Index = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const { t } = useLanguage();
  useAutoSubscribe();
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
  const { trendingReviews, isLoading: trendingLoading } = useTrendingReviews();

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
      loadComments(setReviews, (author, text) => {
        playSound('popup');
        toast({
          title: `🔔 ${author} replied!`,
          description: text.length > 50 ? text.substring(0, 50) + '...' : text,
        });
      });
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
      <div className="fixed top-0 left-0 w-full z-50 shadow-[0_4px_30px_rgba(255,215,0,0.4)] border-b-2 border-primary bg-gradient-to-b from-background via-background to-background/95">
        {/* Beautiful Heading Container */}
        <div className="relative py-4 px-4 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          {/* Main Logo and Title Container */}
           <div className="relative flex justify-center items-center gap-4">
            {/* Notification Bell - Top Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
              <LanguageSwitcher />
              <NotificationBell />
            </div>
            {/* Golden Film Reel Decoration - Left */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-2xl animate-pulse">🎬</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-primary rounded-full" />
            </div>
            
            {/* Logo with Premium Glow */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-primary to-yellow-400 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              <img 
                src="https://res.cloudinary.com/dvdmk59a1/image/upload/v1762242791/SM_Image_m8js8c.jpg" 
                alt="SM Reviews Logo" 
                className="relative h-16 w-16 md:h-20 md:w-20 object-cover rounded-full border-3 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.8)]" 
              />
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 via-primary to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] tracking-tight">
                  SM
                </span>
                <span className="text-2xl md:text-3xl font-bold text-primary tracking-wide">
                  Reviews
                </span>
              </div>
              <div className="flex items-center gap-2 -mt-1">
                <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-transparent rounded-full" />
                <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent tracking-[0.3em] uppercase">
                  3.0
                </span>
                <div className="flex gap-0.5">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-yellow-400 text-xs">★</span>
                </div>
              </div>
            </div>
            
            {/* Golden Film Reel Decoration - Right */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent via-primary to-primary rounded-full" />
              <span className="text-2xl animate-pulse">🎬</span>
            </div>
          </div>
          
          {/* Bottom Decorative Line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="max-w-2xl mx-auto">
            <Input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full bg-input/80 backdrop-blur-sm text-foreground border-2 border-primary/50 focus:border-primary focus:ring-primary rounded-full px-5 py-2 shadow-[0_0_15px_rgba(255,215,0,0.2)]" 
            />
          </div>
        </div>
      </div>

      {/* Today Views Card - Outside Header */}
      <div className="container mx-auto px-4 pt-36 md:pt-40">
        <TodayViews viewCount={realTimeViewCount} />
      </div>

      {/* Story Circles */}
      <div className="container mx-auto px-4 pt-4">
        <StoryCircles reviews={filteredReviews} />
      </div>

      {/* 3D Carousel */}
      <div className="container mx-auto px-4 pt-4">
        <ReviewCarousel reviews={filteredReviews} />
      </div>

      {/* Trending This Week Section */}
      <div className="container mx-auto px-4 pt-6">
        <TrendingReviews reviews={trendingReviews} isLoading={trendingLoading} limit={2} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-0 pb-8">
        {/* New Reviews Section */}
        {newReviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              {t('newReviews')}
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
                  onClick={() => {
                    playSound('click');
                    setShowAllNewReviews(!showAllNewReviews);
                  }}
                  className="bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300"
                >
                  {showAllNewReviews ? t('seeLess') : t('seeMoreNew')}
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
                  onClick={() => {
                    playSound('click');
                    setShowAllOldReviews(!showAllOldReviews);
                  }}
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