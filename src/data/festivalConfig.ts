// Festival Configuration - Automatic date-based festival detection system
// All dates are based on Asia/Kolkata timezone

export interface Festival {
  id: string;
  name: string;
  months: number[]; // 1-12 for January-December
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  overlay: 'diya-glow' | 'color-dust' | 'snow-sparkle' | 'hearts' | 'fireworks' | 'pumpkins' | 'rangoli' | 'flowers' | 'crescent' | 'none';
  icons: string[];
  bannerText: string;
  bannerEmoji: string;
  particles: {
    type: 'diyas' | 'colors' | 'snowflakes' | 'hearts' | 'sparks' | 'pumpkins' | 'petals' | 'stars' | 'none';
    count: number;
  };
}

// Festival data for 2025 (update yearly)
export const festivalsConfig: Festival[] = [
  // January - Sankranti
  {
    id: 'sankranti',
    name: 'Makar Sankranti',
    months: [1],
    startDate: '2025-01-13',
    endDate: '2025-01-15',
    colors: {
      primary: '45 100% 51%', // Golden
      secondary: '30 100% 50%', // Orange
      accent: '60 100% 50%', // Yellow
      glow: '45 100% 60%',
    },
    overlay: 'rangoli',
    icons: ['kite', 'sun'],
    bannerText: 'Sankranti Special Movie Reviews',
    bannerEmoji: '🪁',
    particles: { type: 'petals', count: 20 },
  },
  
  // February - Valentine's Day
  {
    id: 'valentines',
    name: "Valentine's Day",
    months: [2],
    startDate: '2025-02-12',
    endDate: '2025-02-15',
    colors: {
      primary: '340 82% 52%', // Rose red
      secondary: '330 100% 71%', // Pink
      accent: '0 100% 67%', // Red
      glow: '340 100% 60%',
    },
    overlay: 'hearts',
    icons: ['heart', 'film'],
    bannerText: 'Valentine Special Romance Reviews',
    bannerEmoji: '💕',
    particles: { type: 'hearts', count: 25 },
  },
  
  // March - Holi
  {
    id: 'holi',
    name: 'Holi',
    months: [3],
    startDate: '2025-03-13',
    endDate: '2025-03-15',
    colors: {
      primary: '280 100% 50%', // Purple
      secondary: '180 100% 50%', // Cyan
      accent: '60 100% 50%', // Yellow
      glow: '300 100% 60%',
    },
    overlay: 'color-dust',
    icons: ['palette', 'film-reel'],
    bannerText: 'Holi Special Colorful Reviews',
    bannerEmoji: '🎨',
    particles: { type: 'colors', count: 30 },
  },
  
  // April - Ugadi
  {
    id: 'ugadi',
    name: 'Ugadi',
    months: [3, 4],
    startDate: '2025-03-30',
    endDate: '2025-04-01',
    colors: {
      primary: '45 100% 51%', // Golden
      secondary: '120 60% 50%', // Green
      accent: '30 100% 50%', // Orange
      glow: '45 100% 60%',
    },
    overlay: 'flowers',
    icons: ['leaf', 'sparkles'],
    bannerText: 'Ugadi Special New Year Reviews',
    bannerEmoji: '🌸',
    particles: { type: 'petals', count: 25 },
  },
  
  // April - Ramzan (approximate - varies yearly)
  {
    id: 'ramzan',
    name: 'Eid ul-Fitr',
    months: [3, 4],
    startDate: '2025-03-30',
    endDate: '2025-04-01',
    colors: {
      primary: '120 50% 40%', // Green
      secondary: '45 100% 51%', // Gold
      accent: '180 30% 50%', // Teal
      glow: '120 60% 50%',
    },
    overlay: 'crescent',
    icons: ['moon', 'star'],
    bannerText: 'Eid Mubarak Special Reviews',
    bannerEmoji: '🌙',
    particles: { type: 'stars', count: 20 },
  },
  
  // June - Bakrid (approximate - varies yearly)
  {
    id: 'bakrid',
    name: 'Eid ul-Adha',
    months: [6],
    startDate: '2025-06-06',
    endDate: '2025-06-08',
    colors: {
      primary: '120 50% 40%', // Green
      secondary: '45 100% 51%', // Gold
      accent: '180 30% 50%', // Teal
      glow: '120 60% 50%',
    },
    overlay: 'crescent',
    icons: ['moon', 'star'],
    bannerText: 'Eid Mubarak Special Reviews',
    bannerEmoji: '🌙',
    particles: { type: 'stars', count: 20 },
  },
  
  // August/September - Ganesh Chaturthi
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    months: [8, 9],
    startDate: '2025-08-27',
    endDate: '2025-09-06',
    colors: {
      primary: '30 100% 50%', // Orange
      secondary: '45 100% 51%', // Gold
      accent: '0 80% 50%', // Red
      glow: '30 100% 60%',
    },
    overlay: 'flowers',
    icons: ['elephant', 'lotus'],
    bannerText: 'Ganesh Chaturthi Special Reviews',
    bannerEmoji: '🐘',
    particles: { type: 'petals', count: 25 },
  },
  
  // October - Dussehra
  {
    id: 'dussehra',
    name: 'Dussehra',
    months: [10],
    startDate: '2025-10-02',
    endDate: '2025-10-03',
    colors: {
      primary: '0 80% 50%', // Red
      secondary: '45 100% 51%', // Gold
      accent: '30 100% 50%', // Orange
      glow: '0 100% 60%',
    },
    overlay: 'fireworks',
    icons: ['sword', 'crown'],
    bannerText: 'Dussehra Victory Special Reviews',
    bannerEmoji: '🏹',
    particles: { type: 'sparks', count: 20 },
  },
  
  // October - Halloween
  {
    id: 'halloween',
    name: 'Halloween',
    months: [10],
    startDate: '2025-10-29',
    endDate: '2025-11-01',
    colors: {
      primary: '30 100% 50%', // Orange
      secondary: '270 100% 30%', // Purple
      accent: '120 100% 25%', // Dark green
      glow: '30 100% 60%',
    },
    overlay: 'pumpkins',
    icons: ['pumpkin', 'ghost'],
    bannerText: 'Spooky Halloween Horror Reviews',
    bannerEmoji: '🎃',
    particles: { type: 'pumpkins', count: 15 },
  },
  
  // October/November - Diwali
  {
    id: 'diwali',
    name: 'Diwali',
    months: [10, 11],
    startDate: '2025-10-20',
    endDate: '2025-10-24',
    colors: {
      primary: '45 100% 51%', // Golden
      secondary: '30 100% 50%', // Orange
      accent: '0 80% 50%', // Deep red
      glow: '45 100% 65%',
    },
    overlay: 'diya-glow',
    icons: ['flame', 'sparkles'],
    bannerText: 'Diwali Special Movie Reviews',
    bannerEmoji: '🪔',
    particles: { type: 'diyas', count: 25 },
  },
  
  // December - Christmas
  {
    id: 'christmas',
    name: 'Christmas',
    months: [12],
    startDate: '2025-12-22',
    endDate: '2025-12-26',
    colors: {
      primary: '0 80% 45%', // Christmas red
      secondary: '120 60% 35%', // Christmas green
      accent: '45 100% 51%', // Gold
      glow: '0 100% 60%',
    },
    overlay: 'snow-sparkle',
    icons: ['tree', 'gift'],
    bannerText: 'Christmas Special Movie Reviews',
    bannerEmoji: '🎄',
    particles: { type: 'snowflakes', count: 30 },
  },
  
  // December/January - New Year
  {
    id: 'new-year',
    name: 'New Year',
    months: [12, 1],
    startDate: '2025-12-30',
    endDate: '2026-01-02',
    colors: {
      primary: '45 100% 51%', // Golden
      secondary: '210 100% 50%', // Blue
      accent: '300 100% 50%', // Magenta
      glow: '45 100% 70%',
    },
    overlay: 'fireworks',
    icons: ['party', 'champagne'],
    bannerText: 'New Year Special Reviews',
    bannerEmoji: '🎉',
    particles: { type: 'sparks', count: 35 },
  },
];

// Default cinematic theme (when no festival is active)
export const defaultTheme = {
  id: 'default',
  name: 'Cinematic',
  colors: {
    primary: '45 100% 51%', // Golden
    secondary: '0 0% 15%', // Dark
    accent: '45 100% 51%', // Golden
    glow: '45 100% 60%',
  },
  overlay: 'none' as const,
  bannerText: '',
  bannerEmoji: '',
  particles: { type: 'none' as const, count: 0 },
};
