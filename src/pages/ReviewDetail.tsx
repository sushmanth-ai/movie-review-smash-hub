import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';
import { movieReviewsData } from '@/data/movieReviews';
import { InteractionButtons } from '@/components/InteractionButtons';
import { CommentSection } from '@/components/CommentSection';
import { ThreeDRatingMeter } from '@/components/ThreeDRatingMeter';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<MovieReview | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleReply,
    handleShare,
    likedReviews,
  } = useFirebaseOperations();

  // Adapter: use hook's array-based setters with single-review state
  const setReviewFromList: React.Dispatch<React.SetStateAction<MovieReview[]>> = (updater) => {
    setReview(prev => {
      const currentList = prev ? [prev] : [];
      const nextList = typeof updater === 'function' ? (updater as any)(currentList) : updater;
      return nextList?.[0] ?? prev;
    });
  };

  // No-op to satisfy hook API; we manage a single input locally on this page
  const noopSetNewComment: React.Dispatch<React.SetStateAction<{ [key: string]: string }>> = () => {};


  useEffect(() => {
    if (!id) return;

    // First check if it's a Firebase review
    if (db) {
      const reviewDoc = doc(db, 'reviews', id);
      getDoc(reviewDoc).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
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
            comments: []
          };
          setReview(firebaseReview);
          
          // Load likes and comments for this single review
          loadLikes(setReviewFromList);
          loadComments(setReviewFromList);
        } else {
          // Check static data
          const staticReview = movieReviewsData.find(r => r.id === id);
          if (staticReview) {
            const reviewWithDefaults = { ...staticReview, likes: 0, comments: [] };
            setReview(reviewWithDefaults);
            
            loadLikes(setReviewFromList);
            loadComments(setReviewFromList);
          }
        }
      });
    } else {
      // If Firebase not available, use static data
      const staticReview = movieReviewsData.find(r => r.id === id);
      if (staticReview) {
        setReview({ ...staticReview, likes: 0, comments: [] });
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border-b-2 border-primary bg-background">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-primary">SM REVIEW 2.0</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Card className="bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">{review.title}</h2>
          </CardHeader>

          <div className="px-6">
            <img 
              src={review.image} 
              alt={review.title} 
              className="w-full max-h-[500px] object-cover rounded-lg mb-6 border-2 border-primary/30" 
            />
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

            <InteractionButtons
              review={review}
              onLike={handleLikeClick}
              onToggleComments={(_id) => setShowComments(prev => !prev)}
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

          <CardFooter className="bg-primary text-primary-foreground rounded-b-lg py-6">
            <div className="w-full flex flex-col items-center gap-4">
              <h3 className="text-2xl font-bold text-center">SM RATING</h3>
              <ThreeDRatingMeter rating={parseFloat(review.rating)} size={160} />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReviewDetail;
