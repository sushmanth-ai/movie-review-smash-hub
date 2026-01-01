import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Reply } from 'lucide-react';
import { MovieReview, Comment } from '@/data/movieReviews';
import { DialogueStickerReactions } from './DialogueStickerReactions';

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
    <div key={comment.id} className={`bg-secondary/50 p-3 rounded-lg text-sm ${isReply ? 'ml-4 mt-2' : ''}`}>
      <p className="text-muted-foreground mb-3">{comment.text}</p>
      
      {/* Dialogue Sticker Reactions */}
      <div className="mb-3">
        <DialogueStickerReactions targetId={comment.id} targetType="comment" />
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground/70">
          {comment.author} • {comment.timestamp.toLocaleString()}
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
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
            className="flex-1 bg-secondary border-border/30 text-foreground text-xs h-8"
            onKeyPress={(e) => handleReplyKeyPress(e, comment.id)}
          />
          <Button
            size="sm"
            onClick={() => handleReplySubmit(comment.id)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-2"
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
    <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="flex-1 bg-secondary border-border/30 text-foreground"
          onKeyPress={handleKeyPress}
        />
        <Button
          size="sm"
          onClick={onCommentSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {review.comments.map((comment) => renderComment(comment))}
      </div>
    </div>
  );
};
