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

// Parse date string in YYYY-MM-DD format to Date object in IST
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at midnight IST
  const date = new Date(Date.UTC(year, month - 1, day, -5, -30)); // IST is UTC+5:30
  return date;
};

// Get current date in IST
const getCurrentDateIST = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
};

// Check if current date is within festival period
const isDateInRange = (current: Date, startStr: string, endStr: string): boolean => {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  
  // Set end to end of day
  end.setHours(23, 59, 59, 999);
  
  const currentDate = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  return currentDate >= startDate && currentDate <= endDate;
};

// Get active festival based on current date
const getActiveFestival = (): Festival | null => {
  const now = getCurrentDateIST();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Filter festivals that could be active this month
  const potentialFestivals = festivalsConfig.filter(festival => 
    festival.months.includes(currentMonth)
  );
  
  // Check each potential festival for exact date match
  for (const festival of potentialFestivals) {
    if (isDateInRange(now, festival.startDate, festival.endDate)) {
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
      
      // Apply CSS variables for active festival
      if (festival && decorationsEnabled) {
        document.documentElement.style.setProperty('--festival-primary', festival.colors.primary);
        document.documentElement.style.setProperty('--festival-secondary', festival.colors.secondary);
        document.documentElement.style.setProperty('--festival-accent', festival.colors.accent);
        document.documentElement.style.setProperty('--festival-glow', festival.colors.glow);
        document.documentElement.setAttribute('data-festival', festival.id);
      } else {
        document.documentElement.style.removeProperty('--festival-primary');
        document.documentElement.style.removeProperty('--festival-secondary');
        document.documentElement.style.removeProperty('--festival-accent');
        document.documentElement.style.removeProperty('--festival-glow');
        document.documentElement.removeAttribute('data-festival');
      }
    };
    
    checkFestival();
    
    // Check every hour for festival changes (in case user keeps page open)
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
