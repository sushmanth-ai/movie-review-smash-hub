import React from 'react';
import { Sparkles, SparklesIcon } from 'lucide-react';
import { useFestivalContext } from './FestivalContext';
import { Button } from '@/components/ui/button';
export const FestivalToggle: React.FC = () => {
  const {
    activeFestival,
    decorationsEnabled,
    toggleDecorations
  } = useFestivalContext();

  // Only show toggle when there's an active festival
  if (!activeFestival) {
    return null;
  }
  return <Button variant="outline" size="sm" onClick={toggleDecorations} className={`
        fixed bottom-4 right-4 z-50
        bg-card/90 backdrop-blur-sm
        border-primary/50
        hover:border-primary
        transition-all duration-300
        ${decorationsEnabled ? 'shadow-[0_0_15px_hsl(var(--primary)/0.3)]' : ''}
      `} title={decorationsEnabled ? 'Disable festival decorations' : 'Enable festival decorations'}>
      {decorationsEnabled ? <Sparkles className="w-4 h-4 text-primary mr-2" /> : <SparklesIcon className="w-4 h-4 text-muted-foreground mr-2" />}
      <span className="text-xs hidden sm:inline">
        {decorationsEnabled ? 'Decorations On' : 'Decorations Off'}
      </span>
    </Button>;
};