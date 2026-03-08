import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Play, X } from "lucide-react";
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
          title: "Shared Successfully!",
          description: "Your friends can see this review now!"
        });
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied!",
          description: "You can paste and share it anywhere."
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Something went wrong. Try again!",
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
        <div className="container mx-auto px-4 pt-24 pb-8">
          {/* 🎬 Main Review Card */}
          <Card className="relative bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-4xl mx-auto">
            <div className="absolute left-1/2 -translate-x-1/2 -top-[1.4rem] bg-yellow-400 text-black font-extrabold text-sm sm:text-base md:text-lg rounded-b-2xl border-x-2 border-b-2 border-primary shadow-[0_4px_10px_rgba(255,215,0,0.4)] mx-[3px] px-3 sm:px-6 md:px-[24px] py-[7px] my-[25px] max-w-[90%] sm:max-w-none text-center">
              {review.title}
            </div>

            <CardHeader className="text-center pt-10"></CardHeader>

            <div className="px-6">
              <div className="relative group">
                <img 
                  src={review.image} 
                  alt={review.title} 
                  className={`w-full max-h-[500px] object-cover rounded-lg mb-6 border-2 border-primary/30 transition-all duration-300 ${showTrailer ? 'hidden' : 'block'}`} 
                />
                
                {/* Play Trailer Button Overlay - Always visible on mobile */}
                {review.trailerUrl && !showTrailer && (
                  <button 
                    onClick={() => {
                      playSound('click');
                      setShowTrailer(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 rounded-lg mb-6"
                  >
                    <div className="bg-red-600 hover:bg-red-700 rounded-full p-3 sm:p-4 shadow-[0_0_30px_rgba(255,0,0,0.6)] transform hover:scale-110 transition-transform animate-pulse">
                      <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white fill-white" />
                    </div>
                    <span className="absolute bottom-4 sm:bottom-8 text-white font-bold text-sm sm:text-lg drop-shadow-lg bg-black/50 px-3 py-1 rounded-full">
                      ▶️ Watch Trailer
                    </span>
                  </button>
                )}

                {/* Embedded YouTube Player */}
                {showTrailer && review.trailerUrl && (
                  <div className="relative mb-6">
                    <button 
                      onClick={() => setShowTrailer(false)}
                      className="absolute -top-2 -right-2 z-10 bg-red-600 hover:bg-red-700 rounded-full p-2 shadow-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="relative pt-[56.25%] rounded-lg overflow-hidden border-2 border-primary/30">
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
                      🖼️ Back to Poster
                    </button>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="space-y-6">
              <div className="border-t border-primary/30 pt-4">
                <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg p-4 mb-4 border-2 border-primary/50 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                  <h3 className="text-center font-bold text-primary text-xl">
                    {t('review')}
                  </h3>
                </div>
                <p className="text-base text-slate-50 font-bold leading-relaxed">
                  {review.review}
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="text-primary font-bold text-lg mb-2">
                    {t('firstHalf')}
                  </h4>
                  <p className="text-base text-slate-50 font-bold leading-relaxed">
                    {review.firstHalf}
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="text-primary font-bold text-lg mb-2">
                    {t('secondHalf')}
                  </h4>
                  <p className="text-base text-slate-50 font-bold leading-relaxed">
                    {review.secondHalf}
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="text-primary font-bold text-lg mb-2">
                    {t('positives')}
                  </h4>
                  <p className="text-base text-slate-50 font-bold leading-relaxed">
                    {review.positives}
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="text-primary font-bold text-lg mb-2">
                    {t('negatives')}
                  </h4>
                  <p className="text-base text-slate-50 font-bold leading-relaxed">
                    {review.negatives}
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="text-primary font-bold text-lg mb-2">
                    Overall:
                  </h4>
                  <p className="text-base text-slate-50 font-bold leading-relaxed">
                    {review.overall}
                  </p>
                </div>
              </div>

              {/* ❤️ Like / 💬 Comment / 📤 Share */}
              <div className="flex justify-center gap-6 mt-6 relative">
                <button onClick={() => {
                playSound("click");
                handleLikeClick(review.id);
              }} className={`flex items-center gap-2 font-bold hover:scale-110 transition-transform relative ${likedReviews.has(review.id) ? "text-red-500" : "text-gray-400"}`}>
                  <ThumbsUp className={`w-6 h-6 ${showLikeEffect ? "animate-like-pop" : ""} ${likedReviews.has(review.id) ? "fill-current" : ""}`} />{" "}
                  {review.likes}{" "}
                  {likedReviews.has(review.id) ? "Liked" : "Like"}
                  {showLikeEffect && <span className="absolute -top-6 text-red-400 font-bold animate-bubble">
                      {likedReviews.has(review.id) ? "+1 ❤️" : "-1"}
                    </span>}
                </button>

                <button onClick={() => {
                playSound("click");
                setShowComments(prev => !prev);
              }} className="flex items-center gap-2 text-yellow-400 font-bold hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" /> Comment
                </button>

                <button onClick={() => {
                playSound("click");
                handleShareClick();
              }} className="flex items-center gap-2 text-blue-400 font-bold hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6" /> Share
                </button>
              </div>

              {/* 🎟️ Book Your Ticket */}
              <div className="flex justify-center mt-6">
                <Button onClick={handleBookTicket} className="bg-gradient-to-r from-red-600 to-yellow-400 text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg">
                  🎟️ Book Your Ticket
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
              🎟️ Book Your Tickets
            </h3>
            <p className="text-slate-200">Choose your preferred platform:</p>
            <div className="flex flex-col gap-4">
              <Button onClick={handleOpenBookMyShow} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg">
                🎬 BookMyShow
              </Button>
              <Button onClick={handleOpenDistrictApp} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg shadow-lg">
                🏠 District Cinemas
              </Button>
              <Button onClick={() => setShowBookingOptions(false)} variant="outline" className="border-primary text-primary font-bold py-3 rounded-lg">
                ✖️ Cancel
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