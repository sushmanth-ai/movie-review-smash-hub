// Dialogue sticker types for Telugu movie reactions
export interface DialogueSticker {
  id: string;
  emoji: string;
  dialogue: string;
  emotion: 'mass' | 'shock' | 'emotional' | 'comedy' | 'disappointed';
}

// Predefined dialogue stickers
export const DIALOGUE_STICKERS: DialogueSticker[] = [
  {
    id: 'mass',
    emoji: '🔥',
    dialogue: 'Mass ra Babu!',
    emotion: 'mass',
  },
  {
    id: 'shock',
    emoji: '🤯',
    dialogue: 'Mind Block!',
    emotion: 'shock',
  },
  {
    id: 'emotional',
    emoji: '😭',
    dialogue: 'Kallu Neellu Tirigay!',
    emotion: 'emotional',
  },
  {
    id: 'comedy',
    emoji: '😂',
    dialogue: 'Navvu Aagatledu!',
    emotion: 'comedy',
  },
  {
    id: 'disappointed',
    emoji: '😡',
    dialogue: 'Director em teesadu ra!',
    emotion: 'disappointed',
  },
];

// Dialogue reactions aggregate
export interface DialogueReactions {
  mass: number;
  shock: number;
  emotional: number;
  comedy: number;
  disappointed: number;
}

// Individual dialogue reaction record
export interface UserDialogueReaction {
  targetId: string;
  targetType: 'movie' | 'review' | 'comment';
  stickerId: string;
  deviceHash: string;
  timestamp: Date;
}
