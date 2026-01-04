import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingReviewData } from '@/hooks/useTrendingReviews';
import { Eye, Heart, MessageCircle, Flame, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface TrendingReviewsProps {
  reviews: TrendingReviewData[];
  isLoading: boolean;
}
const RankBadge: React.FC<{
  rank: number;
}> = ({
  rank
}) => {
  const getBadgeStyle = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-yellow-950 shadow-[0_0_20px_rgba(255,215,0,0.6)]';
      case 2:
        return 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-slate-950 shadow-[0_0_15px_rgba(200,200,200,0.5)]';
      case 3:
        return 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-amber-100 shadow-[0_0_15px_rgba(180,120,60,0.5)]';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  return <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10 ${getBadgeStyle()}`}>
      #{rank}
    </div>;
};
const TrendingCard: React.FC<{
  review: TrendingReviewData;
}> = ({
  review
}) => {
  const navigate = useNavigate();
  return <div onClick={() => navigate(`/review/${review.reviewId}`)} className={`
        relative group cursor-pointer
        bg-card/80 backdrop-blur-sm border rounded-xl overflow-hidden
        transition-all duration-300 hover:scale-[1.02]
        ${review.rank <= 3 ? 'border-primary shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:shadow-[0_0_35px_rgba(255,215,0,0.5)]' : 'border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]'}
      `}>
      <RankBadge rank={review.rank} />
      
      {/* Fire badge for top 3 */}
      {review.rank <= 3 && <div className="absolute top-2 right-2 z-10">
          <Flame className={`w-6 h-6 animate-pulse ${review.rank === 1 ? 'text-orange-500' : review.rank === 2 ? 'text-yellow-500' : 'text-amber-600'}`} fill="currentColor" />
        </div>}

      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={review.image} alt={review.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
          <div>
            <h4 className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {review.title}
            </h4>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-primary font-semibold">{review.trendingScore}</span>
              <span>points</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{review.weeklyViews}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{review.weeklyLikes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{review.weeklyComments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient bar for top 3 */}
      {review.rank <= 3 && <div className={`h-1 ${review.rank === 1 ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' : review.rank === 2 ? 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500' : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700'}`} />}
    </div>;
};
const TrendingSkeleton: React.FC = () => <div className="flex gap-3 p-3 bg-card/50 rounded-xl border border-border">
    <Skeleton className="w-20 h-28 rounded-lg flex-shrink-0" />
    <div className="flex flex-col justify-between flex-1 py-1">
      <div>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>;
export const TrendingReviews: React.FC<TrendingReviewsProps> = ({
  reviews,
  isLoading
}) => {
  if (isLoading) {
    return <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-7 h-7 text-orange-500" fill="currentColor" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Trending This Week
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <TrendingSkeleton key={i} />)}
        </div>
      </section>;
  }
  if (reviews.length === 0) {
    return null;
  }
  return <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" fill="currentColor" />
            <Flame className="w-8 h-8 text-yellow-500 absolute top-0 left-0 opacity-50 animate-ping" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Trending Reviews</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on views, likes & engagement
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">Live</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map(review => <TrendingCard key={review.reviewId} review={review} />)}
      </div>

      {/* Formula legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground opacity-60">
        <span>Score = Views×1 + Likes×3 + Comments×5 + Reactions×2</span>
      </div>
    </section>;
};