import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewsFeed, NewsItem } from '@/hooks/useNewsFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_IMAGE = '/placeholder.svg';

const NewsCard = ({ item, onClick }: { item: NewsItem; onClick: () => void }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = item.image && item.image.length > 10 && !imgError;

  return (
    <div
      className="snap-start h-[calc(100dvh-4rem)] md:h-screen w-full flex-shrink-0 relative cursor-pointer"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-background to-primary/10 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-32" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 z-10 space-y-3">
        {/* Source badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/90 text-primary-foreground uppercase tracking-wider">
          {item.source}
        </span>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight line-clamp-3 drop-shadow-lg">
          {item.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
          {item.description.slice(0, 120)}
          {item.description.length > 120 ? '...' : ''}
        </p>

        {/* Date */}
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <Clock className="w-3 h-3" />
          <span>{format(new Date(item.pubDate), 'MMM dd, yyyy • hh:mm a')}</span>
        </div>

        {/* Tap hint */}
        <p className="text-center text-white/40 text-xs mt-2 animate-pulse">
          Tap to read full article
        </p>
      </div>

      {/* Scroll indicators */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white/30">
        <ChevronUp className="w-5 h-5 animate-bounce" />
        <div className="w-1 h-16 bg-white/10 rounded-full" />
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="snap-start h-[calc(100dvh-4rem)] md:h-screen w-full flex-shrink-0 relative bg-background">
    <Skeleton className="absolute inset-0" />
    <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 space-y-3">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-40" />
    </div>
  </div>
);

const NewsFeed = () => {
  const { news, isLoading, error, refetch } = useNewsFeed();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const openArticle = useCallback((item: NewsItem) => {
    navigate(`/news/${encodeURIComponent(item.id)}`, { state: { article: item } });
  }, [navigate]);

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-screen w-full bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-lg font-bold text-white tracking-wide">
          🎬 <span className="text-primary">Tollywood</span> News
        </h1>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Scrollable feed */}
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading && news.length === 0 ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : error && news.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/60 gap-4 p-8">
            <p className="text-lg">Failed to load news</p>
            <p className="text-sm">{error}</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
              Retry
            </button>
          </div>
        ) : (
          news.map((item) => (
            <NewsCard key={item.id} item={item} onClick={() => openArticle(item)} />
          ))
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
