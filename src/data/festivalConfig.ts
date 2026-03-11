// Festival Configuration - Automatic date-based festival detection system
// All dates are based on Asia/Kolkata timezone
// Updated for 2026 calendar

export interface FestivalSiteTheme {
  /** Override CSS design tokens for full-site theming */
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
}

export interface FestivalTheme {
  gradient: {
    from: string;
    via?: string;
    to: string;
  };
  particles: string[];
  particleCount: number;
  glowColor: string;
  overlayOpacity: number;
}

export interface Festival {
  id: string;
  name: string;
  months: number[];
  startDate: string;
  endDate: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  theme: FestivalTheme;
  siteTheme: FestivalSiteTheme;
  bannerText: string;
  bannerEmoji: string;
  /** Unique animated emojis/symbols that float around */
  floatingEmojis: string[];
  /** CSS class for body-level mood animation */
  moodClass: string;
}

export const festivalsConfig: Festival[] = [
  // Sankranti — warm orange-yellow harvest mood
  {
    id: 'sankranti',
    name: 'Makar Sankranti',
    months: [1],
    startDate: '2026-01-13',
    endDate: '2026-01-16',
    colors: {
      primary: '35 100% 55%',
      secondary: '45 100% 60%',
      accent: '195 90% 60%',
      glow: '40 100% 65%',
    },
    theme: {
      gradient: { from: '25 80% 12%', via: '35 70% 15%', to: '45 60% 10%' },
      particles: ['🪁', '☀️', '✦'],
      particleCount: 18,
      glowColor: '40 100% 65%',
      overlayOpacity: 0.06,
    },
    siteTheme: {
      background: '25 40% 6%',
      foreground: '40 100% 60%',
      card: '25 30% 10%',
      cardForeground: '40 100% 60%',
      primary: '35 100% 55%',
      primaryForeground: '0 0% 0%',
      secondary: '25 50% 18%',
      secondaryForeground: '40 100% 70%',
      accent: '195 80% 45%',
      accentForeground: '0 0% 100%',
      border: '35 60% 25%',
      muted: '25 20% 15%',
      mutedForeground: '40 40% 60%',
    },
    bannerText: '🪁 Sankranti Special Movie Reviews',
    bannerEmoji: '🪁',
    floatingEmojis: ['🪁', '☀️', '🌾', '✨', '🔥'],
    moodClass: 'festival-sankranti',
  },

  // Republic Day — tricolor patriotic
  {
    id: 'republic-day',
    name: 'Republic Day',
    months: [1],
    startDate: '2026-01-25',
    endDate: '2026-01-27',
    colors: {
      primary: '25 100% 50%',
      secondary: '0 0% 98%',
      accent: '145 70% 40%',
      glow: '25 100% 60%',
    },
    theme: {
      gradient: { from: '25 80% 12%', via: '0 0% 15%', to: '145 50% 10%' },
      particles: ['🇮🇳', '★', '✦'],
      particleCount: 14,
      glowColor: '25 100% 55%',
      overlayOpacity: 0.04,
    },
    siteTheme: {
      background: '220 30% 6%',
      foreground: '25 100% 55%',
      card: '220 20% 10%',
      cardForeground: '25 100% 55%',
      primary: '25 100% 50%',
      primaryForeground: '0 0% 0%',
      secondary: '145 40% 18%',
      secondaryForeground: '0 0% 95%',
      accent: '145 70% 40%',
      accentForeground: '0 0% 100%',
      border: '25 50% 25%',
      muted: '220 15% 15%',
      mutedForeground: '25 40% 60%',
    },
    bannerText: '🇮🇳 Republic Day Special Reviews',
    bannerEmoji: '🇮🇳',
    floatingEmojis: ['🇮🇳', '🏛️', '⭐', '🪖'],
    moodClass: 'festival-republic',
  },

  // Valentine's Day — romantic deep pink/red
  {
    id: 'valentines',
    name: "Valentine's Day",
    months: [2],
    startDate: '2026-02-12',
    endDate: '2026-02-15',
    colors: {
      primary: '340 82% 52%',
      secondary: '330 100% 71%',
      accent: '0 100% 67%',
      glow: '340 100% 60%',
    },
    theme: {
      gradient: { from: '340 60% 10%', via: '350 50% 15%', to: '330 40% 8%' },
      particles: ['💕', '♥️', '💗', '✨'],
      particleCount: 22,
      glowColor: '340 100% 65%',
      overlayOpacity: 0.06,
    },
    siteTheme: {
      background: '340 30% 5%',
      foreground: '340 90% 70%',
      card: '340 25% 10%',
      cardForeground: '340 90% 70%',
      primary: '340 82% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '350 50% 18%',
      secondaryForeground: '340 100% 80%',
      accent: '0 90% 60%',
      accentForeground: '0 0% 100%',
      border: '340 50% 25%',
      muted: '340 20% 15%',
      mutedForeground: '340 40% 60%',
    },
    bannerText: '💕 Valentine Special Romance Reviews',
    bannerEmoji: '💕',
    floatingEmojis: ['💕', '❤️', '💗', '🌹', '💝', '♥️'],
    moodClass: 'festival-valentine',
  },

  // Mahashivaratri — deep mystical blue
  {
    id: 'mahashivaratri',
    name: 'Mahashivaratri',
    months: [2],
    startDate: '2026-02-15',
    endDate: '2026-02-16',
    colors: {
      primary: '240 60% 45%',
      secondary: '220 80% 40%',
      accent: '45 100% 51%',
      glow: '240 70% 50%',
    },
    theme: {
      gradient: { from: '240 50% 8%', via: '220 60% 12%', to: '250 40% 6%' },
      particles: ['🔱', '☽', '✧', '💧'],
      particleCount: 16,
      glowColor: '220 80% 60%',
      overlayOpacity: 0.06,
    },
    siteTheme: {
      background: '240 40% 5%',
      foreground: '220 80% 65%',
      card: '240 30% 10%',
      cardForeground: '220 80% 65%',
      primary: '220 80% 50%',
      primaryForeground: '0 0% 100%',
      secondary: '240 40% 18%',
      secondaryForeground: '45 100% 70%',
      accent: '45 100% 51%',
      accentForeground: '0 0% 0%',
      border: '240 40% 25%',
      muted: '240 20% 15%',
      mutedForeground: '220 40% 55%',
    },
    bannerText: '🔱 Shivaratri Special Reviews',
    bannerEmoji: '🔱',
    floatingEmojis: ['🔱', '🌙', '💧', '✨', '🐍'],
    moodClass: 'festival-shiva',
  },

  // Holi — explosion of colors
  {
    id: 'holi',
    name: 'Holi',
    months: [3],
    startDate: '2026-03-03',
    endDate: '2026-03-05',
    colors: {
      primary: '280 100% 60%',
      secondary: '180 100% 50%',
      accent: '60 100% 50%',
      glow: '300 100% 60%',
    },
    theme: {
      gradient: { from: '280 60% 10%', via: '320 50% 12%', to: '40 50% 10%' },
      particles: ['🟣', '🔵', '🟡', '🟢', '🔴', '🟠'],
      particleCount: 30,
      glowColor: '300 100% 65%',
      overlayOpacity: 0.07,
    },
    siteTheme: {
      background: '280 30% 5%',
      foreground: '60 100% 65%',
      card: '280 25% 10%',
      cardForeground: '60 100% 65%',
      primary: '280 100% 60%',
      primaryForeground: '0 0% 100%',
      secondary: '180 60% 18%',
      secondaryForeground: '180 100% 70%',
      accent: '60 100% 50%',
      accentForeground: '0 0% 0%',
      border: '300 50% 30%',
      muted: '280 20% 15%',
      mutedForeground: '300 40% 60%',
    },
    bannerText: '🎨 Holi Special Colorful Reviews!',
    bannerEmoji: '🎨',
    floatingEmojis: ['🟣', '🔵', '🟡', '🟢', '🔴', '💜', '💛', '💚'],
    moodClass: 'festival-holi',
  },

  // Ugadi — fresh spring green-gold
  {
    id: 'ugadi',
    name: 'Ugadi',
    months: [3],
    startDate: '2026-03-19',
    endDate: '2026-03-21',
    colors: {
      primary: '80 70% 45%',
      secondary: '120 60% 50%',
      accent: '45 100% 50%',
      glow: '80 70% 55%',
    },
    theme: {
      gradient: { from: '120 40% 8%', via: '80 50% 12%', to: '45 40% 10%' },
      particles: ['🌸', '🌿', '✿', '🍃'],
      particleCount: 20,
      glowColor: '80 70% 55%',
      overlayOpacity: 0.05,
    },
    siteTheme: {
      background: '120 25% 5%',
      foreground: '80 80% 55%',
      card: '120 20% 9%',
      cardForeground: '80 80% 55%',
      primary: '80 70% 45%',
      primaryForeground: '0 0% 0%',
      secondary: '120 40% 18%',
      secondaryForeground: '80 80% 70%',
      accent: '45 100% 50%',
      accentForeground: '0 0% 0%',
      border: '80 40% 25%',
      muted: '120 15% 15%',
      mutedForeground: '80 30% 55%',
    },
    bannerText: '🌸 Ugadi Special New Year Reviews',
    bannerEmoji: '🌸',
    floatingEmojis: ['🌸', '🌿', '🍃', '✨', '🌺', '🥭'],
    moodClass: 'festival-ugadi',
  },

  // Ramzan/Eid — elegant gold on deep green/blue
  {
    id: 'ramzan',
    name: 'Eid ul-Fitr',
    months: [3],
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    colors: {
      primary: '45 100% 51%',
      secondary: '160 60% 35%',
      accent: '180 40% 45%',
      glow: '45 100% 55%',
    },
    theme: {
      gradient: { from: '160 40% 6%', via: '180 30% 10%', to: '220 30% 8%' },
      particles: ['🌙', '⭐', '✨', '🕌'],
      particleCount: 16,
      glowColor: '45 100% 60%',
      overlayOpacity: 0.05,
    },
    siteTheme: {
      background: '160 30% 5%',
      foreground: '45 100% 60%',
      card: '160 25% 9%',
      cardForeground: '45 100% 60%',
      primary: '45 100% 51%',
      primaryForeground: '0 0% 0%',
      secondary: '160 40% 18%',
      secondaryForeground: '45 100% 70%',
      accent: '160 60% 35%',
      accentForeground: '0 0% 100%',
      border: '45 50% 25%',
      muted: '160 15% 15%',
      mutedForeground: '45 30% 55%',
    },
    bannerText: '🌙 Eid Mubarak Special Reviews',
    bannerEmoji: '🌙',
    floatingEmojis: ['🌙', '⭐', '✨', '🕌', '🌟'],
    moodClass: 'festival-eid',
  },

  // Independence Day — patriotic saffron/white/green
  {
    id: 'independence-day',
    name: 'Independence Day',
    months: [8],
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    colors: {
      primary: '25 100% 50%',
      secondary: '0 0% 98%',
      accent: '145 70% 40%',
      glow: '25 100% 60%',
    },
    theme: {
      gradient: { from: '25 70% 10%', via: '0 0% 15%', to: '145 40% 8%' },
      particles: ['🇮🇳', '🎆', '⭐', '🪖'],
      particleCount: 16,
      glowColor: '25 100% 55%',
      overlayOpacity: 0.04,
    },
    siteTheme: {
      background: '220 25% 6%',
      foreground: '25 100% 55%',
      card: '220 20% 10%',
      cardForeground: '25 100% 55%',
      primary: '25 100% 50%',
      primaryForeground: '0 0% 0%',
      secondary: '145 40% 18%',
      secondaryForeground: '0 0% 95%',
      accent: '145 70% 40%',
      accentForeground: '0 0% 100%',
      border: '25 50% 25%',
      muted: '220 15% 15%',
      mutedForeground: '25 40% 60%',
    },
    bannerText: '🇮🇳 Independence Day Special Reviews',
    bannerEmoji: '🇮🇳',
    floatingEmojis: ['🇮🇳', '🎆', '⭐', '🪖', '🏛️'],
    moodClass: 'festival-republic',
  },

  // Ganesh Chaturthi — warm orange/vermillion
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    months: [8, 9],
    startDate: '2026-08-17',
    endDate: '2026-08-27',
    colors: {
      primary: '20 100% 55%',
      secondary: '45 100% 51%',
      accent: '0 80% 50%',
      glow: '30 100% 60%',
    },
    theme: {
      gradient: { from: '20 60% 8%', via: '35 50% 12%', to: '0 40% 8%' },
      particles: ['🐘', '🪔', '🌺', '✨'],
      particleCount: 18,
      glowColor: '30 100% 60%',
      overlayOpacity: 0.05,
    },
    siteTheme: {
      background: '20 30% 6%',
      foreground: '30 100% 60%',
      card: '20 25% 10%',
      cardForeground: '30 100% 60%',
      primary: '20 100% 55%',
      primaryForeground: '0 0% 0%',
      secondary: '0 50% 18%',
      secondaryForeground: '45 100% 70%',
      accent: '45 100% 51%',
      accentForeground: '0 0% 0%',
      border: '20 50% 25%',
      muted: '20 15% 15%',
      mutedForeground: '30 40% 55%',
    },
    bannerText: '🐘 Ganesh Chaturthi Special Reviews',
    bannerEmoji: '🐘',
    floatingEmojis: ['🐘', '🪔', '🌺', '✨', '🍬', '🌸'],
    moodClass: 'festival-ganesh',
  },

  // Dussehra — fiery red-gold victory
  {
    id: 'dussehra',
    name: 'Dussehra',
    months: [10],
    startDate: '2026-10-19',
    endDate: '2026-10-21',
    colors: {
      primary: '0 80% 50%',
      secondary: '45 100% 51%',
      accent: '30 100% 50%',
      glow: '0 100% 60%',
    },
    theme: {
      gradient: { from: '0 50% 8%', via: '20 50% 12%', to: '45 40% 10%' },
      particles: ['🏹', '🔥', '✦', '⚔️'],
      particleCount: 18,
      glowColor: '15 100% 60%',
      overlayOpacity: 0.05,
    },
    siteTheme: {
      background: '0 25% 6%',
      foreground: '0 90% 60%',
      card: '0 20% 10%',
      cardForeground: '0 90% 60%',
      primary: '0 80% 50%',
      primaryForeground: '0 0% 100%',
      secondary: '45 50% 18%',
      secondaryForeground: '45 100% 70%',
      accent: '45 100% 51%',
      accentForeground: '0 0% 0%',
      border: '0 50% 25%',
      muted: '0 15% 15%',
      mutedForeground: '0 30% 55%',
    },
    bannerText: '🏹 Dussehra Victory Special Reviews',
    bannerEmoji: '🏹',
    floatingEmojis: ['🏹', '🔥', '⚔️', '✨', '🪔'],
    moodClass: 'festival-dussehra',
  },

  // Diwali — magical gold/purple/warm glow
  {
    id: 'diwali',
    name: 'Diwali',
    months: [11],
    startDate: '2026-11-06',
    endDate: '2026-11-10',
    colors: {
      primary: '45 100% 55%',
      secondary: '275 80% 45%',
      accent: '30 100% 50%',
      glow: '45 100% 70%',
    },
    theme: {
      gradient: { from: '275 50% 8%', via: '300 40% 12%', to: '45 60% 12%' },
      particles: ['🪔', '🎆', '✨', '🎇', '💫'],
      particleCount: 28,
      glowColor: '45 100% 70%',
      overlayOpacity: 0.07,
    },
    siteTheme: {
      background: '275 25% 5%',
      foreground: '45 100% 65%',
      card: '275 20% 9%',
      cardForeground: '45 100% 65%',
      primary: '45 100% 55%',
      primaryForeground: '0 0% 0%',
      secondary: '275 50% 20%',
      secondaryForeground: '45 100% 75%',
      accent: '275 80% 50%',
      accentForeground: '0 0% 100%',
      border: '45 60% 25%',
      muted: '275 15% 15%',
      mutedForeground: '45 40% 55%',
    },
    bannerText: '🪔 Diwali Special Movie Reviews!',
    bannerEmoji: '🪔',
    floatingEmojis: ['🪔', '🎆', '✨', '🎇', '💫', '🧨', '🌟'],
    moodClass: 'festival-diwali',
  },

  // Christmas — cozy red/green/gold
  {
    id: 'christmas',
    name: 'Christmas',
    months: [12],
    startDate: '2026-12-22',
    endDate: '2026-12-26',
    colors: {
      primary: '0 80% 45%',
      secondary: '145 70% 30%',
      accent: '45 100% 51%',
      glow: '0 100% 60%',
    },
    theme: {
      gradient: { from: '145 40% 6%', via: '150 30% 10%', to: '0 50% 10%' },
      particles: ['🎄', '❄️', '⭐', '🎅', '🎁'],
      particleCount: 24,
      glowColor: '0 80% 55%',
      overlayOpacity: 0.05,
    },
    siteTheme: {
      background: '145 20% 5%',
      foreground: '0 80% 60%',
      card: '145 15% 9%',
      cardForeground: '0 80% 60%',
      primary: '0 80% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '145 50% 18%',
      secondaryForeground: '145 70% 70%',
      accent: '45 100% 51%',
      accentForeground: '0 0% 0%',
      border: '0 40% 25%',
      muted: '145 10% 15%',
      mutedForeground: '0 30% 55%',
    },
    bannerText: '🎄 Christmas Special Movie Reviews!',
    bannerEmoji: '🎄',
    floatingEmojis: ['🎄', '❄️', '⭐', '🎅', '🎁', '🦌', '🔔'],
    moodClass: 'festival-christmas',
  },

  // New Year — celebratory gold/blue
  {
    id: 'new-year',
    name: 'New Year',
    months: [12, 1],
    startDate: '2026-12-30',
    endDate: '2027-01-03',
    colors: {
      primary: '45 100% 55%',
      secondary: '220 100% 55%',
      accent: '280 100% 55%',
      glow: '45 100% 70%',
    },
    theme: {
      gradient: { from: '220 50% 8%', via: '260 40% 10%', to: '45 50% 12%' },
      particles: ['🎉', '🥂', '✨', '🎊', '🎆'],
      particleCount: 28,
      glowColor: '45 100% 75%',
      overlayOpacity: 0.06,
    },
    siteTheme: {
      background: '220 25% 5%',
      foreground: '45 100% 65%',
      card: '220 20% 9%',
      cardForeground: '45 100% 65%',
      primary: '45 100% 55%',
      primaryForeground: '0 0% 0%',
      secondary: '220 50% 20%',
      secondaryForeground: '45 100% 75%',
      accent: '280 80% 55%',
      accentForeground: '0 0% 100%',
      border: '45 50% 25%',
      muted: '220 15% 15%',
      mutedForeground: '45 30% 55%',
    },
    bannerText: '🎉 New Year Special Reviews!',
    bannerEmoji: '🎉',
    floatingEmojis: ['🎉', '🥂', '✨', '🎊', '🎆', '🌟', '🍾'],
    moodClass: 'festival-newyear',
  },
];

// Default cinematic theme (when no festival is active)
export const defaultTheme = {
  id: 'default',
  name: 'Cinematic',
  colors: {
    primary: '45 100% 51%',
    secondary: '0 0% 15%',
    accent: '45 100% 51%',
    glow: '45 100% 60%',
  },
  theme: {
    gradient: { from: '0 0% 7%', to: '0 0% 10%' },
    particles: [] as string[],
    particleCount: 0,
    glowColor: '45 100% 60%',
    overlayOpacity: 0,
  },
  bannerText: '',
  bannerEmoji: '',
};

// Default site theme (no festival)
export const defaultSiteTheme: FestivalSiteTheme = {
  background: '0 0% 5%',
  foreground: '42 100% 55%',
  card: '0 5% 9%',
  cardForeground: '42 100% 55%',
  primary: '42 100% 50%',
  primaryForeground: '0 0% 0%',
  secondary: '0 60% 18%',
  secondaryForeground: '42 100% 70%',
  accent: '0 75% 45%',
  accentForeground: '42 100% 90%',
  border: '0 60% 30%',
  muted: '0 15% 15%',
  mutedForeground: '42 30% 65%',
};
