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
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Long press handlers for mobile
  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsOpen(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleEmojiClick = useCallback(async (emoji: string) => {
    const previousReaction = userReaction;
    const isRemovingReaction = previousReaction === emoji;
    
    // Trigger animation
    setAnimatingEmoji(emoji);
    
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
        if (previousReaction && newReactions[previousReaction]) {
          newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
        }
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return newReactions;
      });
    }

    setIsOpen(false);
    setTimeout(() => setAnimatingEmoji(null), 300);

    // Update Firebase
    if (database) {
      try {
        const reactionsRef = ref(database, `emojiReactions/${targetType}/${targetId}`);
        
        await runTransaction(reactionsRef, (currentData: ReactionData | null) => {
          const data = currentData || { counts: {}, users: {} };
          
          if (previousReaction && data.counts[previousReaction]) {
            data.counts[previousReaction] = Math.max(0, (data.counts[previousReaction] || 0) - 1);
          }
          
          if (isRemovingReaction) {
            delete data.users[deviceId];
          } else {
            data.counts[emoji] = (data.counts[emoji] || 0) + 1;
            data.users[deviceId] = emoji;
          }
          
          return data;
        });
      } catch (error: any) {
        console.log('Firebase sync failed (changes saved locally):', error.message);
      }
    }
  }, [userReaction, storageKey, targetType, targetId, deviceId]);

  // Get emojis with counts > 0
  const activeReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="relative inline-flex flex-col items-start gap-2">
      {/* Emoji trigger button - Icon only, no text */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
          userReaction 
            ? 'bg-primary/20 text-primary' 
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title="React"
        aria-label="Add reaction"
      >
        {userReaction ? (
          <span className="text-xl">{userReaction}</span>
        ) : (
          <Smile className="w-5 h-5" />
        )}
      </button>

      {/* WhatsApp-style floating emoji popup */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed inset-0 z-[9999] pointer-events-none"
          style={{ isolation: 'isolate' }}
        >
          <div 
            className="pointer-events-auto absolute"
            style={{
              bottom: buttonRef.current 
                ? `${window.innerHeight - buttonRef.current.getBoundingClientRect().top + 8}px` 
                : '100px',
              left: buttonRef.current 
                ? `${Math.max(16, buttonRef.current.getBoundingClientRect().left - 80)}px` 
                : '50%',
            }}
          >
            <div 
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-full shadow-2xl"
              style={{
                animation: 'popupAppear 0.2s ease-out forwards',
              }}
            >
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className={`text-2xl p-2 rounded-full transition-all duration-150 hover:scale-150 hover:bg-primary/20 active:scale-90 ${
                    userReaction === emoji ? 'bg-primary/30 scale-110' : ''
                  }`}
                  style={{
                    animation: `emojiPop 0.15s ease-out ${index * 0.03}s forwards`,
                    opacity: 0,
                    transform: 'scale(0.5) translateY(10px)',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reaction chips display - WhatsApp style inline chips */}
      {activeReactions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeReactions.map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 hover:scale-105 active:scale-95 ${
                userReaction === emoji 
                  ? 'bg-primary/25 border border-primary/50' 
                  : 'bg-muted/60 border border-border/30 hover:bg-muted'
              } ${animatingEmoji === emoji ? 'scale-110' : ''}`}
            >
              <span className="text-sm">{emoji}</span>
              <span className={`font-medium tabular-nums ${
                userReaction === emoji ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* CSS Keyframes */}
      <style>{`
        @keyframes popupAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes emojiPop {
          from {
            opacity: 0;
            transform: scale(0.5) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
