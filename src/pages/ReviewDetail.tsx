import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Play, X, Star, Film, Sparkles, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { MovieReview } from "@/data/movieReviews";
import { movieReviewsData } from "@/data/movieReviews";
import { CommentSection } from "@/components/CommentSection";
import { ThreeDRatingMeter } from "@/components/ThreeDRatingMeter";
import { TeluguVoiceReader } from "@/components/TeluguVoiceReader";
import { useFirebaseOperations } from "@/hooks/useFirebaseOperations";
import { onSnapshot, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useToast } from "@/hooks/use-toast";
import { CurtainAnimation } from "@/components/CurtainAnimation";
import { useSound } from "@/hooks/useSound";
import { UserStarRating } from "@/components/UserStarRating";
import { AdminRatingsDisplay } from "@/components/AdminRatingsDisplay";
import { RatingComparison } from "@/components/RatingComparison";
import { NotificationBell } from "@/components/NotificationBell";
import { ReviewPolls } from "@/components/ReviewPolls";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

const ReviewDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    playSound
  } = useSound();
  const { t } = useLanguage();
  const [review, setReview] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [showLikeEffect, setShowLikeEffect] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleReply,
    likedReviews
  } = useFirebaseOperations();
  const setReviewFromList = updater => {
    setReview(prev => {
      const currentList = prev ? [prev] : [];
      const nextList = typeof updater === "function" ? updater(currentList) : updater;
      return nextList?.[0] ?? prev;
    });
  };
  const noopSetNewComment = () => {};
  useEffect(() => {
    if (!id) return;
    const trackView = async () => {
      if (db) {
        try {
          const reviewDoc = doc(db, "reviews", id);
          await updateDoc(reviewDoc, {
            views: increment(1)
          });
        } catch (error) {
          console.log("View tracking error:", error);
        }
      }
    };
    if (db) {
      const reviewDoc = doc(db, "reviews", id);
      const unsubscribe = onSnapshot(reviewDoc, docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setViewCount(data.views || 0);
          const firebaseReview = {
            id: docSnap.id,
            title: data.title,
            image: data.image,
            review: data.review,
            firstHalf: data.firstHalf,
            secondHalf: data.secondHalf,
            positives: data.positives,
            negatives: data.negatives,
            overall: data.overall,
            rating: data.rating,
            trailerUrl: data.trailerUrl || '',
            likes: 0,
            comments: [],
            views: data.views || 0
          };
          setReview(firebaseReview);
          loadLikes(setReviewFromList);
          loadComments(setReviewFromList, (author, text) => {
            playSound('popup');
            toast({
              title: `🔔 ${author} replied!`,
              description: text.length > 50 ? text.substring(0, 50) + '...' : text
            });
          });
        } else {
          const staticReview = movieReviewsData.find(r => r.id === id);
          if (staticReview) {
            const reviewWithDefaults = {
              ...staticReview,
              likes: 0,
              comments: []
            };
            setReview(reviewWithDefaults);
            setViewCount(staticReview.views || 0);
            loadLikes(setReviewFromList);
            loadComments(setReviewFromList, (author, text) => {
              playSound('popup');
              toast({
                title: `🔔 ${author} replied!`,
                description: text.length > 50 ? text.substring(0, 50) + '...' : text
              });
            });
          }
        }
      });
      trackView();
      return () => unsubscribe();
    } else {
      const staticReview = movieReviewsData.find(r => r.id === id);
      if (staticReview) {
        setReview({
          ...staticReview,
          likes: 0,
          comments: []
        });
        setViewCount(staticReview.views || 0);
      }
    }
  }, [id]);
  if (!review) {
    return <CurtainAnimation alwaysPlay />;
  }
  const handleLikeClick = reviewId => {
    playSound("bubble");
    handleLike(reviewId, setReviewFromList);
    setShowLikeEffect(true);
    setTimeout(() => setShowLikeEffect(false), 800);
  };
  const handleCommentSubmit = () => {
    if (!review || !newComment.trim()) return;
    handleComment(review.id, newComment, setReviewFromList, noopSetNewComment);
    setNewComment("");
  };
  const handleReplySubmit = (commentId: string, replyText: string) => {
    if (!review) return;
    handleReply(review.id, commentId, replyText, setReviewFromList);
  };
  const handleShareClick = async () => {
    try {
      const shareData = {
        title: `SM Reviews: ${review.title}`,
        text: `${review.title} - Read the full review now on SM Reviews!`,
        url: window.location.href
      };
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: t('sharedSuccess'),
          description: t('sharedSuccessDesc')
        });
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: t('linkCopied'),
          description: t('linkCopiedDesc')
        });
      }
    } catch (error) {
      toast({
        title: t('shareFailed'),
        description: t('shareFailedDesc'),
        variant: "destructive"
      });
    }
  };
  const handleBookTicket = () => {
    playSound("click");
    setShowBookingOptions(true);
  };
  const handleOpenBookMyShow = () => {
    window.open("https://in.bookmyshow.com/hyderabad", "_blank");
    setShowBookingOptions(false);
  };
  const handleOpenDistrictApp = () => {
    window.open("https://www.district.in/", "_blank"); // ✅ updated link
    setShowBookingOptions(false);
  };
  return <>
      <CurtainAnimation alwaysPlay />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="fixed top-0 left-0 w-full z-50 p-4 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
          <div className="container mx-auto flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-primary flex-1">SM REVIEW 3.0</h1>
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-2 sm:px-4 pt-24 pb-8">
          {/* 🎬 Main Review Card */}
          <Card className="relative bg-card border-2 border-primary shadow-[0_0_40px_rgba(255,215,0,0.4)] max-w-4xl mx-auto overflow-visible animate-fade-in mt-6">
            {/* Premium Title Badge */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10 w-[calc(100%-2rem)] sm:w-auto">
              <div className="relative bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-black font-extrabold text-sm sm:text-base md:text-lg rounded-2xl border-2 border-primary shadow-[0_4px_20px_rgba(255,215,0,0.6)] px-4 sm:px-8 py-2.5 text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] rounded-2xl" />
                <div className="flex items-center gap-2 justify-center relative z-10">
                  <Film className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="line-clamp-2">{review.title}</span>
                  <Film className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </div>
              </div>
            </div>

            <CardHeader className="pt-8" />

            <div className="px-4 sm:px-6">
              <div className="relative group">
                <img 
                  src={review.image} 
                  alt={review.title} 
                  className={`w-full max-h-[500px] object-cover rounded-xl mb-6 border-2 border-primary/30 transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${showTrailer ? 'hidden' : 'block'}`} 
                />
                
                {review.trailerUrl && !showTrailer && (
                  <button 
                    onClick={() => {
                      playSound('click');
                      setShowTrailer(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 rounded-xl mb-6"
                  >
                    <div className="bg-destructive hover:bg-destructive/90 rounded-full p-3 sm:p-5 shadow-[0_0_40px_rgba(255,0,0,0.5)] transform hover:scale-110 transition-all duration-300 animate-pulse">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                    </div>
                    <span className="absolute bottom-4 sm:bottom-8 text-white font-bold text-sm sm:text-lg drop-shadow-lg bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
                      {t('watchTrailer')}
                    </span>
                  </button>
                )}

                {showTrailer && review.trailerUrl && (
                  <div className="relative mb-6">
                    <button 
                      onClick={() => setShowTrailer(false)}
                      className="absolute -top-2 -right-2 z-10 bg-destructive hover:bg-destructive/80 rounded-full p-2 shadow-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="relative pt-[56.25%] rounded-xl overflow-hidden border-2 border-primary/30 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(review.trailerUrl)}?autoplay=1&rel=0`}
                        title={`${review.title} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <button 
                      onClick={() => setShowTrailer(false)}
                      className="mt-3 mx-auto flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      {t('backToPoster')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="space-y-6 px-4 sm:px-6">
              {/* Glowing Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(255,215,0,0.5)]" />

              {/* Review Section */}
              <div>
                <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-xl p-4 mb-5 border border-primary/40 shadow-[0_0_25px_rgba(255,215,0,0.2)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />
                  <h3 className="text-center font-bold text-primary text-xl flex items-center justify-center gap-2 relative z-10">
                    <Sparkles className="w-5 h-5" />
                    {t('review')}
                    <Sparkles className="w-5 h-5" />
                  </h3>
                </div>
              <div className="rounded-xl p-[2px] bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400">
                  <div className="bg-card rounded-[10px] p-4">
                    <p className="text-base text-white font-medium leading-relaxed tracking-wide">
                      {review.review}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Cards */}
              <div className="space-y-4">
                {/* First Half */}
                <div className="rounded-xl p-[2px] bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300">
                  <div className="bg-card rounded-[10px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-sky-500/20 p-1.5 rounded-lg">
                        <Film className="w-4 h-4 text-sky-300" />
                      </div>
                      <h4 className="text-sky-300 font-bold text-lg">{t('firstHalf')}</h4>
                    </div>
                    <p className="text-base text-white font-medium leading-relaxed pl-9">
                      {review.firstHalf}
                    </p>
                  </div>
                </div>

                {/* Second Half */}
                <div className="rounded-xl p-[2px] bg-gradient-to-r from-fuchsia-400 via-pink-300 to-violet-400 hover:shadow-[0_0_15px_rgba(232,121,249,0.3)] transition-all duration-300">
                  <div className="bg-card rounded-[10px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-fuchsia-500/20 p-1.5 rounded-lg">
                        <Film className="w-4 h-4 text-fuchsia-300" />
                      </div>
                      <h4 className="text-fuchsia-300 font-bold text-lg">{t('secondHalf')}</h4>
                    </div>
                    <p className="text-base text-white font-medium leading-relaxed pl-9">
                      {review.secondHalf}
                    </p>
                  </div>
                </div>

                {/* Positives */}
                <div className="rounded-xl p-[2px] bg-gradient-to-r from-lime-400 via-emerald-300 to-teal-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-300">
                  <div className="bg-card rounded-[10px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                      </div>
                      <h4 className="text-emerald-300 font-bold text-lg">{t('positives')}</h4>
                    </div>
                    <p className="text-base text-white font-medium leading-relaxed pl-9">
                      {review.positives}
                    </p>
                  </div>
                </div>

                {/* Negatives */}
                <div className="rounded-xl p-[2px] bg-gradient-to-r from-rose-500 via-red-400 to-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-300">
                  <div className="bg-card rounded-[10px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-rose-500/20 p-1.5 rounded-lg">
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      </div>
                      <h4 className="text-rose-400 font-bold text-lg">{t('negatives')}</h4>
                    </div>
                    <p className="text-base text-white font-medium leading-relaxed pl-9">
                      {review.negatives}
                    </p>
                  </div>
                </div>

                {/* Overall */}
                <div className="rounded-xl p-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-primary hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300">
                  <div className="bg-card rounded-[10px] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-primary/20 p-1.5 rounded-lg">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                      </div>
                      <h4 className="text-primary font-bold text-lg">{t('overall')}</h4>
                    </div>
                    <p className="text-base text-white font-bold leading-relaxed pl-9">
                      {review.overall}
                    </p>
                  </div>
                </div>
              </div>

              {/* Glowing Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(255,215,0,0.5)]" />

              {/* ❤️ Like / 💬 Comment / 📤 Share - Glassmorphism */}
              <div className="flex justify-center gap-3 sm:gap-5 mt-6 relative">
                <button onClick={() => {
                  playSound("click");
                  handleLikeClick(review.id);
                }} className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 active:scale-95 relative ${
                  likedReviews.has(review.id) 
                    ? "bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                    : "bg-muted/30 border-muted-foreground/20 text-muted-foreground hover:border-red-500/30 hover:text-red-400"
                }`}>
                  <ThumbsUp className={`w-5 h-5 ${showLikeEffect ? "animate-like-pop" : ""} ${likedReviews.has(review.id) ? "fill-current" : ""}`} />
                  <span className="text-sm">{review.likes} {likedReviews.has(review.id) ? t('liked') : t('like')}</span>
                  {showLikeEffect && <span className="absolute -top-6 text-red-400 font-bold animate-bubble">
                    {likedReviews.has(review.id) ? "+1 ❤️" : "-1"}
                  </span>}
                </button>

                <button onClick={() => {
                  playSound("click");
                  setShowComments(prev => !prev);
                }} className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{t('comment')}</span>
                </button>

                <button onClick={() => {
                  playSound("click");
                  handleShareClick();
                }} className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">{t('share')}</span>
                </button>
              </div>

              {/* 🎟️ Book Your Ticket - Enhanced */}
              <div className="flex justify-center mt-6">
                <Button onClick={handleBookTicket} className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white font-bold px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_25px_rgba(239,68,68,0.4)] text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                  <span className="relative z-10">{t('bookTicket')}</span>
                </Button>
              </div>

              {/* Polls */}
              <ReviewPolls movieId={review.id} />

              {/* Telugu Voice + Comments */}
              <TeluguVoiceReader reviewText={`${review.title}. సమీక్ష: ${review.review}. మొదటి సగం: ${review.firstHalf}. రెండవ సగం: ${review.secondHalf}. సానుకూలాలు: ${review.positives}. ప్రతికూలాలు: ${review.negatives}. మొత్తం మీద: ${review.overall}. రేటింగ్: ${review.rating} స్టార్స్.`} />

              {showComments && <CommentSection review={review} newComment={newComment} onCommentChange={setNewComment} onCommentSubmit={handleCommentSubmit} onReplySubmit={handleReplySubmit} />}
            </CardContent>
          </Card>

          {/* Rating Section */}
          <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin Ratings */}
            <AdminRatingsDisplay adminRatings={review.adminRatings} legacyRating={review.rating} />
            
            {/* User Rating */}
            <UserStarRating movieId={review.id} />
          </div>

          {/* Rating Comparison */}
          <div className="max-w-md mx-auto mt-4">
            <RatingComparison 
              criticRating={parseFloat(review.rating?.match(/[\d.]+/)?.[0] || '0')} 
              movieId={review.id} 
            />
          </div>

          {/* Rating Meter */}
          
        </div>
      </div>

      {/* ✅ Book Ticket Modal */}
      {showBookingOptions && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border-2 border-primary rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.6)] p-8 text-center space-y-6 max-w-sm w-full mx-4">
            <h3 className="text-2xl font-bold text-primary">
              {t('bookTickets')}
            </h3>
            <p className="text-slate-200">{t('choosePlatform')}</p>
            <div className="flex flex-col gap-4">
              <Button onClick={handleOpenBookMyShow} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg">
                🎬 BookMyShow
              </Button>
              <Button onClick={handleOpenDistrictApp} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg shadow-lg">
                🏠 District Cinemas
              </Button>
              <Button onClick={() => setShowBookingOptions(false)} variant="outline" className="border-primary text-primary font-bold py-3 rounded-lg">
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>}

      <style>{`
        @keyframes like-pop {
          0% { transform: scale(1); filter: drop-shadow(0 0 0 red); }
          50% { transform: scale(1.4); filter: drop-shadow(0 0 10px red); }
          100% { transform: scale(1); }
        }
        .animate-like-pop { animation: like-pop 0.5s ease-in-out; }
        @keyframes bubble {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        .animate-bubble { animation: bubble 0.8s ease-in-out; }
      `}</style>
    </>;
};
export default ReviewDetail;