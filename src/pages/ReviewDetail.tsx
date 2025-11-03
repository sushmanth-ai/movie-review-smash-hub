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
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [review, setReview] = useState<MovieReview | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleReply,
    handleShare,
    likedReviews
  } = useFirebaseOperations();

  // Adapter: use hook's array-based setters with single-review state
  const setReviewFromList: React.Dispatch<React.SetStateAction<MovieReview[]>> = updater => {
    setReview(prev => {
      const currentList = prev ? [prev] : [];
      const nextList = typeof updater === 'function' ? (updater as any)(currentList) : updater;
      return nextList?.[0] ?? prev;
    });
  };

  // No-op to satisfy hook API; we manage a single input locally on this page
  const noopSetNewComment: React.Dispatch<React.SetStateAction<{
    [key: string]: string;
  }>> = () => {};

  // Track view and load review data
  useEffect(() => {
    if (!id) return;
    const trackView = async () => {
      if (db) {
        try {
          const reviewDoc = doc(db, 'reviews', id);
          await updateDoc(reviewDoc, {
            views: increment(1)
          });
        } catch (error) {
          console.log('View tracking error:', error);
        }
      }
    };

    // First check if it's a Firebase review
    if (db) {
      const reviewDoc = doc(db, 'reviews', id);

      // Set up real-time listener for views
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

          // Load likes and comments for this single review
          loadLikes(setReviewFromList);
          loadComments(setReviewFromList);
        } else {
          // Check static data
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
            loadComments(setReviewFromList);
          }
        }
      });

      // Track the view
      trackView();
      return () => unsubscribe();
    } else {
      // If Firebase not available, use static data
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
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-xl">Loading review...</p>
      </div>;
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
  const handleReadReview = async () => {
    if (!review) return;
    if (isReading) {
      // Stop current audio
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
      // Combine all review content in Telugu
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
      console.log('Calling text-to-speech function...');

      // Call the edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: fullReview
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }
      const data = await response.json();

      // Convert base64 to audio and play
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], {
        type: 'audio/mp3'
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create or reuse audio element
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
      audioElement.onerror = () => {
        setIsReading(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive"
        });
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
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-primary">SM REVIEW 2.0</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Card className="bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-4xl mx-auto">
          <CardHeader className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-primary mb-4">{review.title}</h2>
            
          </CardHeader>

          <div className="px-6">
            <img src={review.image} alt={review.title} className="w-full max-h-[500px] object-cover rounded-lg mb-6 border-2 border-primary/30" />
          </div>

          <CardContent className="space-y-6">
            <div className="border-t border-primary/30 pt-4">
              <h3 className="text-center font-bold text-primary text-xl mb-4">REVIEW</h3>
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

            <InteractionButtons review={review} onLike={handleLikeClick} onToggleComments={_id => setShowComments(prev => !prev)} onShare={handleShare} isLiked={likedReviews.has(review.id)} />

            {showComments && <CommentSection review={review} newComment={newComment} onCommentChange={setNewComment} onCommentSubmit={handleCommentSubmit} onReplySubmit={handleReplySubmit} />}
          </CardContent>

        </Card>

        {/* Separate Rating Card */}
        <Card className="bg-slate-100 border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-sm mx-auto mt-6 p-8">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-2xl text-center text-slate-900 font-extrabold"> RATING METER</h3>
            <ThreeDRatingMeter rating={parseFloat(review.rating)} size={160} />
          </div>
        </Card>
      </div>
    </div>;
};
export default ReviewDetail;