// Admin category-wise ratings
export interface AdminRatings {
  story: number;
  acting: number;
  music: number;
  direction: number;
  cinematography: number;
  rewatchValue: number;
}

// Calculate overall admin rating (average of all categories)
export const calculateAdminOverall = (ratings: AdminRatings): number => {
  const values = Object.values(ratings);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
};

// User rating aggregate data
export interface UserRatingData {
  totalRatingSum: number;
  ratingCount: number;
  averageRating: number;
}

// Individual user rating with anti-spam metadata
export interface UserRating {
  rating: number;
  deviceHash: string;
  ipHash?: string;
  timestamp: Date;
  movieId: string;
}

// Reaction types available
export type ReactionType = 'lol' | 'emotional' | 'mass' | 'mindBlowing' | 'boring';

// Reaction emoji mapping
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  lol: '😂',
  emotional: '😭',
  mass: '🔥',
  mindBlowing: '🤯',
  boring: '😴'
};

// Reaction labels
export const REACTION_LABELS: Record<ReactionType, string> = {
  lol: 'LOL',
  emotional: 'Emotional',
  mass: 'Mass',
  mindBlowing: 'Mind-Blowing',
  boring: 'Boring'
};

// Comment reactions aggregate
export interface CommentReactions {
  lol: number;
  emotional: number;
  mass: number;
  mindBlowing: number;
  boring: number;
}

// Individual reaction record
export interface UserReaction {
  commentId: string;
  reactionType: ReactionType;
  deviceHash: string;
  timestamp: Date;
}

// Extended movie review with admin and user ratings
export interface ExtendedMovieReview {
  id: string;
  title: string;
  image: string;
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
  rating: string; // Legacy overall rating text
  adminRatings?: AdminRatings;
  adminOverall?: number;
  userRatingData?: UserRatingData;
  likes: number;
  comments: Comment[];
  views?: number;
}
