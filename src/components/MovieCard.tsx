
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
  onToggleComments: (reviewId: string) => void;
  onShare: (review: MovieReview) => void;
  onCommentChange: (reviewId: string, value: string) => void;
  onCommentSubmit: (reviewId: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  review,
  showComments,
  newComment,
  onLike,
  onToggleComments,
  onShare,
  onCommentChange,
  onCommentSubmit
}) => {
  return (
    <Card className="bg-black text-white border-none shadow-xl h-full">
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
          backgroundClip: 'text'
        }}>
          REVIEW
        </h5>
        <p className="text-pink-400 font-bold text-sm">{review.review}</p>
        
        <div className="space-y-2">
          <h6 className="text-red-500 font-semibold">First Half:</h6>
          <p className="text-pink-400 font-bold text-sm">{review.firstHalf}</p>
          
          <h6 className="text-red-500 font-semibold">Second Half:</h6>
          <p className="text-pink-400 font-bold text-sm">{review.secondHalf}</p>
          
          <h6 className="text-red-500 font-semibold">Positives:</h6>
          <p className="text-pink-400 font-bold text-sm">{review.positives}</p>
          
          <h6 className="text-red-500 font-semibold">Negatives:</h6>
          <p className="text-pink-400 font-bold text-sm">{review.negatives}</p>
          
          <h6 className="text-red-500 font-semibold">Overall Movie:</h6>
          <p className="text-pink-400 font-bold text-sm">{review.overall}</p>
        </div>

        <InteractionButtons
          review={review}
          onLike={onLike}
          onToggleComments={onToggleComments}
          onShare={onShare}
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
          background: 'linear-gradient(164deg, rgba(238, 174, 202, 1) 0%, rgba(160, 148, 233, 0.8960376386882878) 100%)'
        }}
      >
        <div className="w-full">
          <h1 className="text-lg font-bold text-black mb-2">SM RATING</h1>
          <div className="flex justify-center">
            <div className="text-center">
              <p className="p-2 mt-2 font-bold text-black">
                {review.rating}
              </p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
