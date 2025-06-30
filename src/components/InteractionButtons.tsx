import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';

interface InteractionButtonsProps {
  review: MovieReview;
  onLike: (reviewId: string) => void;
  onToggleComments: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
}

const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  review,
  onLike,
  onToggleComments,
  onShare,
}) => {
  return (
    <div className="flex justify-around items-center pt-4 border-t border-gray-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLike(review.id)}
        className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
      >
        <Heart className="w-4 h-4" />
        {review.likes}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleComments(review.id)}
        className="flex items-center gap-2 text-white hover:text-blue-500 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {review.comments.length}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onShare(review)}
        className="flex items-center gap-2 text-white hover:text-green-500 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
};

// ---------- PARENT COMPONENT -----------
interface ReviewCardProps {
  review: MovieReview;
  onToggleComments: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onToggleComments,
  onShare,
}) => {
  const [likes, setLikes] = useState(review.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = (reviewId: string) => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md text-white mb-4">
      <h2 className="text-xl font-bold mb-2">{review.title}</h2>
      <img src={review.image} alt={review.title} className="w-full h-48 object-cover rounded-md mb-4" />
      <p className="mb-2">{review.review}</p>
      <p className="text-sm text-gray-300">Rating: {review.rating}</p>

      <InteractionButtons
        review={{ ...review, likes }}
        onLike={handleLike}
        onToggleComments={onToggleComments}
        onShare={onShare}
      />
    </div>
  );
};
