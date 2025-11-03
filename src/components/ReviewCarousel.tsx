import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MovieReview } from "@/data/movieReviews";

interface ReviewCarouselProps {
  reviews: MovieReview[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // You can use all reviews or slice a few
  const carouselReviews = reviews.slice(0, 8); // up to 8 looks clean for 360°

  // Calculate the angle for even spacing (360° / number of items)
  const angleStep = 360 / carouselReviews.length;

  // Rotate carousel automatically
  useEffect(() => {
    const rotateNext = () => {
      setRotation((prev) => prev - angleStep);
    };

    const startAutoplay = () => {
      intervalRef.current = setInterval(rotateNext, 2500);
    };
    startAutoplay();

    const stopAutoplay = () => intervalRef.current && clearInterval(intervalRef.current);

    const carouselElement = carouselRef.current;
    carouselElement?.addEventListener("mouseenter", stopAutoplay);
    carouselElement?.addEventListener("mouseleave", startAutoplay);

    return () => {
      stopAutoplay();
      carouselElement?.removeEventListener("mouseenter", stopAutoplay);
      carouselElement?.removeEventListener("mouseleave", startAutoplay);
    };
  }, [angleStep]);

  return (
    <div className="flex flex-col items-center justify-center w-full py-16 bg-transparent">
      {/* 3D carousel container */}
      <div className="relative w-[250px] h-[200px] perspective-[1000px]">
        <div
          ref={carouselRef}
          className="absolute w-full h-full transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {carouselReviews.map((review, index) => (
            <div
              key={review.id}
              className="absolute w-[250px] h-[200px] rounded-2xl overflow-hidden text-white text-center text-5xl font-bold cursor-pointer shadow-lg"
              style={{
                transform: `rotateY(${index * angleStep}deg) translateZ(280px)`,
                background: "#000",
              }}
              onClick={() => navigate(`/review/${review.id}`)}
            >
              <img
                src={review.image}
                alt={review.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white py-2">
                <h3 className="text-lg font-semibold">{review.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
