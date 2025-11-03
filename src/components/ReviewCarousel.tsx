import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MovieReview } from "@/data/movieReviews";

interface ReviewCarouselProps {
  reviews: MovieReview[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Take first 9 reviews for the 3D rotation
  const carouselReviews = reviews.slice(0, 9);

  // Add CSS animation directly in component
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes rotate360 {
        from { transform: rotateY(0deg); }
        to { transform: rotateY(-360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Pause rotation on hover
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleMouseEnter = () => {
      carousel.style.animationPlayState = "paused";
    };
    const handleMouseLeave = () => {
      carousel.style.animationPlayState = "running";
    };

    carousel.addEventListener("mouseenter", handleMouseEnter);
    carousel.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      carousel.removeEventListener("mouseenter", handleMouseEnter);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[500px] py-16 bg-gray-100 text-white"
      style={{
        fontFamily: "sans-serif",
        background: "lightgray",
        color: "#fff",
      }}
    >
      <div
        className="relative w-[320px]"
        style={{ perspective: "1000px", margin: "100px auto" }}
      >
        <div
          ref={carouselRef}
          className="absolute w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            animation: "rotate360 60s linear infinite",
          }}
        >
          {carouselReviews.map((review, index) => {
            const angle = index * 40; // 360 / 9 faces
            return (
              <div
                key={review.id}
                className="absolute w-[300px] h-[187px] top-[20px] left-[10px] rounded-xl overflow-hidden shadow-lg cursor-pointer flex"
                style={{
                  backgroundImage: `url(${review.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `rotateY(${angle}deg) translateZ(430px)`,
                  boxShadow: "inset 0 0 0 2000px rgba(0,0,0,0.45)",
                }}
                onClick={() => navigate(`/review/${review.id}`)}
              >
                <div
                  className="m-auto text-center px-2"
                  style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
                >
                  <h3 className="text-lg font-bold mb-1">{review.title}</h3>
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

      <p className="mt-8 text-black text-sm">
        (Hover to pause — click on a review to open)
      </p>
    </div>
  );
};
