import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Volume2, Eye } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';
import { movieReviewsData } from '@/data/movieReviews';
import { InteractionButtons } from '@/components/InteractionButtons';
import { CommentSection } from '@/components/CommentSection';
import { ThreeDRatingMeter } from '@/components/ThreeDRatingMeter';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useToast } from '@/hooks/use-toast';

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [review, setReview] = useState<MovieReview | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [isReading, setIsReading] = useState(false);

  // 🎬 New States for Rating Spin Feature
  const [isSpinning, setIsSpinning] = useState(false);
  const [showRatingValue, setShowRatingValue] = useState(false);

  const {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleReply,
    handleShare,
    likedReviews
  } = useFirebaseOperations();

  const setReviewFromList: React.Dispatch<React.SetStateAction<MovieReview[]>> = updater => {
    setReview(prev => {
      const currentList = prev ? [prev] : [];
      const nextList = typeof updater === 'function' ? (updater as any)(currentList) : updater;
      return nextList?.[0] ?? prev;
    });
  };

  const noopSetNewComment: React.Dispatch<React.SetStateAction<{ [key: string]: string }>> = () => {};

  // 🔥 Load review and track views
  useEffect(() => {
    if (!id) return;
    const trackView = async () => {
      if (db) {
        try {
          const reviewDoc = doc(db, 'reviews', id);
          await updateDoc(reviewDoc, { views: increment(1) });
        } catch (error) {
          console.log('View tracking error:', error);
        }
      }
    };

    if (db) {
      const reviewDoc = doc(db, 'reviews', id);
      const unsubscribe = onSnapshot(reviewDoc, docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setViewCount(data.views || 0);
          const firebaseReview: MovieReview = {
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
            likes: 0,
            comments: [],
            views: data.views || 0
          };
          setReview(firebaseReview);
          loadLikes(setReviewFromList);
          loadComments(setReviewFromList);
        } else {
          const staticReview = movieReviewsData.find(r => r.id === id);
          if (staticReview) {
            const reviewWithDefaults = { ...staticReview, likes: 0, comments: [] };
            setReview(reviewWithDefaults);
            setViewCount(staticReview.views || 0);
            loadLikes(setReviewFromList);
            loadComments(setReviewFromList);
          }
        }
      });

      trackView();
      return () => unsubscribe();
    } else {
      const staticReview = movieReviewsData.find(r => r.id === id);
      if (staticReview) {
        setReview({ ...staticReview, likes: 0, comments: [] });
        setViewCount(staticReview.views || 0);
      }
    }
  }, [id]);

  if (!review) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-xl">Loading review...</p>
      </div>
    );
  }

  const handleLikeClick = (reviewId: string) => {
    handleLike(reviewId, setReviewFromList);
  };

  const handleCommentSubmit = () => {
    if (!review || !newComment.trim()) return;
    handleComment(review.id, newComment, setReviewFromList, noopSetNewComment);
    setNewComment('');
  };

  const handleReplySubmit = (commentId: string, replyText: string) => {
    if (!review || !replyText.trim()) return;
    handleReply(review.id, commentId, replyText, setReviewFromList);
  };

  // 🎧 Text-to-speech (existing feature)
  const handleReadReview = async () => {
    if (!review) return;
    if (isReading) {
      const audioElement = document.getElementById('review-audio') as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setIsReading(false);
      return;
    }
    setIsReading(true);
    try {
      const fullReview = `
        ${review.title}.
        సమీక్ష: ${review.review}.
        మొదటి సగం: ${review.firstHalf}.
        రెండవ సగం: ${review.secondHalf}.
        సానుకూలాలు: ${review.positives}.
        ప్రతికూలాలు: ${review.negatives}.
        మొత్తం మీద: ${review.overall}.
        రేటింగ్: ${review.rating} స్టార్స్.
      `;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullReview })
      });
      if (!response.ok) throw new Error('Failed to generate speech');
      const data = await response.json();
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      let audioElement = document.getElementById('review-audio') as HTMLAudioElement;
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.id = 'review-audio';
      }
      audioElement.src = audioUrl;
      audioElement.onended = () => {
        setIsReading(false);
        URL.revokeObjectURL(audioUrl);
      };
      await audioElement.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsReading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to read the review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // 🌟 Handle Rating Spin
  const handleShowRating = () => {
    setIsSpinning(true);
    setShowRatingValue(false);
    setTimeout(() => {
      setIsSpinning(false);
      setShowRatingValue(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-primary">SM REVIEW 3.0</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Card className="bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-4xl mx-auto">
          <CardHeader className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-primary tracking-wide">{review.title}</h2>
          </CardHeader>

          <div className="px-6">
            <img src={review.image} alt={review.title} className="w-full max-h-[500px] object-cover rounded-lg mb-6 border-2 border-primary/30" />
          </div>

          <CardContent className="space-y-6">
            <div className="border-t border-primary/30 pt-4">
              <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg p-4 mb-4 border-2 border-primary/50 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <h3 className="text-center font-bold text-primary text-xl">REVIEW</h3>
              </div>
              <p className="text-base text-slate-50 font-bold leading-relaxed">{review.review}</p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">First Half:</h4>
                <p className="text-base font-bold text-slate-50 leading-relaxed">{review.firstHalf}</p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Second Half:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">{review.secondHalf}</p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Positives:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">{review.positives}</p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Negatives:</h4>
                <p className="text-base font-bold text-slate-50 leading-relaxed">{review.negatives}</p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Overall Movie:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">{review.overall}</p>
              </div>
            </div>

            <InteractionButtons
              review={review}
              onLike={handleLikeClick}
              onToggleComments={() => setShowComments(prev => !prev)}
              onShare={handleShare}
              isLiked={likedReviews.has(review.id)}
            />

            {showComments && (
              <CommentSection
                review={review}
                newComment={newComment}
                onCommentChange={setNewComment}
                onCommentSubmit={handleCommentSubmit}
                onReplySubmit={handleReplySubmit}
              />
            )}
          </CardContent>
        </Card>

        {/* 🌟 Rating Meter with Spin Feature */}
        <Card className="bg-slate-100 border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-sm mx-auto mt-6 p-8 flex flex-col items-center gap-4">
          <h3 className="text-2xl text-center text-slate-900 font-extrabold">RATING METER</h3>

          <div
            className={`transition-transform duration-700 ${
              isSpinning ? 'animate-spin-slow' : ''
            }`}
          >
            <ThreeDRatingMeter rating={parseFloat(review.rating)} size={160} />
          </div>

          {showRatingValue ? (
            <p className="text-3xl font-extrabold text-primary mt-4">{review.rating} / 5 ⭐</p>
          ) : (
            <Button
              onClick={handleShowRating}
              disabled={isSpinning}
              className="bg-primary text-white mt-4 hover:bg-primary/90"
            >
              {isSpinning ? 'Spinning...' : 'Show Rating'}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReviewDetail;
