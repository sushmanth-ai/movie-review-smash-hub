// Generate a simple device fingerprint using available browser properties
export const generateDeviceFingerprint = (): string => {
  const components: string[] = [];
  
  // Screen properties
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.colorDepth}`);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Language
  components.push(navigator.language);
  
  // Platform
  components.push(navigator.platform);
  
  // User agent (truncated)
  components.push(navigator.userAgent.substring(0, 50));
  
  // Available cores
  components.push(`${navigator.hardwareConcurrency || 0}`);
  
  // Touch support
  components.push(`${navigator.maxTouchPoints || 0}`);
  
  // Combine and hash
  const fingerprint = components.join('|');
  return hashString(fingerprint);
};

// Simple hash function for fingerprint
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

// Get or create persistent device ID
export const getDeviceId = (): string => {
  const storageKey = 'smr_device_id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = generateDeviceFingerprint() + '_' + Date.now().toString(36);
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
};

// Check if user has already rated a movie
export const hasUserRatedMovie = (movieId: string): boolean => {
  const ratingsKey = 'smr_user_ratings';
  const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
  return movieId in ratings;
};

// Get user's rating for a movie
export const getUserMovieRating = (movieId: string): number | null => {
  const ratingsKey = 'smr_user_ratings';
  const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
  return ratings[movieId] || null;
};

// Save user's rating for a movie
export const saveUserMovieRating = (movieId: string, rating: number): void => {
  const ratingsKey = 'smr_user_ratings';
  const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
  ratings[movieId] = rating;
  localStorage.setItem(ratingsKey, JSON.stringify(ratings));
};

// Get user's reaction for a comment
export const getUserCommentReaction = (commentId: string): string | null => {
  const reactionsKey = 'smr_user_reactions';
  const reactions = JSON.parse(localStorage.getItem(reactionsKey) || '{}');
  return reactions[commentId] || null;
};

// Save user's reaction for a comment
export const saveUserCommentReaction = (commentId: string, reaction: string | null): void => {
  const reactionsKey = 'smr_user_reactions';
  const reactions = JSON.parse(localStorage.getItem(reactionsKey) || '{}');
  
  if (reaction === null) {
    delete reactions[commentId];
  } else {
    reactions[commentId] = reaction;
  }
  
  localStorage.setItem(reactionsKey, JSON.stringify(reactions));
};
