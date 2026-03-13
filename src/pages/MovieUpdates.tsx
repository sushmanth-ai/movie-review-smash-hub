import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMovieUpdates, getCategoryInfo, MovieUpdate } from '@/hooks/useMovieUpdates';
import { Heart, MessageCircle, Share2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const GRADIENT_THEMES = [
  'from-red-900 via-red-800 to-orange-900',
  'from-purple-900 via-indigo-900 to-blue-900',
  'from-emerald-900 via-teal-900 to-cyan-900',
  'from-amber-900 via-orange-900 to-red-900',
  'from-slate-900 via-zinc-900 to-neutral-900',
  'from-rose-900 via-pink-900 to-fuchsia-900',
];

const UpdateCard: React.FC<{
  update: MovieUpdate;
  index: number;
  onLike: (id: string) => void;
  onView: (id: string) => void;
}> = ({ update, index, onLike, onView }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(() => !!localStorage.getItem(`update_liked_${update.id}`));
  const { toast } = useToast();
  const catInfo = getCategoryInfo(update.category);
  const gradient = GRADIENT_THEMES[index % GRADIENT_THEMES.length];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onView(update.id);
    }, { threshold: 0.6 });
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
      toast({ title: 'Copied!', description: 'Update copied to clipboard' });
    }
  };

  const embedUrl = update.videoUrl ? getYoutubeEmbedUrl(update.videoUrl) : null;

  return (
    <div ref={ref} className="h-screen w-full snap-start snap-always relative flex-shrink-0">
      {/* Background */}
      {update.type === 'image' && update.imageUrl ? (
        <div className="absolute inset-0">
          <img src={update.imageUrl} alt={update.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
      )}

      {/* Video embed */}
      {update.type === 'video' && embedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <iframe src={embedUrl} className="w-full h-[60vh] max-w-2xl" allowFullScreen allow="autoplay; encrypted-media" />
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 pb-24 md:pb-8 z-10">
        {/* Category badge */}
        <Badge className="self-start mb-3 bg-primary/90 text-primary-foreground border-0 text-xs font-bold px-3 py-1">
          {catInfo.emoji} {catInfo.label}
        </Badge>

        {/* Movie name */}
        <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-1">{update.movieName}</p>

        {/* Title */}
        <h2 className={`font-extrabold text-white leading-tight mb-2 ${update.type === 'text' ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>
          {update.title}
        </h2>

        {/* Description */}
        {update.description && (
          <p className="text-white/80 text-sm md:text-base line-clamp-3 mb-3 max-w-lg">{update.description}</p>
        )}

        {/* Time */}
        <p className="text-white/50 text-xs">{formatDistanceToNow(update.createdAt, { addSuffix: true })}</p>
      </div>

      {/* Right action buttons */}
      <div className="absolute right-4 bottom-32 md:bottom-16 flex flex-col items-center gap-5 z-20">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${liked ? 'bg-red-500 scale-110' : 'bg-white/10 group-hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 ${liked ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-bold">{update.likes + (liked && !localStorage.getItem(`update_liked_${update.id}`) ? 0 : 0)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold">{update.comments}</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold">Share</span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center">
            <Eye className="w-5 h-5 text-white/60" />
          </div>
          <span className="text-white/60 text-xs">{update.views}</span>
        </div>
      </div>

      {/* Scroll hint (first card only) */}
      {index === 0 && (
        <div className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/40" />
        </div>
      )}
    </div>
  );
};

const MovieUpdates: React.FC = () => {
  const { updates, loading, likeUpdate, trackView } = useMovieUpdates(25);

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="w-full max-w-md h-12 rounded-xl" />
        <Skeleton className="w-3/4 max-w-sm h-8 rounded-lg" />
        <Skeleton className="w-full max-w-md h-64 rounded-2xl" />
        <p className="text-muted-foreground text-sm animate-pulse">Loading updates...</p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-6xl">🎬</p>
        <h2 className="text-xl font-bold text-foreground">No Updates Yet</h2>
        <p className="text-muted-foreground text-center">Movie updates will appear here once the admin publishes them.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {updates.map((update, i) => (
        <UpdateCard key={update.id} update={update} index={i} onLike={likeUpdate} onView={trackView} />
      ))}
    </div>
  );
};

export default MovieUpdates;
