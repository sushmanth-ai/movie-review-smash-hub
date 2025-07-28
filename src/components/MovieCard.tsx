import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MovieReview } from '@/data/movieReviews';
import { InteractionButtons } from './InteractionButtons';
import { CommentSection } from './CommentSection';

interface MovieCardProps {
  review: MovieReview;
  showComments: boolean;
  newComment: string;
  onLike: (reviewId: string) => void;
  onView: (reviewId: string) => void;
  onToggleComments: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
  onCommentChange: (reviewId: string, value: string) => void;
  onCommentSubmit: (reviewId: string) => void;
  isLiked?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  review,
  showComments,
  newComment,
  onLike,
  onView,
  onToggleComments,
  onShare,
  onCommentChange,
  onCommentSubmit,
  isLiked = false
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [hasBeenViewed, setHasBeenViewed] = React.useState(false);

  // Track view when card enters viewport
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenViewed) {
          onView(review.id);
          setHasBeenViewed(true);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [review.id, onView, hasBeenViewed]);
  return (
    <Card ref={cardRef} className="bg-black text-white border-none shadow-xl h-full">
      <CardHeader className="text-center">
        <h3 className="text-xl font-bold" style={{
          background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '10px'
        }}>
          {review.title}
        </h3>
      </CardHeader>

      <div className="px-4">
        <img 
          src={review.image} 
          alt={review.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      </div>

      <CardContent className="space-y-4">
        <h5 className="text-center font-bold" style={{
          background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '10px'
        }}>
          REVIEW
        </h5>

        <p className="text-white-500 font-bold text-sm">{review.review}</p>

        <div className="space-y-2">
          <h6 className="text-red-500 font-bold">First Half:</h6>
          <p className="text-white-500 font-bold text-sm">{review.firstHalf}</p>

          <h6 className="text-red-500 font-bold">Second Half:</h6>
          <p className="text-white-500 font-bold text-sm">{review.secondHalf}</p>

          <h6 className="text-red-500 font-bold">Positives:</h6>
          <p className="text-white-500 font-bold text-sm">{review.positives}</p>

          <h6 className="text-red-500 font-bold">Negatives:</h6>
          <p className="text-white-500 font-bold text-sm">{review.negatives}</p>

          <h6 className="text-red-500 font-bold">Overall Movie:</h6>
          <p className="text-white-500 font-bold text-sm">{review.overall}</p>
        </div>

        <InteractionButtons
          review={review}
          onLike={onLike}
          onToggleComments={onToggleComments}
          onShare={onShare}
          isLiked={isLiked}
        />

        {showComments && (
          <CommentSection
            review={review}
            newComment={newComment}
            onCommentChange={(value) => onCommentChange(review.id, value)}
            onCommentSubmit={() => onCommentSubmit(review.id)}
          />
        )}
      </CardContent>

      <CardFooter 
        className="text-center rounded-b-lg" 
        style={{
          background: 'linear-gradient(164deg, rgba(238, 174, 202, 1) 0%, rgba(160, 148, 233, 0.896) 100%)'
        }}
      >
        <div className="w-full">
          <h1 className="text-lg font-bold text-black mb-2 mt-1">SM RATING</h1>
          <div className="flex justify-center">
            <div
              className="px-4 py-2 rounded-md font-bold text-black"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {review.rating}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
