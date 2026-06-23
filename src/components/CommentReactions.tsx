import React, { useState, useEffect } from 'react';
import { ReactionType, REACTION_EMOJIS, REACTION_LABELS, CommentReactions } from '@/types/ratings';
import { getUserCommentReaction, saveUserCommentReaction, getDeviceId } from '@/utils/deviceFingerprint';
import { doc, runTransaction, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface CommentReactionsProps {
  commentId: string;
  compact?: boolean;
}

const REACTION_TYPES: ReactionType[] = ['lol', 'emotional', 'mass', 'mindBlowing', 'boring'];

export const CommentReactionsComponent: React.FC<CommentReactionsProps> = ({ 
  commentId,
  compact = false 
}) => {
  const [reactions, setReactions] = useState<CommentReactions>({
    lol: 0,
    emotional: 0,
    mass: 0,
    mindBlowing: 0,
    boring: 0
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load user's existing reaction from localStorage
    const savedReaction = getUserCommentReaction(commentId) as ReactionType | null;
    if (savedReaction) {
      setUserReaction(savedReaction);
    }
    
    // Load reactions from Firebase with real-time updates
    if (db) {
      const reactionRef = doc(db, 'commentReactions', commentId);
      const unsubscribe = onSnapshot(reactionRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setReactions({
            lol: data.lol || 0,
            emotional: data.emotional || 0,
            mass: data.mass || 0,
            mindBlowing: data.mindBlowing || 0,
            boring: data.boring || 0
          });
        }
      });
      
      return () => unsubscribe();
    }
  }, [commentId]);

  const handleReactionClick = async (reaction: ReactionType) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const previousReaction = userReaction;
    const deviceHash = getDeviceId();
    
    try {
      // If clicking the same reaction, remove it
      const newReaction = previousReaction === reaction ? null : reaction;
      
      // Update local state
      setUserReaction(newReaction);
      saveUserCommentReaction(commentId, newReaction);
      
      // Update local reactions count
      setReactions(prev => {
        const updated = { ...prev };
        if (previousReaction) {
          updated[previousReaction] = Math.max(0, updated[previousReaction] - 1);
        }
        if (newReaction) {
          updated[newReaction] = updated[newReaction] + 1;
        }
        return updated;
      });

      if (!db) {
        setIsSubmitting(false);
        return;
      }

      const reactionRef = doc(db, 'commentReactions', commentId);
      
      await runTransaction(db, async (transaction) => {
        const reactionDoc = await transaction.get(reactionRef);
        
        let data: CommentReactions = {
          lol: 0,
          emotional: 0,
          mass: 0,
          mindBlowing: 0,
          boring: 0
        };
        
        if (reactionDoc.exists()) {
          const docData = reactionDoc.data();
          data = {
            lol: docData.lol || 0,
            emotional: docData.emotional || 0,
            mass: docData.mass || 0,
            mindBlowing: docData.mindBlowing || 0,
            boring: docData.boring || 0
          };
        }
        
        // Decrement previous reaction
        if (previousReaction) {
          data[previousReaction] = Math.max(0, data[previousReaction] - 1);
        }
        
        // Increment new reaction
        if (newReaction) {
          data[newReaction] = data[newReaction] + 1;
        }
        
        transaction.set(reactionRef, {
          ...data,
          commentId,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  if (compact) {
    // Show only reactions with counts > 0
    const activeReactions = REACTION_TYPES.filter(type => reactions[type] > 0);
    
    if (activeReactions.length === 0 && !userReaction) {
      return (
        <div className="flex gap-1">
          {REACTION_TYPES.slice(0, 3).map((type) => (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              disabled={isSubmitting}
              className="text-sm opacity-50 hover:opacity-100 transition-opacity"
              title={REACTION_LABELS[type]}
            >
              {REACTION_EMOJIS[type]}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {REACTION_TYPES.map((type) => {
          const count = reactions[type];
          const isSelected = userReaction === type;
          
          if (count === 0 && !isSelected) return null;
          
          return (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              disabled={isSubmitting}
              className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 transition-all ${
                isSelected 
                  ? 'bg-primary/30 border border-primary/50' 
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}
              title={REACTION_LABELS[type]}
            >
              <span>{REACTION_EMOJIS[type]}</span>
              {count > 0 && <span className="text-[10px]">{count}</span>}
            </button>
          );
        })}
        
        {/* Show hidden reactions button */}
        {REACTION_TYPES.filter(t => reactions[t] === 0 && userReaction !== t).length > 0 && (
          <button
            onClick={() => {
              const firstUnused = REACTION_TYPES.find(t => reactions[t] === 0 && userReaction !== t);
              if (firstUnused) handleReactionClick(firstUnused);
            }}
            disabled={isSubmitting}
            className="text-xs text-gray-500 hover:text-gray-400"
          >
            +
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTION_TYPES.map((type) => {
        const count = reactions[type];
        const isSelected = userReaction === type;
        
        return (
          <button
            key={type}
            onClick={() => handleReactionClick(type)}
            disabled={isSubmitting}
            className={`px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
              isSelected 
                ? 'bg-primary/30 border-2 border-primary scale-110' 
                : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 hover:scale-105'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={REACTION_LABELS[type]}
          >
            <span className="text-lg">{REACTION_EMOJIS[type]}</span>
            <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-gray-300'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
