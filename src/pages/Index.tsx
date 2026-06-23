import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const hash = location.hash;
    let newTab = 'home';
    if (hash === '#search') newTab = 'search';
    else if (hash === '#reviews') newTab = 'reviews';
    
    // Trigger logo animation if switching tabs
    if (newTab !== activeTab) {
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 900); // Fast 0.9s transition
    }
    setActiveTab(newTab);
  }, [location.hash]);

  const getMobileDisplayClass = (tabName: string) => {
    return activeTab === tabName ? 'block' : 'hidden md:block';
  };

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
          comments: [],
          views: data.views || 0
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

      // Load likes, comments, and views after state update
      setTimeout(() => {
        loadLikes(setReviews);
        loadComments(setReviews, (author, text) => {
          playSound('popup');
          toast({
            title: `🔔 ${author} replied!`,
            description: text.length > 50 ? text.substring(0, 50) + '...' : text,
          });
        });
        loadReviewViews(setReviews);
      }, 100);
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
        <div className="relative py-4 px-4">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          {/* Main Header Row */}
          <div className="relative flex items-center justify-between">
            {/* Logo + Brand */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Logo */}
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-primary to-yellow-400 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <img 
                  src="https://res.cloudinary.com/dvdmk59a1/image/upload/v1762242791/SM_Image_m8js8c.jpg" 
                  alt="SM Reviews Logo" 
                  className="relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-cover rounded-full border-3 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.8)]" 
                />
              </div>
              
              {/* Brand Name */}
              <div className="flex flex-col items-start min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 via-primary to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] tracking-tight">
                    SM
                  </span>
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold text-primary tracking-wide truncate">
                    Reviews
                  </span>
                </div>
                <div className="flex items-center gap-2 -mt-1">
                  <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-primary to-transparent rounded-full" />
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent tracking-[0.3em] uppercase">
                    3.0
                  </span>
                  <div className="flex gap-0.5">
                    <span className="text-yellow-400 text-[10px] sm:text-xs">★</span>
                    <span className="text-yellow-400 text-[10px] sm:text-xs">★</span>
                    <span className="text-yellow-400 text-[10px] sm:text-xs">★</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
              <LanguageSwitcher />
              <NotificationBell />
            </div>
          </div>
          
          {/* Bottom Decorative Line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      </div>

      <div className="pt-20 md:pt-28" />

      {/* SM Logo Animation Overlay for all transitions */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
          <div className="relative group flex-shrink-0 animate-in fade-in zoom-in duration-300">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-primary to-yellow-400 rounded-full blur-xl opacity-80 animate-pulse" />
            <img 
              src="https://res.cloudinary.com/dvdmk59a1/image/upload/v1762242791/SM_Image_m8js8c.jpg" 
              alt="SM Reviews Logo" 
              className="relative h-32 w-32 md:h-48 md:w-48 object-cover rounded-full border-4 border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,1)] animate-bounce" 
            />
          </div>
          <h2 className="mt-8 text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-primary to-yellow-300 animate-pulse uppercase">
            {activeTab === 'home' ? 'Loading' : activeTab}
          </h2>
        </div>
      )}

      {/* Mobile Search Tab */}
      <div className={`container mx-auto px-4 pt-4 md:hidden ${activeTab === 'search' ? 'block' : 'hidden'}`}>
        <div className="max-w-2xl mx-auto mb-8">
          <Input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full bg-input/80 backdrop-blur-sm text-foreground border-2 border-primary/50 focus:border-primary focus:ring-primary rounded-full px-5 py-2 shadow-[0_0_15px_rgba(255,215,0,0.2)] text-lg" 
          />
        </div>
        {searchTerm && (
          <div className="grid grid-cols-1 gap-6 pb-20">
            {filteredReviews.map(review => (
              <div key={`search-${review.id}`}>
                <MovieCard review={review} />
              </div>
            ))}
          </div>
        )}
        {!searchTerm && (
          <div className="text-center flex flex-col items-center justify-center mt-12 py-16 bg-card/30 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(255,215,0,0.05)]">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-muted-foreground text-lg">{t('searchPlaceholder')}...</p>
          </div>
        )}
      </div>

      {/* Desktop Search Bar (Hidden on Mobile) */}
      <div className="hidden md:block container mx-auto px-4 pt-4">
        <div className="max-w-2xl mx-auto mb-8">
          <Input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full bg-input/80 backdrop-blur-sm text-foreground border-2 border-primary/50 focus:border-primary focus:ring-primary rounded-full px-5 py-2 shadow-[0_0_15px_rgba(255,215,0,0.2)]" 
          />
        </div>
      </div>

      {/* Home Sections */}
      <div className={getMobileDisplayClass('home')}>
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
      </div>

      {/* Main Content (Reviews) */}
      <div className={`container mx-auto px-4 pt-0 pb-8 ${getMobileDisplayClass('reviews')}`}>
        {/* New Reviews Section */}
        {newReviews.length > 0 && (
          <div id="reviews" className="mb-12">
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
              {t('oldReviews')}
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
                  {showAllOldReviews ? t('seeLess') : t('seeMoreOld')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-16 mb-8">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            {t('contactUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Email Support */}
            <a
              href="mailto:support@smreviews.com"
              className="bg-card border-2 border-primary p-6 rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300 flex flex-col items-center gap-4"
            >
              <div className="text-5xl">📧</div>
              <h3 className="text-xl font-bold text-primary">{t('emailSupport')}</h3>
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
              <h3 className="text-xl font-bold text-primary">{t('whatsappChat')}</h3>
              <p className="text-muted-foreground text-center">{t('chatWithUs')}</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  </>;
};
export default Index;