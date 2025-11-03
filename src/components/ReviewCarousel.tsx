import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MovieReview } from "@/data/movieReviews";

interface ReviewCarouselProps {
  reviews: MovieReview[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Take first 9 reviews for rotation
  const carouselReviews = reviews.slice(0, 9);

  // Inject keyframes dynamically
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

    const handleMouseEnter = () => (carousel.style.animationPlayState = "paused");
    const handleMouseLeave = () => (carousel.style.animationPlayState = "running");

    carousel.addEventListener("mouseenter", handleMouseEnter);
    carousel.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      carousel.removeEventListener("mouseenter", handleMouseEnter);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Responsive depth
  const getTranslateZ = () => {
    if (window.innerWidth < 480) return 180;
    if (window.innerWidth < 768) return 280;
    return 430;
  };

  const translateZ = getTranslateZ();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] py-12 overflow-hidden"
      style={{
        background: "transparent",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        className="relative mx-auto w-[85vw] max-w-[320px]"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={carouselRef}
          className="absolute w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            animation: "rotate360 55s linear infinite",
          }}
        >
          {carouselReviews.map((review, index) => {
            const angle = index * 40; // 360/9
            return (
              <div
                key={review.id}
                className="absolute w-[85vw] max-w-[280px] h-[180px] sm:w-[300px] sm:h-[187px] rounded-xl overflow-hidden cursor-pointer flex transition-transform duration-500"
                style={{
                  backgroundImage: `url(${review.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                  boxShadow: "inset 0 0 0 2000px rgba(0,0,0,0.45)",
                }}
                onClick={() => navigate(`/review/${review.id}`)}
              >
                <div
                  className="m-auto text-center px-2"
                  style={{
                    textShadow: "1px 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  <h3 className="text-base sm:text-lg font-bold mb-1">
                    {review.title}
                  </h3>
                  <div className="flex justify-center gap-1 text-yellow-400 text-sm sm:text-base">
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

      <p className="mt-6 text-gray-300 text-xs sm:text-sm">
        (Tap or hover to pause • Tap image to open review)
      </p>
    </div>
  );
};
