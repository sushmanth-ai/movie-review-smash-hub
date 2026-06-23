import React, { useState, useEffect } from 'react';
import { DIALOGUE_STICKERS, DialogueReactions, DialogueSticker } from '@/types/dialogueStickers';
import { getDeviceId } from '@/utils/deviceFingerprint';
import { doc, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface DialogueStickerReactionsProps {
  targetId: string;
  targetType: 'movie' | 'review' | 'comment';
}

const STORAGE_KEY_PREFIX = 'sm-dialogue-reaction-';

const getStoredReaction = (targetId: string): string | null => {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${targetId}`);
};

const saveStoredReaction = (targetId: string, stickerId: string | null) => {
  if (stickerId) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${targetId}`, stickerId);
  } else {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${targetId}`);
  }
};

export const DialogueStickerReactions: React.FC<DialogueStickerReactionsProps> = ({ 
  targetId,
  targetType
}) => {
  const [reactions, setReactions] = useState<DialogueReactions>({
    mass: 0,
    shock: 0,
    emotional: 0,
    comedy: 0,
    disappointed: 0
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    // Load user's existing reaction from localStorage
    const savedReaction = getStoredReaction(targetId);
    if (savedReaction) {
      setUserReaction(savedReaction);
    }
    
    // Load reactions from Firebase with real-time updates
    if (db) {
      const docId = `${targetType}_${targetId}`;
      const reactionRef = doc(db, 'dialogueReactions', docId);
      const unsubscribe = onSnapshot(reactionRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReactions({
            mass: data.mass || 0,
            shock: data.shock || 0,
            emotional: data.emotional || 0,
            comedy: data.comedy || 0,
            disappointed: data.disappointed || 0
          });
        }
      });
      
      return () => unsubscribe();
    }
  }, [targetId, targetType]);

  const handleStickerClick = async (sticker: DialogueSticker) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const previousReaction = userReaction;
    const stickerId = sticker.emotion;
    
    // Trigger animation
    setAnimatingId(stickerId);
    setTimeout(() => setAnimatingId(null), 300);
    
    try {
      // If clicking the same sticker, remove it
      const newReaction = previousReaction === stickerId ? null : stickerId;
      
      // Update local state
      setUserReaction(newReaction);
      saveStoredReaction(targetId, newReaction);
      
      // Update local reactions count
      setReactions(prev => {
        const updated = { ...prev };
        if (previousReaction && previousReaction in updated) {
          updated[previousReaction as keyof DialogueReactions] = Math.max(0, updated[previousReaction as keyof DialogueReactions] - 1);
        }
        if (newReaction && newReaction in updated) {
          updated[newReaction as keyof DialogueReactions] = updated[newReaction as keyof DialogueReactions] + 1;
        }
        return updated;
      });

      if (!db) {
        setIsSubmitting(false);
        return;
      }

      const docId = `${targetType}_${targetId}`;
      const reactionRef = doc(db, 'dialogueReactions', docId);
      
      await runTransaction(db, async (transaction) => {
        const reactionDoc = await transaction.get(reactionRef);
        
        let data: DialogueReactions = {
          mass: 0,
          shock: 0,
          emotional: 0,
          comedy: 0,
          disappointed: 0
        };
        
        if (reactionDoc.exists()) {
          const docData = reactionDoc.data();
          data = {
            mass: docData.mass || 0,
            shock: docData.shock || 0,
            emotional: docData.emotional || 0,
            comedy: docData.comedy || 0,
            disappointed: docData.disappointed || 0
          };
        }
        
        // Decrement previous reaction
        if (previousReaction && previousReaction in data) {
          data[previousReaction as keyof DialogueReactions] = Math.max(0, data[previousReaction as keyof DialogueReactions] - 1);
        }
        
        // Increment new reaction
        if (newReaction && newReaction in data) {
          data[newReaction as keyof DialogueReactions] = data[newReaction as keyof DialogueReactions] + 1;
        }
        
        transaction.set(reactionRef, {
          ...data,
          targetId,
          targetType,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      });
    } catch (error) {
      console.error('Error updating dialogue reaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DIALOGUE_STICKERS.map((sticker) => {
        const count = reactions[sticker.emotion];
        const isSelected = userReaction === sticker.emotion;
        const isAnimating = animatingId === sticker.emotion;
        
        return (
          <button
            key={sticker.id}
            onClick={() => handleStickerClick(sticker)}
            disabled={isSubmitting}
            className={`
              group relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl 
              transition-all duration-200 
              ${isAnimating ? 'animate-reaction-bounce' : ''}
              ${isSelected 
                ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20' 
                : 'bg-secondary/50 border border-border/30 hover:bg-secondary hover:border-border/50 hover:scale-105'
              } 
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-2xl">{sticker.emoji}</span>
            <span className={`text-[10px] font-medium leading-tight text-center max-w-[80px] ${
              isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`}>
              {sticker.dialogue}
            </span>
            {count > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center 
                text-[10px] font-bold rounded-full px-1 ${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
