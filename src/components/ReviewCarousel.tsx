import React, { useState, useEffect } from 'react';
import { MovieReview } from '@/data/movieReviews';

interface ReviewCarouselProps {
  reviews: MovieReview[];
  onReviewClick?: (review: MovieReview) => void;
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews, onReviewClick }) => {
  const [selectedIndex, setSelectedIndex] = useState(2); // Start with middle item
  
  // Take first 5 reviews for carousel
  const carouselReviews = reviews.slice(0, 5);

  // Auto-adjust selectedIndex when reviews change
  useEffect(() => {
    if (carouselReviews.length > 0 && selectedIndex >= carouselReviews.length) {
      setSelectedIndex(Math.min(2, carouselReviews.length - 1));
    }
  }, [carouselReviews.length, selectedIndex]);

  // Return early if no reviews
  if (carouselReviews.length === 0) {
    return (
      <div className="w-full py-12 px-4">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No reviews available yet</p>
        </div>
      </div>
    );
  }

  const getTransformClass = (index: number) => {
    const diff = (index - selectedIndex + 5) % 5;
    
    if (diff === 0) {
      return 'translate-x-0 translate-z-0 z-30 scale-100 opacity-100';
    } else if (diff === 1 || diff === -4) {
      return 'translate-x-[15%] -translate-z-[100px] z-20 scale-90 opacity-90';
    } else if (diff === 4 || diff === -1) {
      return 'translate-x-[-15%] -translate-z-[100px] z-20 scale-90 opacity-90';
    } else if (diff === 2 || diff === -3) {
      return 'translate-x-[30%] -translate-z-[200px] z-10 scale-75 opacity-60';
    } else {
      return 'translate-x-[-30%] -translate-z-[200px] z-10 scale-75 opacity-60';
    }
  };

  return (
    <div className="w-full py-12 px-4">
      <div className="relative h-[35vw] max-h-[500px] min-h-[300px]" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
        {carouselReviews.map((review, index) => (
          <div
            key={review.id}
            className={`absolute left-0 right-0 mx-auto w-[60%] h-full rounded-lg cursor-pointer transition-all duration-500 ease-out ${getTransformClass(index)}`}
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: index === selectedIndex 
                ? '0 13px 25px 0 rgba(255, 215, 0, 0.3), 0 11px 7px 0 rgba(0, 0, 0, 0.19)'
                : '0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)'
            }}
            onClick={() => {
              setSelectedIndex(index);
              if (onReviewClick) {
                onReviewClick(review);
              }
            }}
          >
            <div className="relative w-full h-full overflow-hidden rounded-lg border-2 border-primary">
              <img
                src={review.image}
                alt={review.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-4">
                <h3 className="text-primary font-bold text-xl line-clamp-2">{review.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Number(review.rating) ? 'text-primary' : 'text-muted'}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center gap-3 mt-8">
        {carouselReviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-primary w-8' 
                : 'bg-muted hover:bg-primary/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
