import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { getDeviceId, getUserCommentReaction, saveUserCommentReaction } from '@/utils/deviceFingerprint';
import { ref, get, runTransaction } from 'firebase/database';
import { database } from '@/utils/firebase';

interface EmojiOption {
  emoji: string;
  label: string;
  key: string;
}

const emojiOptions: EmojiOption[] = [
  { emoji: '🔥', label: 'Hype', key: 'hype' },
  { emoji: '😂', label: 'Funny', key: 'funny' },
  { emoji: '😭', label: 'Emotional', key: 'emotional' },
  { emoji: '🤯', label: 'Shock', key: 'shock' },
  { emoji: '😡', label: 'Disappointed', key: 'disappointed' },
  { emoji: '👏', label: 'Appreciate', key: 'appreciate' },
  { emoji: '😍', label: 'Love', key: 'love' },
];

interface EmojiReactionPanelProps {
  targetId: string;
  targetType: 'movie' | 'review' | 'comment';
}

interface EmojiCounts {
  [key: string]: number;
}

export const EmojiReactionPanel: React.FC<EmojiReactionPanelProps> = ({
  targetId,
  targetType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [emojiCounts, setEmojiCounts] = useState<EmojiCounts>({});
  const [isLoading, setIsLoading] = useState(false);
  const deviceId = getDeviceId();

  // Storage key for this specific target
  const storageKey = `emoji-reaction-${targetType}-${targetId}`;

  useEffect(() => {
    // Load user's previous reaction from localStorage
    const savedReaction = localStorage.getItem(storageKey);
    if (savedReaction) {
      setSelectedEmoji(savedReaction);
    }

    // Load emoji counts from Firebase
    const fetchCounts = async () => {
      try {
        const countsRef = ref(database, `emojiReactions/${targetType}/${targetId}/counts`);
        const snapshot = await get(countsRef);
        if (snapshot.exists()) {
          setEmojiCounts(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching emoji counts:', error);
      }
    };

    fetchCounts();
  }, [targetId, targetType, storageKey]);

  const handleEmojiSelect = async (emojiKey: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const previousEmoji = selectedEmoji;
    const countsRef = ref(database, `emojiReactions/${targetType}/${targetId}/counts`);

    try {
      await runTransaction(countsRef, (currentCounts) => {
        const counts = currentCounts || {};
        
        // Decrement previous emoji if exists
        if (previousEmoji && counts[previousEmoji]) {
          counts[previousEmoji] = Math.max(0, (counts[previousEmoji] || 0) - 1);
        }
        
        // Increment new emoji
        counts[emojiKey] = (counts[emojiKey] || 0) + 1;
        
        return counts;
      });

      // Update local state
      setSelectedEmoji(emojiKey);
      localStorage.setItem(storageKey, emojiKey);
      
      // Update local counts
      setEmojiCounts(prev => {
        const newCounts = { ...prev };
        if (previousEmoji && newCounts[previousEmoji]) {
          newCounts[previousEmoji] = Math.max(0, (newCounts[previousEmoji] || 0) - 1);
        }
        newCounts[emojiKey] = (newCounts[emojiKey] || 0) + 1;
        return newCounts;
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error updating emoji reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total reactions
  const totalReactions = Object.values(emojiCounts).reduce((sum, count) => sum + count, 0);

  // Get the currently selected emoji display
  const displayEmoji = selectedEmoji 
    ? emojiOptions.find(e => e.key === selectedEmoji)?.emoji || '😀'
    : '😀';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <span className="text-lg">{displayEmoji}</span>
          <span className="text-sm">{totalReactions > 0 ? totalReactions : ''}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2 bg-popover border-border"
        align="start"
        sideOffset={8}
      >
        <div className="flex gap-1 flex-wrap max-w-[280px]">
          {emojiOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleEmojiSelect(option.key)}
              disabled={isLoading}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-200
                hover:bg-accent hover:scale-110 active:scale-95
                min-w-[44px] min-h-[44px]
                ${selectedEmoji === option.key ? 'bg-primary/20 ring-2 ring-primary' : ''}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={option.label}
            >
              <span className="text-2xl">{option.emoji}</span>
              {emojiCounts[option.key] > 0 && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {emojiCounts[option.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
