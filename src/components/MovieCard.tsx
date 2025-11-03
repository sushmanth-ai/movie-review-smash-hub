import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MovieReview } from '@/data/movieReviews';
import { ChevronRight } from 'lucide-react';

interface MovieCardProps {
  review: MovieReview;
}

export const MovieCard: React.FC<MovieCardProps> = ({ review }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/review/${review.id}`);
  };

  return (
    <Card
      className="bg-card border-2 border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)] h-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="text-center">
        <h3 className="text-xl font-bold text-primary">
          {review.title}
        </h3>
      </CardHeader>

      <div className="px-4 pb-4">
        <img
          src={review.image}
          alt={review.title}
          className="w-full h-64 object-cover rounded-lg border-2 border-primary/30"
        />
      </div>

      <CardContent className="pb-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <span className="font-bold text-sm">Click to read full review</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
};