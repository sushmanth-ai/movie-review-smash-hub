import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieReview } from '@/data/movieReviews';
import { ChevronRight, Eye, Star } from 'lucide-react';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import { FestivalBadge } from '@/components/festival';
import { useLanguage } from '@/i18n/LanguageContext';

interface MovieCardProps {
  review: MovieReview;
}

export const MovieCard: React.FC<MovieCardProps> = ({ review }) => {
  const navigate = useNavigate();
  const { trackReviewView } = useFirebaseOperations();
  const { t } = useLanguage();

  const handleCardClick = () => {
    trackReviewView(review.id);
    navigate(`/review/${review.id}`);
  };

  // Extract rating number
  const ratingMatch = review.rating?.match(/[\d.]+/);
  const ratingNum = ratingMatch ? parseFloat(ratingMatch[0]) : 0;

  return (
    <div
      className="group relative cursor-pointer h-full"
      onClick={handleCardClick}
    >
      {/* Outer glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/40 group-hover:via-yellow-500/50 group-hover:to-primary/40 rounded-2xl blur-md transition-all duration-500 opacity-0 group-hover:opacity-100" />
      
      <div className="relative bg-card rounded-2xl overflow-hidden border border-primary/30 group-hover:border-primary/60 transition-all duration-500 h-full flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_8px_40px_rgba(255,215,0,0.25)]">
        
        {/* Image Section with overlay */}
        <div className="relative overflow-hidden">
          <img
            src={review.image}
            alt={review.title}
            className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <FestivalBadge className="festival-badge" />
            {/* Rating badge */}
            {ratingNum > 0 && (
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-primary/40">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-xs font-black text-primary">{ratingNum}</span>
              </div>
            )}
          </div>
          
          {/* Views badge - bottom left */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Eye className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold text-primary">{review.views || 0} {t('views')}</span>
          </div>

          {/* Shimmer sweep on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300">
            {review.title}
          </h3>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-3" />

          {/* Bottom bar */}
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {review.rating}
            </span>
            <div className="flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all duration-300">
              <span>{t('readMore')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
