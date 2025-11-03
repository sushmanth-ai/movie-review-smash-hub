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

  // Take first 6 reviews for 3D effect
  const carouselReviews = reviews.slice(0, 6);

  // Rotate carousel on button click
  const rotate = (direction: "next" | "prev") => {
    setRotation((prev) => prev + (direction === "next" ? -60 : 60));
  };

  // Autoplay rotation
  useEffect(() => {
    const startAutoplay = () => {
      intervalRef.current = setInterval(() => {
        rotate("next");
      }, 2500);
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
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full py-16">
      {/* 3D container */}
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
              className="absolute w-[250px] h-[200px] rounded-lg overflow-hidden text-white text-center text-5xl font-bold cursor-pointer"
              style={{
                transform: `rotateY(${index * 60}deg) translateZ(250px)`,
                background: "#000",
                opacity: 0.95,
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
                <div className="flex justify-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Number(review.rating) ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between w-[300px] mt-8">
        <button
          onClick={() => rotate("prev")}
          className="px-4 py-2 bg-gray-300 rounded-md shadow-md hover:bg-gray-400 active:translate-y-[2px]"
        >
          Prev
        </button>
        <button
          onClick={() => rotate("next")}
          className="px-4 py-2 bg-gray-300 rounded-md shadow-md hover:bg-gray-400 active:translate-y-[2px]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

remove next previous navigations....and remove star rTING IN THEIR CARDS

