import React, { useState, useRef } from 'react';

import { MovieReview } from '@/data/movieReviews';
import { StoryViewer } from './StoryViewer';
import { cn } from '@/lib/utils';

interface StoryCirclesProps {
  reviews: MovieReview[];
}

export const StoryCircles: React.FC<StoryCirclesProps> = ({ reviews }) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setViewedStories(prev => new Set(prev).add(reviews[index].id));
  };

  const handleCloseStory = () => {
    if (activeStoryIndex !== null) {
      // Mark current story as viewed
      setViewedStories(prev => new Set(prev).add(reviews[activeStoryIndex].id));
    }
    setActiveStoryIndex(null);
  };

  if (reviews.length === 0) return null;

  // Show first 10 reviews as stories
  const storyReviews = reviews.slice(0, 10);

  return (
    <>
      <div className="relative">
        <h3 className="text-sm font-bold text-primary/80 uppercase tracking-widest mb-3 px-1">
          📖 Quick Stories
        </h3>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {storyReviews.map((review, index) => {
            const isViewed = viewedStories.has(review.id);
            return (
              <button
                key={review.id}
                onClick={() => handleOpenStory(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div
                  className={cn(
                    "w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-300",
                    isViewed
                      ? "bg-muted-foreground/30"
                      : "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  )}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-background">
                    <img
                      src={review.image}
                      alt={review.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-foreground/70 font-medium w-[72px] truncate text-center">
                  {review.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeStoryIndex !== null && (
        <StoryViewer
          reviews={storyReviews}
          initialIndex={activeStoryIndex}
          onClose={handleCloseStory}
        />
      )}
    </>
  );
};
