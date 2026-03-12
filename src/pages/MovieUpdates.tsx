import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMovieUpdates, getCategoryInfo, MovieUpdate } from '@/hooks/useMovieUpdates';
import { Heart, Share2, Eye, Clock, ChevronRight, Play, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const BREAKING_KEYWORDS = ['trailer', 'teaser', 'first look', 'release date', 'box office', 'review', 'breaking'];

const isBreaking = (title: string, category: string) => {
  const lower = title.toLowerCase();
  return category === 'breaking-news' || BREAKING_KEYWORDS.some(k => lower.includes(k));
};

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const getYoutubeThumbnail = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

// Hero Card for the latest/featured update
const HeroCard: React.FC<{
  update: MovieUpdate;
  onLike: (id: string) => void;
  onView: (id: string) => void;
}> = ({ update, onLike, onView }) => {
  const [liked, setLiked] = useState(() => !!localStorage.getItem(`update_liked_${update.id}`));
  const [imgError, setImgError] = useState(false);
  const { toast } = useToast();
  const catInfo = getCategoryInfo(update.category);
  const ref = useRef<HTMLDivElement>(null);
  const breaking = isBreaking(update.title, update.category);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onView(update.id);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [update.id, onView]);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    onLike(update.id);
  };

  const handleShare = async () => {
    const text = `${catInfo.emoji} ${update.movieName}: ${update.title}\n\n${update.description || ''}\n\n— SM Reviews`;
    if (navigator.share) {
      try { await navigator.share({ title: update.title, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Update link copied to clipboard' });
    }
  };

  const bgImage = update.imageUrl && !imgError ? update.imageUrl : 
    (update.videoUrl ? getYoutubeThumbnail(update.videoUrl) : null);

  return (
    <div ref={ref} className="relative w-full rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
      {/* Background */}
      <div className="relative h-[50vh] md:h-[60vh]">
        {bgImage ? (
          <>
            <img 
              src={bgImage} 
              alt={update.title} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary flex items-center justify-center">
            <span className="text-8xl opacity-30">🎬</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>
        )}

        {/* Breaking badge */}
        {breaking && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-destructive text-destructive-foreground font-bold text-xs px-3 py-1 animate-pulse border-0">
              🔥 BREAKING UPDATE
            </Badge>
          </div>
        )}

        {/* Video play indicator */}
        {update.type === 'video' && update.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10">
          <Badge className="mb-3 bg-primary/80 text-primary-foreground border-0 text-xs font-bold px-3 py-1">
            {catInfo.emoji} {catInfo.label}
          </Badge>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">
            {update.movieName}
          </p>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-2">
            {update.title}
          </h1>
          {update.description && (
            <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-xl mb-4">
              {update.description}
            </p>
          )}

          {/* Meta + Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(update.createdAt, { addSuffix: true })}
            </span>
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {update.views} views
            </span>
            <div className="flex-1" />
            <button onClick={handleLike} className="flex items-center gap-1.5 group">
              <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-destructive text-destructive' : 'text-white/70 group-hover:text-destructive'}`} />
              <span className="text-white/70 text-xs font-semibold">{update.likes}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 group">
              <Share2 className="w-5 h-5 text-white/70 group-hover:text-primary transition-colors" />
              <span className="text-white/70 text-xs font-semibold">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// News Card for regular updates
const NewsCard: React.FC<{
  update: MovieUpdate;
  onLike: (id: string) => void;
  onView: (id: string) => void;
}> = ({ update, onLike, onView }) => {
  const [liked, setLiked] = useState(() => !!localStorage.getItem(`update_liked_${update.id}`));
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const catInfo = getCategoryInfo(update.category);
  const ref = useRef<HTMLDivElement>(null);
  const breaking = isBreaking(update.title, update.category);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onView(update.id);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [update.id, onView]);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    onLike(update.id);
  };

  const handleShare = async () => {
    const text = `${catInfo.emoji} ${update.movieName}: ${update.title}\n— SM Reviews`;
    if (navigator.share) {
      try { await navigator.share({ title: update.title, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!' });
    }
  };

  const thumbnail = update.imageUrl && !imgError ? update.imageUrl :
    (update.videoUrl ? getYoutubeThumbnail(update.videoUrl) : null);

  const embedUrl = expanded && update.type === 'video' && update.videoUrl ? getYoutubeEmbedUrl(update.videoUrl) : null;

  return (
    <div ref={ref} className="bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group">
      {/* Image / Video section */}
      {thumbnail && !expanded ? (
        <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => update.type === 'video' && setExpanded(true)}>
          <img 
            src={thumbnail} 
            alt={update.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {breaking && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold text-[10px] px-2 py-0.5 border-0">
              🔥 Breaking
            </Badge>
          )}
          {update.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              </div>
            </div>
          )}
          <Badge className="absolute bottom-3 left-3 bg-black/60 text-white border-0 text-[10px] px-2 py-0.5 backdrop-blur-sm">
            {catInfo.emoji} {catInfo.label}
          </Badge>
        </div>
      ) : embedUrl ? (
        <div className="aspect-video">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
        </div>
      ) : !thumbnail && (
        <div className="p-4 pb-0">
          {breaking && (
            <Badge className="bg-destructive text-destructive-foreground font-bold text-[10px] px-2 py-0.5 border-0 mb-2">
              🔥 Breaking
            </Badge>
          )}
          <Badge className="bg-primary/20 text-primary border-0 text-[10px] px-2 py-0.5">
            {catInfo.emoji} {catInfo.label}
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">
          {update.movieName}
        </p>
        <h3 className="font-bold text-foreground text-sm md:text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {update.title}
        </h3>
        {update.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
            {update.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(update.createdAt, { addSuffix: true })}
            </span>
            <span className="text-muted-foreground text-[10px] flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {update.views}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLike} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
              <Heart className={`w-4 h-4 ${liked ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'}`} />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
              <Share2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieUpdates: React.FC = () => {
  const { updates, loading, likeUpdate, trackView } = useMovieUpdates(30);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Skeleton className="w-full h-[50vh] rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-7xl">🎬</span>
        <h2 className="text-xl font-bold text-foreground">No Updates Yet</h2>
        <p className="text-muted-foreground text-center text-sm">Movie updates will appear here once published by the admin.</p>
      </div>
    );
  }

  const [heroUpdate, ...restUpdates] = updates;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <h1 className="text-lg font-extrabold text-foreground tracking-tight">
            🎬 Movie Updates
          </h1>
          <p className="text-muted-foreground text-[10px] tracking-wide">Latest Tollywood news & updates</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-3xl space-y-6">
        {/* Hero Card */}
        {heroUpdate && (
          <HeroCard update={heroUpdate} onLike={likeUpdate} onView={trackView} />
        )}

        {/* Updates Grid */}
        {restUpdates.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Latest Updates</h2>
              <span className="text-muted-foreground text-[10px]">{updates.length} updates</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restUpdates.map((update) => (
                <NewsCard key={update.id} update={update} onLike={likeUpdate} onView={trackView} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieUpdates;
