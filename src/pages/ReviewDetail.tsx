import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';
import { movieReviewsData } from '@/data/movieReviews';
import { InteractionButtons } from '@/components/InteractionButtons';
import { CommentSection } from '@/components/CommentSection';
import { ThreeDRatingMeter } from '@/components/ThreeDRatingMeter';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  WhatsappShareButton,
  TwitterShareButton,
  FacebookShareButton,
  WhatsappIcon,
  TwitterIcon,
  FacebookIcon
} from 'react-share';

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [review, setReview] = useState<MovieReview | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [spin, setSpin] = useState(false); // ✅ For 3D spin animation

  const {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleReply,
    handleShare,
    likedReviews
  } = useFirebaseOperations();

  // Adapter for hook API
  const setReviewFromList: React.Dispatch<React.SetStateAction<MovieReview[]>> = updater => {
    setReview(prev => {
      const currentList = prev ? [prev] : [];
      const nextList =
        typeof updater === 'function' ? (updater as any)(currentList) : updater;
      return nextList?.[0] ?? prev;
    });
  };

  const noopSetNewComment: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  > = () => {};

  // Load review and views
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

  // Event Handlers
  const handleLikeClick = (reviewId: string) => handleLike(reviewId, setReviewFromList);
  const handleCommentSubmit = () => {
    if (!review || !newComment.trim()) return;
    handleComment(review.id, newComment, setReviewFromList, noopSetNewComment);
    setNewComment('');
  };
  const handleReplySubmit = (commentId: string, replyText: string) => {
    if (!review || !replyText.trim()) return;
    handleReply(review.id, commentId, replyText, setReviewFromList);
  };

  const handleSpin = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 1200);
  };

  // Share setup
  const shareUrl = window.location.href;
  const shareTitle = `${review.title} - ${review.rating}⭐ Review on SM Reviews 3D`;

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
          <h1 className="text-xl font-bold text-primary">SM REVIEW 3.0</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Card className="bg-card border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-4xl mx-auto">
          <CardHeader className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-primary tracking-wide">
              {review.title}
            </h2>
          </CardHeader>

          <div className="px-6">
            <img
              src={review.image}
              alt={review.title}
              className="w-full max-h-[500px] object-cover rounded-lg mb-6 border-2 border-primary/30"
            />
          </div>

          <CardContent className="space-y-6">
            {/* Review Content */}
            <div className="border-t border-primary/30 pt-4">
              <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg p-4 mb-4 border-2 border-primary/50 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <h3 className="text-center font-bold text-primary text-xl">REVIEW</h3>
              </div>
              <p className="text-base text-slate-50 font-bold leading-relaxed">
                {review.review}
              </p>
            </div>

            {/* Segments */}
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">First Half:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">
                  {review.firstHalf}
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Second Half:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">
                  {review.secondHalf}
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Positives:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">
                  {review.positives}
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Negatives:</h4>
                <p className="text-base font-bold text-slate-50 leading-relaxed">
                  {review.negatives}
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="text-primary font-bold text-lg mb-2">Overall Movie:</h4>
                <p className="text-base text-slate-50 font-bold leading-relaxed">
                  {review.overall}
                </p>
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

        {/* ✅ Separate Rating Card with Spin */}
        <Card
          onClick={handleSpin}
          className="cursor-pointer bg-slate-100 border-2 border-primary shadow-[0_0_30px_rgba(255,215,0,0.5)] max-w-sm mx-auto mt-6 p-8 transition-transform duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-2xl text-center text-slate-900 font-extrabold">
              RATING METER
            </h3>
            <motion.div
              animate={spin ? { rotateY: 360 } : { rotateY: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <ThreeDRatingMeter rating={parseFloat(review.rating)} size={160} />
            </motion.div>
            <p className="text-slate-700 font-bold mt-2">(Tap to Spin)</p>
          </div>
        </Card>

        {/* ✅ Share Buttons Section */}
        <div className="flex justify-center gap-4 mt-8">
          <WhatsappShareButton url={shareUrl} title={shareTitle}>
            <WhatsappIcon size={40} round />
          </WhatsappShareButton>

          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <TwitterIcon size={40} round />
          </TwitterShareButton>

          <FacebookShareButton url={shareUrl} quote={shareTitle}>
            <FacebookIcon size={40} round />
          </FacebookShareButton>

          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast({
                title: 'Link Copied!',
                description: 'You can now share this review link anywhere.',
              });
            }}
            className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition"
          >
            🔗
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
