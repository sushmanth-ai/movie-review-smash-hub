import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { movieReviewsData } from "@/data/movieReviews";
import { CommentSection } from "@/components/CommentSection";
import { ThreeDRatingMeter } from "@/components/ThreeDRatingMeter";
import { TeluguVoiceReader } from "@/components/TeluguVoiceReader";
import { onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useToast } from "@/hooks/use-toast";
import { CurtainAnimation } from "@/components/CurtainAnimation";

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [review, setReview] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  // 🔹 Load review + view/like counts
  useEffect(() => {
    if (!id) return;

    const trackView = async () => {
      if (db) {
        try {
          const reviewDoc = doc(db, "reviews", id);
          await updateDoc(reviewDoc, { views: increment(1) });
        } catch {}
      }
    };

    const likedKey = `liked_${id}`;
    if (localStorage.getItem(likedKey)) setLiked(true);

    if (db) {
      const reviewDoc = doc(db, "reviews", id);
      const unsub = onSnapshot(reviewDoc, (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setReview({ id: snap.id, ...d });
          setViewCount(d.views || 0);
          setLikeCount(d.likes || 0);
        } else {
          const staticReview = movieReviewsData.find((r) => r.id === id);
          if (staticReview) setReview(staticReview);
        }
      });
      trackView();
      return () => unsub();
    }
  }, [id]);

  if (!review)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-xl">Loading review...</p>
      </div>
    );

  // ❤️ Toggle Like / Unlike
  const handleToggleLike = async () => {
    try {
      const likedKey = `liked_${id}`;
      const reviewRef = doc(db, "reviews", review.id);
      setAnimating(true);

      if (!liked) {
        await updateDoc(reviewRef, { likes: increment(1) });
        setLikeCount((c) => c + 1);
        setLiked(true);
        localStorage.setItem(likedKey, "true");
      } else {
        await updateDoc(reviewRef, { likes: increment(-1) });
        setLikeCount((c) => Math.max(0, c - 1));
        setLiked(false);
        localStorage.removeItem(likedKey);
      }

      setTimeout(() => setAnimating(false), 600);
    } catch {
      toast({ title: "Error", description: "Like toggle failed.", variant: "destructive" });
    }
  };

  // 📤 Share
  const handleShare = async () => {
    const shareData = {
      title: `SM Reviews: ${review.title}`,
      text: `${review.title} - Full review on SM Reviews`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(shareData.url);
      toast({ title: "Shared!", description: "Link ready to share." });
    } catch {}
  };

  // 🎟️ Booking
  const handleBookTicket = () => setShowBookingOptions(true);
  const openBookMyShow = () => {
    window.open("https://in.bookmyshow.com/hyderabad", "_blank");
    setShowBookingOptions(false);
  };
  const openDistrict = () => {
    window.open("https://www.district.in/", "_blank");
    setShowBookingOptions(false);
  };

  return (
    <>
      <CurtainAnimation />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="fixed top-0 left-0 w-full z-50 p-4 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
          <div className="container mx-auto flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-primary">SM REVIEW 3.0</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-24 pb-8">
          <Card className="bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-4xl mx-auto">
            {/* 🎬 Title */}
            <CardHeader className="text-center space-y-4 relative overflow-hidden">
              <h2
                className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text 
                bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 
                tracking-widest drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-title-glow"
              >
                {review.title}
              </h2>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent blur-2xl opacity-60 animate-shine" />
            </CardHeader>

            <div className="px-6">
              <img
                src={review.image}
                alt={review.title}
                className="w-full max-h-[500px] object-cover rounded-lg mb-6 border-2 border-primary/30 shadow-[0_0_40px_rgba(255,215,0,0.4)]"
              />
            </div>

            <CardContent className="space-y-6">
              {/* 🔹 Full Review Section */}
              <div className="border-t border-primary/30 pt-4">
                <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg p-4 mb-4 border-2 border-primary/50 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                  <h3 className="text-center font-bold text-primary text-xl">REVIEW</h3>
                </div>
                <p className="text-base text-slate-50 font-bold leading-relaxed">{review.review}</p>
              </div>

              <div className="space-y-4">
                {[
                  ["First Half", review.firstHalf],
                  ["Second Half", review.secondHalf],
                  ["Positives", review.positives],
                  ["Negatives", review.negatives],
                  ["Overall", review.overall],
                ].map(([t, v]) => (
                  <div key={t} className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="text-primary font-bold text-lg mb-2">{t}:</h4>
                    <p className="text-base text-slate-50 font-bold leading-relaxed">{v}</p>
                  </div>
                ))}
              </div>

              {/* ❤️ Like / 💬 Comment / 📤 Share */}
              <div className="flex justify-center gap-8 mt-8 relative">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-2 font-bold hover:scale-110 transition-transform relative ${
                    liked ? "text-red-400" : "text-red-500"
                  }`}
                >
                  <ThumbsUp className={`w-6 h-6 ${animating ? "animate-like-pop" : ""}`} />
                  <span>{liked ? "Liked" : "Like"}</span>
                  <span className="text-slate-200 text-sm">({likeCount})</span>
                </button>

                <button
                  onClick={() => setShowComments((p) => !p)}
                  className="flex items-center gap-2 text-yellow-400 font-bold hover:scale-110 transition-transform"
                >
                  <MessageCircle className="w-6 h-6" /> Comment
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-blue-400 font-bold hover:scale-110 transition-transform"
                >
                  <Share2 className="w-6 h-6" /> Share
                </button>
              </div>

              {/* 🎟️ Book Ticket */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleBookTicket}
                  className="bg-gradient-to-r from-red-600 to-yellow-400 text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
                >
                  🎟️ Book Your Ticket
                </Button>
              </div>

              {/* Booking Modal */}
              {showBookingOptions && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-slate-900 border-2 border-yellow-400 rounded-2xl p-6 shadow-2xl max-w-md text-center space-y-4">
                    <h3 className="text-2xl text-yellow-400 font-bold mb-2">Choose Your Platform</h3>
                    <div className="flex flex-col gap-4">
                      <Button
                        onClick={openBookMyShow}
                        className="bg-gradient-to-r from-red-600 to-yellow-400 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                      >
                        🎫 Book via BookMyShow
                      </Button>
                      <Button
                        onClick={openDistrict}
                        className="bg-gradient-to-r from-purple-600 to-pink-400 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                      >
                        🏛️ Book via District App
                      </Button>
                      <Button
                        onClick={() => setShowBookingOptions(false)}
                        variant="outline"
                        className="border-yellow-400 text-yellow-400 font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎤 Telugu Voice Reader + Comments */}
              <TeluguVoiceReader
                reviewText={`${review.title}. సమీక్ష: ${review.review}. మొదటి సగం: ${review.firstHalf}. రెండవ సగం: ${review.secondHalf}. సానుకూలాలు: ${review.positives}. ప్రతికూలాలు: ${review.negatives}. మొత్తం మీద: ${review.overall}. రేటింగ్: ${review.rating} స్టార్స్.`}
              />

              {showComments && (
                <CommentSection
                  review={review}
                  newComment={newComment}
                  onCommentChange={setNewComment}
                  onCommentSubmit={() => {}}
                  onReplySubmit={() => {}}
                />
              )}
            </CardContent>
          </Card>

          {/* Rating Meter */}
          <Card className="bg-slate-100 border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-sm mx-auto mt-6 p-8">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-2xl text-center text-slate-900 font-extrabold">RATING METER</h3>
              <ThreeDRatingMeter rating={parseFloat(review.rating)} size={160} />
            </div>
          </Card>
        </div>
      </div>

      {/* ✨ Animations */}
      <style>{`
        @keyframes like-pop {
          0% { transform: scale(1); filter: drop-shadow(0 0 0 red); }
          50% { transform: scale(1.4); filter: drop-shadow(0 0 10px red); }
          100% { transform: scale(1); }
        }
        .animate-like-pop { animation: like-pop 0.5s ease-in-out; }
        @keyframes title-glow {
          0%,100%{text-shadow:0 0 20px gold,0 0 40px orange;}
          50%{text-shadow:0 0 35px yellow,0 0 60px red;}
        }
        .animate-title-glow{animation:title-glow 3s infinite alternate;}
        @keyframes shine{
          0%{transform:translateX(-100%);opacity:.2;}
          50%{transform:translateX(50%);opacity:1;}
          100%{transform:translateX(100%);opacity:0;}
        }
        .animate-shine{animation:shine 4s infinite linear;}
      `}</style>
    </>
  );
};

export default ReviewDetail;
