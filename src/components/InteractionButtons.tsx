import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';
import { EmojiReactionPanel } from './EmojiReactionPanel';

interface InteractionButtonsProps {
  review: MovieReview;
  onLike: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
  isLiked?: boolean;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  review,
  onLike,
  onShare,
  isLiked = false
}) => {
  return (
    <div className="flex justify-around items-center pt-4 border-t border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLike(review.id)}
        className={`flex items-center gap-2 text-foreground transition-colors ${
          isLiked 
            ? 'text-red-500 hover:text-red-400' 
            : 'hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        {review.likes}
      </Button>
      
      <EmojiReactionPanel targetId={review.id} targetType="review" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onShare(review)}
        className="flex items-center gap-2 text-foreground hover:text-green-500 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
};
