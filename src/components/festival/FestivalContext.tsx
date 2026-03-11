import React, { createContext, useContext, ReactNode } from 'react';
import { useFestival } from '@/hooks/useFestival';
import { Festival } from '@/data/festivalConfig';

interface FestivalContextType {
  activeFestival: Festival | null;
  isActive: boolean;
  decorationsEnabled: boolean;
  toggleDecorations: () => void;
  prefersReducedMotion: boolean;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const festivalState = useFestival();
  
  return (
    <FestivalContext.Provider value={festivalState}>
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestivalContext = (): FestivalContextType => {
  const context = useContext(FestivalContext);
  if (context === undefined) {
    throw new Error('useFestivalContext must be used within a FestivalProvider');
  }
  return context;
};
