import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MovieReview } from '@/data/movieReviews';
import { ChevronRight, Eye } from 'lucide-react';
import { useFirebaseOperations } from '@/hooks/useFirebaseOperations';
import { FestivalBadge } from '@/components/festival';

interface MovieCardProps {
  review: MovieReview;
}

export const MovieCard: React.FC<MovieCardProps> = ({ review }) => {
  const navigate = useNavigate();
  const { trackReviewView } = useFirebaseOperations();

  const handleCardClick = () => {
    trackReviewView(review.id);
    navigate(`/review/${review.id}`);
  };

  return (
    <Card
      className="bg-card border-2 border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)] h-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] cursor-pointer festival-enhanced"
      onClick={handleCardClick}
    >
      <CardHeader className="text-center relative pb-2">
        <FestivalBadge className="absolute top-2 right-2 festival-badge z-10" />
        <div className="relative mx-2">
          {/* Gradient Container for Title */}
          <div className="relative bg-gradient-to-r from-yellow-500/20 via-amber-400/30 to-yellow-500/20 rounded-xl p-3 border border-primary/40 shadow-[0_0_20px_rgba(255,215,0,0.3)] overflow-hidden">
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-festival-shimmer" />
            
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary rounded-br-lg" />
            
            {/* Title with gradient text */}
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] relative z-10 line-clamp-2">
              {review.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <div className="px-4 pb-4">
        <img
          src={review.image}
          alt={review.title}
          className="w-full h-64 object-cover rounded-lg border-2 border-primary/30"
        />
      </div>

      <CardContent className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Eye className="w-4 h-4" />
            <span className="font-bold text-sm">{review.views || 0} views</span>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="font-bold text-sm">Read more</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
