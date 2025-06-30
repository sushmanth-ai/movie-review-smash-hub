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
  isLiked = false
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

        <p className="font-bold text-base" style={{
          background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          {review.review}
        </p>

        <div className="space-y-2">
          <h6 className="text-red-500 font-semibold">First Half:</h6>
          <p className="text-pink-500 font-bold text-base">{review.firstHalf}</p>

          <h6 className="text-red-500 font-semibold">Second Half:</h6>
          <p className="text-pink-500 font-bold text-base">{review.secondHalf}</p>

          <h6 className="text-red-500 font-semibold">Positives:</h6>
          <p className="text-pink-500 font-bold text-base">{review.positives}</p>

          <h6 className="text-red-500 font-semibold">Negatives:</h6>
          <p className="text-pink-500 font-bold text-base">{review.negatives}</p>

          <h6 className="text-red-500 font-semibold">Overall Movie:</h6>
          <p className="text-pink-500 font-bold text-base">{review.overall}</p>
        </div>

        <InteractionButtons
          review={review}
          onLike={onLike}
          onToggleComments={onToggleComments}
          onShare={onShare}
          isLiked={isLiked}
        />

        {showComments && (
          <div className="mt-4 space-y-2">
            <h4 className="text-pink-400 font-bold">User Comments</h4>
            {review.comments.map((comment, index) => (
              <div
                key={index}
                className={`mb-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                  comment.isUser
                    ? 'bg-pink-100 text-pink-800 border border-pink-400'
                    : 'bg-gray-100 text-black'
                }`}
              >
                {comment.text}
                {comment.isUser && (
                  <span className="ml-2 text-xs text-pink-600 font-bold">You</span>
                )}
              </div>
            ))}

            {/* Comment Input */}
            <input
              type="text"
              value={newComment}
              onChange={(e) => onCommentChange(review.id, e.target.value)}
              className="w-full p-2 text-sm rounded-md text-black border"
              placeholder="Add a comment..."
            />
            <button
              onClick={() => onCommentSubmit(review.id)}
              className="mt-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-md text-sm font-bold"
            >
              Submit
            </button>
          </div>
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
              className="px-4 py-2 rounded-md font-bold text-black animate-pulse-rating"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
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
