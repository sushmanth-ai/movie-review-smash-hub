// Festival Configuration - Automatic date-based festival detection system
// All dates are based on Asia/Kolkata timezone

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
  months: number[]; // 1-12 for January-December
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  theme: FestivalTheme;
  bannerText: string;
  bannerEmoji: string;
}

// Premium festival themes with cinematic aesthetics
export const festivalsConfig: Festival[] = [
  // January - Sankranti
  {
    id: 'sankranti',
    name: 'Makar Sankranti',
    months: [1],
    startDate: '2025-01-13',
    endDate: '2025-01-15',
    colors: {
      primary: '35 100% 55%',
      secondary: '45 100% 60%',
      accent: '195 90% 60%',
      glow: '40 100% 65%',
    },
    theme: {
      gradient: {
        from: '35 100% 55%',
        via: '45 100% 50%',
        to: '195 90% 60%',
      },
      particles: ['◇', '✦', '◈'],
      particleCount: 15,
      glowColor: '40 100% 65%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Sankranti Special Movie Reviews',
    bannerEmoji: '🪁',
  },

  // January 26 - Republic Day
  {
    id: 'republic-day',
    name: 'Republic Day',
    months: [1],
    startDate: '2025-01-25',
    endDate: '2025-01-27',
    colors: {
      primary: '25 100% 50%',
      secondary: '0 0% 98%',
      accent: '145 70% 40%',
      glow: '25 100% 60%',
    },
    theme: {
      gradient: {
        from: '25 100% 50%',
        via: '0 0% 95%',
        to: '145 70% 40%',
      },
      particles: ['✦', '◆', '★'],
      particleCount: 12,
      glowColor: '25 100% 55%',
      overlayOpacity: 0.03,
    },
    bannerText: 'Republic Day Special Reviews',
    bannerEmoji: '🇮🇳',
  },

  // February - Mahashivaratri
  {
    id: 'mahashivaratri',
    name: 'Mahashivaratri',
    months: [2],
    startDate: '2025-02-26',
    endDate: '2025-02-27',
    colors: {
      primary: '240 60% 25%',
      secondary: '220 80% 40%',
      accent: '45 100% 51%',
      glow: '240 70% 50%',
    },
    theme: {
      gradient: {
        from: '240 60% 15%',
        via: '220 70% 25%',
        to: '240 60% 20%',
      },
      particles: ['☽', '✧', '✦'],
      particleCount: 18,
      glowColor: '220 80% 60%',
      overlayOpacity: 0.05,
    },
    bannerText: 'Shivaratri Special Reviews',
    bannerEmoji: '🔱',
  },

  // February - Valentine's Day
  {
    id: 'valentines',
    name: "Valentine's Day",
    months: [2],
    startDate: '2025-02-12',
    endDate: '2025-02-15',
    colors: {
      primary: '340 82% 52%',
      secondary: '330 100% 71%',
      accent: '0 100% 67%',
      glow: '340 100% 60%',
    },
    theme: {
      gradient: {
        from: '340 70% 45%',
        via: '350 80% 60%',
        to: '330 90% 50%',
      },
      particles: ['♡', '✦', '◇'],
      particleCount: 20,
      glowColor: '340 100% 65%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Valentine Special Romance Reviews',
    bannerEmoji: '💕',
  },

  // March - Holi
  {
    id: 'holi',
    name: 'Holi',
    months: [3],
    startDate: '2025-03-13',
    endDate: '2025-03-15',
    colors: {
      primary: '280 100% 50%',
      secondary: '180 100% 50%',
      accent: '60 100% 50%',
      glow: '300 100% 60%',
    },
    theme: {
      gradient: {
        from: '280 80% 50%',
        via: '320 70% 55%',
        to: '40 90% 55%',
      },
      particles: ['●', '◉', '○'],
      particleCount: 25,
      glowColor: '300 100% 65%',
      overlayOpacity: 0.05,
    },
    bannerText: 'Holi Special Colorful Reviews',
    bannerEmoji: '🎨',
  },

  // April - Ugadi
  {
    id: 'ugadi',
    name: 'Ugadi',
    months: [3, 4],
    startDate: '2025-03-30',
    endDate: '2025-04-01',
    colors: {
      primary: '45 100% 51%',
      secondary: '120 60% 50%',
      accent: '30 100% 50%',
      glow: '45 100% 60%',
    },
    theme: {
      gradient: {
        from: '120 50% 40%',
        via: '80 60% 45%',
        to: '45 80% 50%',
      },
      particles: ['❀', '✿', '✦'],
      particleCount: 18,
      glowColor: '80 70% 55%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Ugadi Special New Year Reviews',
    bannerEmoji: '🌸',
  },

  // April - Ramzan
  {
    id: 'ramzan',
    name: 'Eid ul-Fitr',
    months: [3, 4],
    startDate: '2025-03-30',
    endDate: '2025-04-01',
    colors: {
      primary: '160 60% 35%',
      secondary: '45 100% 51%',
      accent: '180 40% 45%',
      glow: '45 100% 55%',
    },
    theme: {
      gradient: {
        from: '220 60% 20%',
        via: '180 50% 30%',
        to: '160 60% 25%',
      },
      particles: ['☽', '✦', '✧'],
      particleCount: 15,
      glowColor: '45 100% 60%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Eid Mubarak Special Reviews',
    bannerEmoji: '🌙',
  },

  // June - Bakrid
  {
    id: 'bakrid',
    name: 'Eid ul-Adha',
    months: [6],
    startDate: '2025-06-06',
    endDate: '2025-06-08',
    colors: {
      primary: '160 60% 35%',
      secondary: '45 100% 51%',
      accent: '180 40% 45%',
      glow: '45 100% 55%',
    },
    theme: {
      gradient: {
        from: '220 60% 20%',
        via: '180 50% 30%',
        to: '160 60% 25%',
      },
      particles: ['☽', '✦', '✧'],
      particleCount: 15,
      glowColor: '45 100% 60%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Eid Mubarak Special Reviews',
    bannerEmoji: '🌙',
  },

  // August 15 - Independence Day
  {
    id: 'independence-day',
    name: 'Independence Day',
    months: [8],
    startDate: '2025-08-14',
    endDate: '2025-08-16',
    colors: {
      primary: '25 100% 50%',
      secondary: '0 0% 98%',
      accent: '145 70% 40%',
      glow: '25 100% 60%',
    },
    theme: {
      gradient: {
        from: '25 100% 50%',
        via: '0 0% 95%',
        to: '145 70% 40%',
      },
      particles: ['★', '✦', '◆'],
      particleCount: 15,
      glowColor: '25 100% 55%',
      overlayOpacity: 0.03,
    },
    bannerText: 'Independence Day Special Reviews',
    bannerEmoji: '🇮🇳',
  },

  // August/September - Ganesh Chaturthi
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    months: [8, 9],
    startDate: '2025-08-27',
    endDate: '2025-09-06',
    colors: {
      primary: '20 100% 55%',
      secondary: '45 100% 51%',
      accent: '0 80% 50%',
      glow: '30 100% 60%',
    },
    theme: {
      gradient: {
        from: '20 90% 50%',
        via: '35 85% 55%',
        to: '45 100% 50%',
      },
      particles: ['❀', '✿', '✦'],
      particleCount: 20,
      glowColor: '35 100% 60%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Ganesh Chaturthi Special Reviews',
    bannerEmoji: '🐘',
  },

  // October - Dussehra
  {
    id: 'dussehra',
    name: 'Dussehra',
    months: [10],
    startDate: '2025-10-02',
    endDate: '2025-10-03',
    colors: {
      primary: '0 80% 50%',
      secondary: '45 100% 51%',
      accent: '30 100% 50%',
      glow: '0 100% 60%',
    },
    theme: {
      gradient: {
        from: '0 70% 45%',
        via: '20 80% 50%',
        to: '45 90% 50%',
      },
      particles: ['✧', '◈', '✦'],
      particleCount: 18,
      glowColor: '15 100% 60%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Dussehra Victory Special Reviews',
    bannerEmoji: '🏹',
  },

  // October - Halloween
  {
    id: 'halloween',
    name: 'Halloween',
    months: [10],
    startDate: '2025-10-29',
    endDate: '2025-11-01',
    colors: {
      primary: '30 100% 50%',
      secondary: '270 100% 30%',
      accent: '120 100% 25%',
      glow: '30 100% 60%',
    },
    theme: {
      gradient: {
        from: '270 80% 20%',
        via: '280 70% 25%',
        to: '30 90% 45%',
      },
      particles: ['◈', '✧', '●'],
      particleCount: 15,
      glowColor: '30 100% 55%',
      overlayOpacity: 0.05,
    },
    bannerText: 'Spooky Halloween Horror Reviews',
    bannerEmoji: '🎃',
  },

  // October/November - Diwali
  {
    id: 'diwali',
    name: 'Diwali',
    months: [10, 11],
    startDate: '2025-10-20',
    endDate: '2025-10-24',
    colors: {
      primary: '45 100% 51%',
      secondary: '30 100% 50%',
      accent: '275 80% 45%',
      glow: '45 100% 65%',
    },
    theme: {
      gradient: {
        from: '275 70% 25%',
        via: '300 60% 30%',
        to: '45 90% 50%',
      },
      particles: ['✦', '◉', '✧'],
      particleCount: 25,
      glowColor: '45 100% 70%',
      overlayOpacity: 0.05,
    },
    bannerText: 'Diwali Special Movie Reviews',
    bannerEmoji: '🪔',
  },

  // December - Christmas
  {
    id: 'christmas',
    name: 'Christmas',
    months: [12],
    startDate: '2025-12-22',
    endDate: '2025-12-26',
    colors: {
      primary: '0 80% 45%',
      secondary: '145 70% 30%',
      accent: '45 100% 51%',
      glow: '0 100% 60%',
    },
    theme: {
      gradient: {
        from: '145 60% 20%',
        via: '150 50% 25%',
        to: '0 70% 40%',
      },
      particles: ['❄', '✦', '◇'],
      particleCount: 25,
      glowColor: '0 80% 55%',
      overlayOpacity: 0.04,
    },
    bannerText: 'Christmas Special Movie Reviews',
    bannerEmoji: '🎄',
  },

  // December/January - New Year 2026
  {
    id: 'new-year',
    name: 'New Year',
    months: [12, 1],
    startDate: '2025-12-30',
    endDate: '2026-01-03',
    colors: {
      primary: '45 100% 51%',
      secondary: '220 100% 55%',
      accent: '280 100% 55%',
      glow: '45 100% 70%',
    },
    theme: {
      gradient: {
        from: '220 70% 20%',
        via: '260 60% 25%',
        to: '45 80% 45%',
      },
      particles: ['✦', '✧', '◆'],
      particleCount: 30,
      glowColor: '45 100% 75%',
      overlayOpacity: 0.05,
    },
    bannerText: 'New Year Special Reviews',
    bannerEmoji: '🎉',
  },

  // December/January - New Year 2027
  {
    id: 'new-year-2027',
    name: 'New Year',
    months: [12, 1],
    startDate: '2026-12-30',
    endDate: '2027-01-03',
    colors: {
      primary: '45 100% 51%',
      secondary: '220 100% 55%',
      accent: '280 100% 55%',
      glow: '45 100% 70%',
    },
    theme: {
      gradient: {
        from: '220 70% 20%',
        via: '260 60% 25%',
        to: '45 80% 45%',
      },
      particles: ['✦', '✧', '◆'],
      particleCount: 30,
      glowColor: '45 100% 75%',
      overlayOpacity: 0.05,
    },
    bannerText: 'New Year Special Reviews',
    bannerEmoji: '🎉',
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
    gradient: {
      from: '0 0% 7%',
      to: '0 0% 10%',
    },
    particles: [] as string[],
    particleCount: 0,
    glowColor: '45 100% 60%',
    overlayOpacity: 0,
  },
  bannerText: '',
  bannerEmoji: '',
};
