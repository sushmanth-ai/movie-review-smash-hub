import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';
interface InteractionButtonsProps {
  review: MovieReview;
  onLike: (reviewId: string) => void;
  onToggleComments: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
  isLiked?: boolean;
}
export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  review,
  onLike,
  onToggleComments,
  onShare,
  isLiked = false
}) => {
  return <div className="flex justify-around items-center pt-4 border-t border-gray-700 rounded-xl bg-zinc-950">
      <Button variant="ghost" size="sm" onClick={() => onLike(review.id)} className={`flex items-center gap-2 text-white transition-colors ${isLiked ? 'text-red-500 hover:text-red-400' : 'hover:text-red-500'}`}>
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        {review.likes}
      </Button>
      
      <Button variant="ghost" size="sm" onClick={() => onToggleComments(review.id)} className="flex items-center gap-2 text-white hover:text-blue-500 transition-colors">
        <MessageCircle className="w-4 h-4" />
        {review.comments.length}
      </Button>
      
      <Button variant="ghost" size="sm" onClick={() => onShare(review)} className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>;
};