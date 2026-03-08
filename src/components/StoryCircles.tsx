import React, { useState, useRef, useEffect } from 'react';
import { MovieReview } from '@/data/movieReviews';
import { StoryViewer } from './StoryViewer';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryCirclesProps {
  reviews: MovieReview[];
}

export const StoryCircles: React.FC<StoryCirclesProps> = ({ reviews }) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);

  // Show first 10 reviews as stories
  const storyReviews = reviews.slice(0, 10);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setViewedStories(prev => new Set(prev).add(reviews[index].id));
  };

  const handleCloseStory = () => {
    if (activeStoryIndex !== null) {
      setViewedStories(prev => new Set(prev).add(reviews[activeStoryIndex].id));
    }
    setActiveStoryIndex(null);
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Auto-scroll carousel
  useEffect(() => {
    if (autoScrollPaused || storyReviews.length <= 3) return;
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 5;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 90, behavior: 'smooth' });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [autoScrollPaused, storyReviews.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [storyReviews.length]);

  if (reviews.length === 0) return null;

  return (
    <>
      <div className="relative group">
        <h3 className="text-sm font-bold text-primary/80 uppercase tracking-widest mb-3 px-1">
          📖 Quick Stories
        </h3>

        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy('left')}
            className="absolute left-0 top-1/2 translate-y-1 z-20 w-8 h-8 rounded-full bg-background/90 border border-primary/40 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy('right')}
            className="absolute right-0 top-1/2 translate-y-1 z-20 w-8 h-8 rounded-full bg-background/90 border border-primary/40 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseEnter={() => setAutoScrollPaused(true)}
          onMouseLeave={() => setAutoScrollPaused(false)}
          onTouchStart={() => setAutoScrollPaused(true)}
          onTouchEnd={() => setTimeout(() => setAutoScrollPaused(false), 4000)}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {storyReviews.map((review, index) => {
            const isViewed = viewedStories.has(review.id);
            return (
              <button
                key={review.id}
                onClick={() => handleOpenStory(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 group/item snap-start animate-fade-in"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
              >
                <div
                  className={cn(
                    "w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-500",
                    isViewed
                      ? "bg-muted-foreground/30"
                      : "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[pulse_3s_ease-in-out_infinite]"
                  )}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-background">
                    <img
                      src={review.image}
                      alt={review.title}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
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
