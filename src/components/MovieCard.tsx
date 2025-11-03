import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MovieReview } from '@/data/movieReviews';
import { ChevronRight } from 'lucide-react';
import { InteractionButtons } from '@/components/InteractionButtons';
import { CommentSection } from '@/components/CommentSection';

interface MovieCardProps {
  review: MovieReview;
  onLike: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
  onCommentSubmit: (reviewId: string, comment: string) => void;
  onReplySubmit: (reviewId: string, commentId: string, replyText: string) => void;
  isLiked: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  review,
  onLike,
  onShare,
  onCommentSubmit,
  onReplySubmit,
  isLiked
}) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }
    navigate(`/review/${review.id}`);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onCommentSubmit(review.id, newComment);
      setNewComment('');
    }
  };

  return (
    <Card
      className="bg-card border-2 border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)] h-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="text-center">
        <h3 className="text-xl font-bold text-primary">
          {review.title}
        </h3>
      </CardHeader>

      <div className="px-4 pb-4">
        <img
          src={review.image}
          alt={review.title}
          className="w-full h-64 object-cover rounded-lg border-2 border-primary/30"
        />
      </div>

      <CardContent className="pb-4">
        <div className="flex items-center justify-center gap-2 text-primary mb-4">
          <span className="font-bold text-sm">Click to read full review</span>
          <ChevronRight className="w-4 h-4" />
        </div>

        <InteractionButtons
          review={review}
          onLike={() => onLike(review.id)}
          onToggleComments={() => setShowComments(!showComments)}
          onShare={() => onShare(review)}
          isLiked={isLiked}
        />

        {showComments && (
          <CommentSection
            review={review}
            newComment={newComment}
            onCommentChange={setNewComment}
            onCommentSubmit={handleCommentSubmit}
            onReplySubmit={(commentId, replyText) => onReplySubmit(review.id, commentId, replyText)}
          />
        )}
      </CardContent>
    </Card>
  );
};