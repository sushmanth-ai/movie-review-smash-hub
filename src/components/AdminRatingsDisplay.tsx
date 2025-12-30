import React from 'react';
import { Star } from 'lucide-react';
import { AdminRatings, calculateAdminOverall } from '@/types/ratings';
interface AdminRatingsDisplayProps {
  adminRatings?: AdminRatings;
  adminOverall?: number;
  legacyRating?: string;
  compact?: boolean;
}
const RATING_CATEGORIES: {
  key: keyof AdminRatings;
  label: string;
  emoji: string;
}[] = [{
  key: 'story',
  label: 'Story',
  emoji: '📖'
}, {
  key: 'acting',
  label: 'Acting',
  emoji: '🎭'
}, {
  key: 'music',
  label: 'Music',
  emoji: '🎵'
}, {
  key: 'direction',
  label: 'Direction',
  emoji: '🎬'
}, {
  key: 'cinematography',
  label: 'Cinematography',
  emoji: '📷'
}, {
  key: 'rewatchValue',
  label: 'Rewatch Value',
  emoji: '🔄'
}];
export const AdminRatingsDisplay: React.FC<AdminRatingsDisplayProps> = ({
  adminRatings,
  adminOverall,
  legacyRating,
  compact = false
}) => {
  // Calculate overall if not provided
  const overallRating = adminOverall || (adminRatings ? calculateAdminOverall(adminRatings) : null);

  // Parse legacy rating if no admin ratings
  const parsedLegacyRating = legacyRating ? parseFloat(legacyRating.match(/[\d.]+/)?.[0] || '0') : null;
  const displayOverall = overallRating || parsedLegacyRating || 0;
  const renderStars = (value: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`${starSize} ${star <= value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />)}
      </div>;
  };
  if (compact) {
    return <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg p-3 border border-primary/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary uppercase">🎬 Critic</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">{displayOverall}</span>
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
          </div>
        </div>
      </div>;
  }
  return <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg p-4 border border-primary/30">
      <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">🎬 CRITIC RATING</h4>
      
      {adminRatings ? <div className="grid grid-cols-2 gap-2 mb-4">
          {RATING_CATEGORIES.map(({
        key,
        label,
        emoji
      }) => <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{emoji} {label}</span>
              <div className="flex items-center gap-1">
                {renderStars(adminRatings[key])}
                <span className="text-primary font-bold ml-1">{adminRatings[key]}</span>
              </div>
            </div>)}
        </div> : null}
      
      {/* Overall Score */}
      <div className="flex items-center justify-between pt-3 border-t border-primary/20">
        <span className="text-sm font-bold text-primary">SM RATING:</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary">{displayOverall}</span>
          <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
        </div>
      </div>
    </div>;
};