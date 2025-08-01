
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Reply } from 'lucide-react';
import { MovieReview, Comment } from '@/data/movieReviews';

interface CommentSectionProps {
  review: MovieReview;
  newComment: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  onReplySubmit?: (commentId: string, replyText: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  review,
  newComment,
  onCommentChange,
  onCommentSubmit,
  onReplySubmit
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommentSubmit();
    }
  };

  const handleReplyKeyPress = (e: React.KeyboardEvent, commentId: string) => {
    if (e.key === 'Enter') {
      handleReplySubmit(commentId);
    }
  };

  const handleReplySubmit = (commentId: string) => {
    if (replyText.trim() && onReplySubmit) {
      onReplySubmit(commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`bg-gray-800 p-2 rounded text-sm ${isReply ? 'ml-4 mt-1' : ''}`}>
      <p className="text-gray-300">{comment.text}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-500">
          {comment.author} • {comment.timestamp.toLocaleString()}
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs text-gray-400 hover:text-white"
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
        >
          <Reply className="w-3 h-3 mr-1" />
          Reply
        </Button>
      </div>
      
      {replyingTo === comment.id && (
        <div className="flex gap-2 mt-2">
          <Input
            placeholder={`Reply to ${comment.author}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-gray-700 border-gray-600 text-white text-xs h-8"
            onKeyPress={(e) => handleReplyKeyPress(e, comment.id)}
          />
          <Button
            size="sm"
            onClick={() => handleReplySubmit(comment.id)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-8 px-2"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

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
        {review.comments.map((comment) => renderComment(comment))}
      </div>
    </div>
  );
};
