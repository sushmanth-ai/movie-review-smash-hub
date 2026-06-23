import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewsFeed, NewsItem } from '@/hooks/useNewsFeed';
import { useNewsViewsBatch } from '@/hooks/useNewsViews';
import { db } from '@/utils/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Clock, ChevronUp, ChevronDown, Share2, Eye, Flame, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NewsCard = ({ 
  item, 
  onClick, 
  views,
  onVisible 
}: { 
  item: NewsItem; 
  onClick: () => void; 
  views: number;
  onVisible: () => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasImage = item.image && item.image.length > 10 && !imgError;

  // Track visibility for view counting
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, isVisible]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🎬 ${item.title}`,
          text: `${item.description.slice(0, 100)}...`,
          url: window.location.origin + `/news/${encodeURIComponent(item.id)}`,
        });
      } catch {}
    }
  };

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <div
      ref={cardRef}
      className="snap-start h-[calc(100dvh-4rem)] md:h-screen w-full flex-shrink-0 relative cursor-pointer group"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-background to-primary/10 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-32" />
      </div>

      {/* Breaking Badge */}
      {item.isBreaking && (
        <div className="absolute top-16 left-4 z-20 animate-pulse">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg shadow-red-600/30">
            <Flame className="w-3.5 h-3.5" />
            <span>{item.breakingTag || 'BREAKING'}</span>
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className="absolute right-3 bottom-40 z-20 flex flex-col items-center gap-5">
        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/80 text-[10px] font-semibold">{views > 0 ? views : '—'}</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <span className="text-white/80 text-[10px] font-semibold">Share</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-14 p-5 pb-8 z-10 space-y-2.5">
        {/* Source badge */}
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-primary/90 text-primary-foreground uppercase tracking-wider">
          {item.source}
        </span>

        {/* Title */}
        <h2 className="text-lg md:text-xl font-extrabold text-white leading-tight line-clamp-3 drop-shadow-lg">
          {item.title}
        </h2>

        {/* Description */}
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
          {item.description.slice(0, 120)}
          {item.description.length > 120 ? '...' : ''}
        </p>

        {/* Time + Read More */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1 text-primary text-xs font-bold">
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Scroll indicators */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-white/20 pointer-events-none">
        <ChevronUp className="w-4 h-4 animate-bounce" />
        <div className="w-0.5 h-10 bg-white/10 rounded-full" />
        <ChevronDown className="w-4 h-4 animate-bounce" />
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
  
  const newsIds = news.map((n) => n.id);
  const viewsMap = useNewsViewsBatch(newsIds);

  const trackView = useCallback(async (id: string) => {
    if (!db) return;
    const cacheKey = `sm_news_viewed_${id}`;
    if (sessionStorage.getItem(cacheKey)) return;
    try {
      const docRef = doc(db, 'news_views', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await setDoc(docRef, { count: increment(1) }, { merge: true });
      } else {
        await setDoc(docRef, { count: 1 });
      }
      sessionStorage.setItem(cacheKey, '1');
    } catch {}
  }, []);

  const openArticle = useCallback((item: NewsItem) => {
    navigate(`/news/${encodeURIComponent(item.id)}`, { state: { article: item } });
  }, [navigate]);

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-screen w-full bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent">
        <h1 className="text-base font-bold text-white tracking-wide">
          🎬 <span className="text-primary">Tollywood</span> Updates
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
            <p className="text-lg">Failed to load updates</p>
            <p className="text-sm">{error}</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
              Retry
            </button>
          </div>
        ) : (
          news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onClick={() => openArticle(item)}
              views={viewsMap[item.id] || 0}
              onVisible={() => trackView(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
