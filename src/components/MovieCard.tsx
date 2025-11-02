import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MovieReview } from '@/data/movieReviews';
import { InteractionButtons } from './InteractionButtons';
import { CommentSection } from './CommentSection';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface MovieCardProps {
  review: MovieReview;
  showComments: boolean;
  newComment: string;
  onLike: (reviewId: string) => void;
  onToggleComments: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
  onCommentChange: (reviewId: string, value: string) => void;
  onCommentSubmit: (reviewId: string) => void;
  onReplySubmit: (reviewId: string, commentId: string, replyText: string) => void;
  isLiked?: boolean;
}
export const MovieCard: React.FC<MovieCardProps> = ({
  review,
  showComments,
  newComment,
  onLike,
  onToggleComments,
  onShare,
  onCommentChange,
  onCommentSubmit,
  onReplySubmit,
  isLiked = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return <Card className="bg-card border-2 border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)] h-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] cursor-pointer">
      <div onClick={() => setIsExpanded(!isExpanded)}>
        <CardHeader className="text-center">
          <h3 className="text-xl font-bold text-primary">
            {review.title}
          </h3>
        </CardHeader>

        <div className="px-4">
          <img src={review.image} alt={review.title} className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-primary/30" />
        </div>

        <CardContent className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <span className="font-bold text-sm">
              {isExpanded ? 'Click to collapse' : 'Click to read full review'}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {!isExpanded && <p className="text-muted-foreground text-sm line-clamp-3 text-center">{review.review}</p>}
        </CardContent>
      </div>

      {isExpanded && <CardContent className="space-y-4 pt-0" onClick={e => e.stopPropagation()}>
          <div className="border-t border-primary/30 pt-4">
            <h5 className="text-center font-bold text-primary mb-3">REVIEW</h5>
            <p className="text-card-foreground font-medium text-sm">{review.review}</p>
          </div>

          <div className="space-y-3">
            <div className="border-l-2 border-primary pl-3">
              <h6 className="text-primary font-bold mb-1">First Half:</h6>
              <p className="text-card-foreground text-sm">{review.firstHalf}</p>
            </div>

            <div className="border-l-2 border-primary pl-3">
              <h6 className="text-primary font-bold mb-1">Second Half:</h6>
              <p className="text-card-foreground text-sm">{review.secondHalf}</p>
            </div>

            <div className="border-l-2 border-primary pl-3">
              <h6 className="text-primary font-bold mb-1">Positives:</h6>
              <p className="text-card-foreground text-sm">{review.positives}</p>
            </div>

            <div className="border-l-2 border-primary pl-3">
              <h6 className="text-primary font-bold mb-1">Negatives:</h6>
              <p className="text-card-foreground text-sm">{review.negatives}</p>
            </div>

            <div className="border-l-2 border-primary pl-3">
              <h6 className="text-primary font-bold mb-1">Overall Movie:</h6>
              <p className="text-card-foreground text-sm">{review.overall}</p>
            </div>
          </div>

          <InteractionButtons review={review} onLike={onLike} onToggleComments={onToggleComments} onShare={onShare} isLiked={isLiked} />

          {showComments && <CommentSection review={review} newComment={newComment} onCommentChange={value => onCommentChange(review.id, value)} onCommentSubmit={() => onCommentSubmit(review.id)} onReplySubmit={(commentId, replyText) => onReplySubmit(review.id, commentId, replyText)} />}
        </CardContent>}

      <CardFooter className="text-primary-foreground rounded-b-lg bg-[#e8a015]">
        <div className="w-full">
          <h1 className="text-lg font-bold mb-2 mt-1 text-center">SM RATING</h1>
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded-md font-bold bg-background text-primary border-2 border-primary min-w-[60px] text-center">
              {review.rating}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>;
};