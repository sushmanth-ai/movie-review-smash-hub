import { useState, useEffect, useCallback, useMemo } from 'react';
import { festivalsConfig, defaultTheme, defaultSiteTheme, Festival, FestivalSiteTheme } from '@/data/festivalConfig';

interface FestivalState {
  activeFestival: Festival | null;
  isActive: boolean;
  decorationsEnabled: boolean;
  toggleDecorations: () => void;
  prefersReducedMotion: boolean;
}

const TIMEZONE = 'Asia/Kolkata';
const STORAGE_KEY = 'sm-reviews-decorations-enabled';

const getCurrentDateStrIST = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
};

const getActiveFestival = (): Festival | null => {
  const dateStr = getCurrentDateStrIST();
  for (const festival of festivalsConfig) {
    if (dateStr >= festival.startDate && dateStr <= festival.endDate) {
      return festival;
    }
  }
  return null;
};

// Apply full site theme by overriding CSS custom properties
const applySiteTheme = (theme: FestivalSiteTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
  root.style.setProperty('--card', theme.card);
  root.style.setProperty('--card-foreground', theme.cardForeground);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-foreground', theme.primaryForeground);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--secondary-foreground', theme.secondaryForeground);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-foreground', theme.accentForeground);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--muted-foreground', theme.mutedForeground);
};

const clearSiteTheme = () => {
  const root = document.documentElement;
  const props = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
    '--accent', '--accent-foreground', '--border', '--muted', '--muted-foreground'
  ];
  props.forEach(p => root.style.removeProperty(p));
};

export const useFestival = (): FestivalState => {
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [decorationsEnabled, setDecorationsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const checkFestival = () => {
      const festival = getActiveFestival();
      setActiveFestival(festival);

      // Apply festival colors as CSS variables
      const festColors = festival?.colors || defaultTheme.colors;
      document.documentElement.style.setProperty('--festival-primary', festColors.primary);
      document.documentElement.style.setProperty('--festival-secondary', festColors.secondary);
      document.documentElement.style.setProperty('--festival-accent', festColors.accent);
      document.documentElement.style.setProperty('--festival-glow', festColors.glow);

      // Full site theme override
      if (festival && decorationsEnabled) {
        document.documentElement.setAttribute('data-festival', festival.id);
        document.body.classList.add(festival.moodClass);
        applySiteTheme(festival.siteTheme);
      } else {
        document.documentElement.removeAttribute('data-festival');
        // Remove all mood classes
        document.body.className = document.body.className
          .split(' ')
          .filter(c => !c.startsWith('festival-'))
          .join(' ');
        clearSiteTheme();
      }
    };

    checkFestival();
    const interval = setInterval(checkFestival, 60 * 60 * 1000);
    return () => {
      clearInterval(interval);
      clearSiteTheme();
      document.documentElement.removeAttribute('data-festival');
    };
  }, [decorationsEnabled]);

  const toggleDecorations = useCallback(() => {
    setDecorationsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  return {
    activeFestival,
    isActive: !!activeFestival && decorationsEnabled,
    decorationsEnabled,
    toggleDecorations,
    prefersReducedMotion,
  };
};
