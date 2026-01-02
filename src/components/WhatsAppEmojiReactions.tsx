import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { ref, get, set, onValue } from 'firebase/database';
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

export const WhatsAppEmojiReactions: React.FC<WhatsAppEmojiReactionsProps> = ({
  targetId,
  targetType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reactions, setReactions] = useState<EmojiReactions>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
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

  // Load reactions from Firebase
  useEffect(() => {
    if (!database) return;

    const reactionsRef = ref(database, `emojiReactions/${targetType}/${targetId}`);
    const unsubscribe = onValue(reactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setReactions(data.counts || {});
      }
    });

    return () => unsubscribe();
  }, [targetId, targetType]);

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

  const handleEmojiClick = async (emoji: string) => {
    setIsAnimating(true);
    
    const previousReaction = userReaction;
    const isRemovingReaction = previousReaction === emoji;
    
    // Update local state
    if (isRemovingReaction) {
      setUserReaction(null);
      localStorage.removeItem(storageKey);
    } else {
      setUserReaction(emoji);
      localStorage.setItem(storageKey, emoji);
    }

    // Update Firebase
    if (database) {
      try {
        const reactionsRef = ref(database, `emojiReactions/${targetType}/${targetId}/counts`);
        const snapshot = await get(reactionsRef);
        const currentCounts: EmojiReactions = snapshot.exists() ? snapshot.val() : {};

        // Remove previous reaction count if changing reaction
        if (previousReaction && currentCounts[previousReaction]) {
          currentCounts[previousReaction] = Math.max(0, (currentCounts[previousReaction] || 0) - 1);
        }

        // Add new reaction count (unless removing)
        if (!isRemovingReaction) {
          currentCounts[emoji] = (currentCounts[emoji] || 0) + 1;
        }

        await set(reactionsRef, currentCounts);
      } catch (error) {
        console.error('Error updating emoji reaction:', error);
      }
    }

    setIsOpen(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const topEmojis = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emoji]) => emoji);

  return (
    <div className="relative inline-flex items-center">
      {/* Emoji trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 font-bold hover:scale-110 transition-transform ${
          userReaction ? 'text-primary' : 'text-muted-foreground'
        }`}
        title="React"
      >
        {userReaction ? (
          <span className="text-2xl">{userReaction}</span>
        ) : (
          <Smile className="w-6 h-6" />
        )}
        {totalReactions > 0 && (
          <span className="text-sm">
            {topEmojis.join('')} {totalReactions}
          </span>
        )}
      </button>

      {/* WhatsApp-style floating emoji panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 ${
            isAnimating ? 'animate-scale-out' : 'animate-scale-in'
          }`}
        >
          <div className="flex items-center gap-1 px-3 py-2 bg-card/95 backdrop-blur-lg border border-border/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {EMOJI_LIST.map((emoji, index) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className={`text-2xl p-2 rounded-full transition-all duration-200 hover:scale-125 hover:bg-primary/20 ${
                  userReaction === emoji ? 'bg-primary/30 scale-110' : ''
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
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
  );
};
