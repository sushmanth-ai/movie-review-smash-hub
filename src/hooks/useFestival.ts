import { useState, useEffect, useCallback, useMemo } from 'react';
import { festivalsConfig, defaultTheme, Festival } from '@/data/festivalConfig';

interface FestivalState {
  activeFestival: Festival | null;
  isActive: boolean;
  decorationsEnabled: boolean;
  toggleDecorations: () => void;
  prefersReducedMotion: boolean;
}

const TIMEZONE = 'Asia/Kolkata';
const STORAGE_KEY = 'sm-reviews-decorations-enabled';

// Get current date string in IST timezone (YYYY-MM-DD)
const getCurrentDateStrIST = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
};

// Get active festival based on current date
const getActiveFestival = (): Festival | null => {
  const dateStr = getCurrentDateStrIST();
  
  for (const festival of festivalsConfig) {
    if (dateStr >= festival.startDate && dateStr <= festival.endDate) {
      return festival;
    }
  }
  
  return null;
};

export const useFestival = (): FestivalState => {
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [decorationsEnabled, setDecorationsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });
  
  // Detect reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Check for active festival
  useEffect(() => {
    const checkFestival = () => {
      const festival = getActiveFestival();
      setActiveFestival(festival);
      
      const theme = festival?.colors || defaultTheme.colors;
      
      // Apply CSS variables
      document.documentElement.style.setProperty('--festival-primary', theme.primary);
      document.documentElement.style.setProperty('--festival-secondary', theme.secondary);
      document.documentElement.style.setProperty('--festival-accent', theme.accent);
      document.documentElement.style.setProperty('--festival-glow', theme.glow);
      
      if (festival && decorationsEnabled) {
        document.documentElement.setAttribute('data-festival', festival.id);
      } else {
        document.documentElement.removeAttribute('data-festival');
      }
    };
    
    checkFestival();
    
    // Check every hour for festival changes
    const interval = setInterval(checkFestival, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
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
