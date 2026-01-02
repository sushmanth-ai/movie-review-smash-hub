import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Smile } from 'lucide-react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { database } from '@/utils/firebase';
import { getDeviceId } from '@/utils/deviceFingerprint';

interface WhatsAppEmojiReactionsProps {
  targetId: string;
  targetType: 'movie' | 'review' | 'comment';
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface EmojiReactions {
  [emoji: string]: number;
}

interface ReactionData {
  counts: EmojiReactions;
  users: { [deviceId: string]: string };
}

export const WhatsAppEmojiReactions: React.FC<WhatsAppEmojiReactionsProps> = ({
  targetId,
  targetType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reactions, setReactions] = useState<EmojiReactions>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const deviceId = getDeviceId();
  const storageKey = `emoji_reaction_${targetType}_${targetId}`;

  // Load user's previous reaction from localStorage
  useEffect(() => {
    const savedReaction = localStorage.getItem(storageKey);
    if (savedReaction) {
      setUserReaction(savedReaction);
    }
  }, [storageKey]);

  // Real-time listener for reactions from Firebase
  useEffect(() => {
    if (!database) return;

    const reactionsRef = ref(database, `emojiReactions/${targetType}/${targetId}`);
    const unsubscribe = onValue(reactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as ReactionData;
        setReactions(data.counts || {});
        
        // Sync user's reaction from Firebase if exists
        if (data.users && data.users[deviceId]) {
          const firebaseReaction = data.users[deviceId];
          setUserReaction(firebaseReaction);
          localStorage.setItem(storageKey, firebaseReaction);
        }
      }
    }, (error) => {
      console.log('Firebase read error (using local state):', error.message);
    });

    return () => unsubscribe();
  }, [targetId, targetType, deviceId, storageKey]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = useCallback(async (emoji: string) => {
    const previousReaction = userReaction;
    const isRemovingReaction = previousReaction === emoji;
    
    // Optimistic update - update UI immediately
    setIsAnimating(emoji);
    
    if (isRemovingReaction) {
      setUserReaction(null);
      localStorage.removeItem(storageKey);
      setReactions(prev => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) - 1)
      }));
    } else {
      setUserReaction(emoji);
      localStorage.setItem(storageKey, emoji);
      setReactions(prev => {
        const newReactions = { ...prev };
        // Decrement previous reaction
        if (previousReaction && newReactions[previousReaction]) {
          newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
        }
        // Increment new reaction
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return newReactions;
      });
    }

    setIsOpen(false);
    setTimeout(() => setIsAnimating(null), 400);

    // Update Firebase with transaction for atomic updates
    if (database) {
      try {
        const reactionsRef = ref(database, `emojiReactions/${targetType}/${targetId}`);
        
        await runTransaction(reactionsRef, (currentData: ReactionData | null) => {
          const data = currentData || { counts: {}, users: {} };
          
          // Decrement previous reaction if changing
          if (previousReaction && data.counts[previousReaction]) {
            data.counts[previousReaction] = Math.max(0, (data.counts[previousReaction] || 0) - 1);
          }
          
          if (isRemovingReaction) {
            // Remove user from users map
            delete data.users[deviceId];
          } else {
            // Increment new reaction
            data.counts[emoji] = (data.counts[emoji] || 0) + 1;
            // Store user's reaction
            data.users[deviceId] = emoji;
          }
          
          return data;
        });
      } catch (error: any) {
        console.log('Firebase sync failed (changes saved locally):', error.message);
        // Changes are already applied optimistically, so user sees instant feedback
      }
    }
  }, [userReaction, storageKey, targetType, targetId, deviceId]);

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  
  // Get emojis with counts > 0, sorted by count
  const activeReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Reaction counts display - WhatsApp style pills */}
      {activeReactions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
          {activeReactions.map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
                userReaction === emoji 
                  ? 'bg-primary/30 border-2 border-primary shadow-lg shadow-primary/20' 
                  : 'bg-card/80 border border-border/40 hover:bg-card'
              } ${isAnimating === emoji ? 'animate-scale-in' : ''}`}
            >
              <span className="text-lg">{emoji}</span>
              <span className={`font-semibold ${userReaction === emoji ? 'text-primary' : 'text-foreground'}`}>
                {count}
              </span>
            </button>
          ))}
          {totalReactions > 0 && (
            <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
              {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
            </div>
          )}
        </div>
      )}

      {/* Emoji trigger button */}
      <div className="relative inline-flex items-center">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-200 hover:scale-110 active:scale-95 ${
            userReaction 
              ? 'bg-primary/20 text-primary border border-primary/30' 
              : 'bg-card/60 text-muted-foreground border border-border/30 hover:bg-card hover:text-foreground'
          }`}
          title="React"
        >
          {userReaction ? (
            <span className="text-2xl animate-scale-in">{userReaction}</span>
          ) : (
            <Smile className="w-6 h-6" />
          )}
          <span className="text-sm">
            {userReaction ? 'Reacted' : 'React'}
          </span>
        </button>

        {/* WhatsApp-style floating emoji panel */}
        {isOpen && (
          <div
            ref={panelRef}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-scale-in"
          >
            <div className="flex items-center gap-1 px-4 py-3 bg-card/95 backdrop-blur-xl border border-border/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className={`text-3xl p-2 rounded-full transition-all duration-200 hover:scale-150 hover:bg-primary/20 active:scale-90 ${
                    userReaction === emoji ? 'bg-primary/30 scale-125 ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 40}ms`,
                    animation: 'scale-in 0.2s ease-out forwards',
                    opacity: 0,
                    transform: 'scale(0.5)'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {/* Pointer arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-card/95 border-r border-b border-border/50 rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
};