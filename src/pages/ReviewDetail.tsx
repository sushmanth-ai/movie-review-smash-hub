import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useToast } from "@/hooks/use-toast";
import { TeluguVoiceReader } from "@/components/TeluguVoiceReader";
import { CommentSection } from "@/components/CommentSection";
import { ThreeDRatingMeter } from "@/components/ThreeDRatingMeter";
import { CurtainAnimation } from "@/components/CurtainAnimation";
import { movieReviewsData } from "@/data/movieReviews";

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [review, setReview] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showBookingOptions, setShowBookingOptions] = useState(false);

  // 🟡 Load Review & Likes
  useEffect(() => {
    if (!id) return;
    const likedKey = `liked_${id}`;
    if (localStorage.getItem(likedKey)) setLiked(true);

    const reviewDoc = doc(db, "reviews", id);
    const unsub = onSnapshot(reviewDoc, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setReview({ id: snap.id, ...d });
        setLikeCount(d.likes || 0);
      } else {
        const staticReview = movieReviewsData.find((r) => r.id === id);
        if (staticReview) setReview(staticReview);
      }
    });
    return () => unsub();
  }, [id]);

  // ❤️ Like Toggle
  const handleLikeToggle = async () => {
    if (!review) return;
    const likedKey = `liked_${id}`;
    const reviewRef = doc(db, "reviews", review.id);

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
  };

  // 📤 Share
  const handleShare = async () => {
    try {
      const shareData = {
        title: `SM Reviews: ${review.title}`,
        text: `${review.title} - Read the full review on SM Reviews!`,
        url: window.location.href,
      };
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(shareData.url);
      toast({ title: "Shared!", description: "Link copied or shared successfully." });
    } catch {
      toast({ title: "Share Failed", variant: "destructive" });
    }
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

  if (!review)
    return (
      <div className="min-h-screen flex items-center justify-center text-primary text-lg">
        Loading review...
      </div>
    );

  return (
    <>
      <CurtainAnimation />
      <div className="min-h-screen bg-background flex flex-col items-center">
        {/* 🔹 Header */}
        <div className="fixed top-0 left-0 w-full z-50 p-4 border-b-2 border-primary bg-background flex items-center gap-4">
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

        {/* 🔸 Review Card */}
        <Card className="bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-3xl w-full mt-24 mx-4 mb-8">
          {/* 🏷️ Curved Title Box */}
          <div className="relative flex justify-center mt-[-30px]">
            <div className="bg-gradient-to-r from-yellow-400 to-red-500 text-white font-extrabold text-2xl px-8 py-3 rounded-b-3xl shadow-[0_4px_20px_rgba(255,215,0,0.6)] border-t-4 border-yellow-300">
              {review.title}
            </div>
          </div>

          {/* 🎬 Image */}
          <div className="px-6 mt-6">
            <img
              src={review.image}
              alt={review.title}
              className="w-full max-h-[400px] object-cover rounded-xl border-2 border-primary/40"
            />
          </div>

          {/* 📝 Content */}
          <CardContent className="space-y-5 p-6">
            <div className="text-slate-50 leading-relaxed text-lg font-semibold">{review.review}</div>

            <div className="border-t border-primary/30 pt-4 space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="text-primary font-bold text-lg">First Half:</h4>
                <p className="text-slate-50">{review.firstHalf}</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="text-primary font-bold text-lg">Second Half:</h4>
                <p className="text-slate-50">{review.secondHalf}</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="text-primary font-bold text-lg">Positives:</h4>
                <p className="text-slate-50">{review.positives}</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="text-primary font-bold text-lg">Negatives:</h4>
                <p className="text-slate-50">{review.negatives}</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="text-primary font-bold text-lg">Overall:</h4>
                <p className="text-slate-50">{review.overall}</p>
              </div>
            </div>

            {/* ❤️ Like / 💬 Comment / 📤 Share */}
            <div className="flex justify-center gap-10 mt-8 border-t pt-4 border-primary/20">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-2 font-bold hover:scale-110 transition-transform ${
                  liked ? "text-red-500" : "text-gray-400"
                }`}
              >
                <ThumbsUp className="w-6 h-6" />
                <span>{liked ? "Liked" : "Like"}</span>
                <span className="text-sm text-slate-300">({likeCount})</span>
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

            {/* 🎟️ Book Your Ticket */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleBookTicket}
                className="bg-gradient-to-r from-red-600 to-yellow-400 text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                🎟️ Book Your Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rating Meter */}
        <Card className="bg-slate-100 border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-sm mx-auto mb-10 p-8">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-2xl text-slate-900 font-extrabold">RATING METER</h3>
            <ThreeDRatingMeter rating={parseFloat(review.rating)} size={160} />
          </div>
        </Card>

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
      </div>

      {/* 🔥 Animations */}
      <style>{`
        @keyframes title-pop {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-title-pop {
          animation: title-pop 2s infinite;
        }
      `}</style>
    </>
  );
};

export default ReviewDetail;
