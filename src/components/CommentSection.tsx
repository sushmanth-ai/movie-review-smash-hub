
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';

interface CommentSectionProps {
  review: MovieReview;
  newComment: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  review,
  newComment,
  onCommentChange,
  onCommentSubmit
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommentSubmit();
    }
  };

  return (
    <div className="mt-4 space-y-3 border-t border-gray-700 pt-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="flex-1 bg-gray-800 border-gray-600 text-white"
          onKeyPress={handleKeyPress}
        />
        <Button
          size="sm"
          onClick={onCommentSubmit}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {review.comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 p-2 rounded text-sm">
            <p className="text-gray-300">{comment.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {comment.author} • {comment.timestamp.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
