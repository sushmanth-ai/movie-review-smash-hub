import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MovieReview } from '@/data/movieReviews';
import { ChevronRight } from 'lucide-react';
interface MovieCardProps {
  review: MovieReview;
}

export const MovieCard: React.FC<MovieCardProps> = ({ review }) => {
  const navigate = useNavigate();
  return (
    <Card 
      className="bg-card border-2 border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)] h-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] cursor-pointer"
      onClick={() => navigate(`/review/${review.id}`)}
    >
      <CardHeader className="text-center">
        <h3 className="text-xl font-bold text-primary">
          {review.title}
        </h3>
      </CardHeader>

      <div className="px-4">
        <img 
          src={review.image} 
          alt={review.title} 
          className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-primary/30" 
        />
      </div>

      <CardContent className="space-y-2">
        <p className="text-muted-foreground text-sm line-clamp-3">{review.review}</p>
        
        <div className="flex items-center justify-center gap-2 text-primary pt-2">
          <span className="font-bold text-sm">Click to read full review</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </CardContent>

      <CardFooter className="bg-primary text-primary-foreground rounded-b-lg">
        <div className="w-full">
          <h4 className="text-lg font-bold mb-2 mt-1 text-center">SM RATING</h4>
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded-md font-bold bg-background text-primary border-2 border-primary min-w-[60px] text-center">
              {review.rating}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};