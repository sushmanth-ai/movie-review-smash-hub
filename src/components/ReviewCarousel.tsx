import React from "react";
import { useNavigate } from "react-router-dom";
import { MovieReview } from "@/data/movieReviews";

interface ReviewCarouselProps {
  reviews: MovieReview[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
  const navigate = useNavigate();

  // Take first 9 reviews to fill the 3D rotation (like your example)
  const carouselReviews = reviews.slice(0, 9);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[500px] py-16 bg-gray-100 text-white">
      <div className="container relative w-[320px] perspective-[1000px]">
        <div
          className="carousel absolute w-full h-full animate-[rotate360_60s_linear_infinite]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {carouselReviews.map((review, index) => {
            const angle = index * 40; // 9 faces → 360/9 = 40°
            return (
              <div
                key={review.id}
                className="carousel__face absolute w-[300px] h-[187px] top-[20px] left-[10px] rounded-xl overflow-hidden shadow-lg cursor-pointer flex"
                style={{
                  backgroundImage: `url(${review.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `rotateY(${angle}deg) translateZ(430px)`,
                  boxShadow: "inset 0 0 0 2000px rgba(0,0,0,0.45)",
                }}
                onClick={() => navigate(`/review/${review.id}`)}
              >
                <div className="m-auto text-center px-2">
                  <h3 className="text-xl font-bold mb-1 drop-shadow-lg">
                    {review.title}
                  </h3>
                  <div className="flex justify-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Number(review.rating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
