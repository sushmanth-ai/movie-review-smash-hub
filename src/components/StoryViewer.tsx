import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Star, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { MovieReview } from '@/data/movieReviews';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StoryViewerProps {
  reviews: MovieReview[];
  initialIndex: number;
  onClose: () => void;
}

type StorySlide = 'overview' | 'firstHalf' | 'secondHalf' | 'verdict';

const SLIDE_DURATION = 6000;
const SLIDES: StorySlide[] = ['overview', 'firstHalf', 'secondHalf', 'verdict'];

export const StoryViewer: React.FC<StoryViewerProps> = ({ reviews, initialIndex, onClose }) => {
  const navigate = useNavigate();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(initialIndex);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  const review = reviews[currentReviewIndex];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  const goNextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
      resetTimer();
    } else if (currentReviewIndex < reviews.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
      setCurrentSlide(0);
      resetTimer();
    } else {
      onClose();
    }
  }, [currentSlide, currentReviewIndex, reviews.length, onClose, resetTimer]);

  const goPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      resetTimer();
    } else if (currentReviewIndex > 0) {
      setCurrentReviewIndex(prev => prev - 1);
      setCurrentSlide(SLIDES.length - 1);
      resetTimer();
    }
  }, [currentSlide, currentReviewIndex, resetTimer]);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;
    startTimeRef.current = Date.now() - elapsedRef.current;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNextSlide();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentSlide, currentReviewIndex, goNextSlide]);

  // Pause on hold
  const handlePointerDown = () => {
    elapsedRef.current = Date.now() - startTimeRef.current;
    setIsPaused(true);
  };
  const handlePointerUp = () => setIsPaused(false);

  // Tap zones
  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrevSlide();
    else if (x > rect.width * 0.7) goNextSlide();
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNextSlide();
      if (e.key === 'ArrowLeft') goPrevSlide();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNextSlide, goPrevSlide]);

  const handleReadFull = () => {
    onClose();
    navigate(`/review/${review.id}`);
  };

  const renderSlideContent = () => {
    const slideType = SLIDES[currentSlide];
    switch (slideType) {
      case 'overview':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-black text-orange-400 mb-3 drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]">
              {review.title}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              {review.review}
            </p>
            <div className="flex items-center gap-2 mt-6 bg-red-500/20 px-5 py-2.5 rounded-full border border-orange-500/40">
              <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
              <span className="text-orange-400 font-bold text-xl">{review.rating}</span>
            </div>
            {review.views && (
              <div className="flex items-center gap-1.5 mt-3 text-muted-foreground text-sm">
                <Eye className="w-4 h-4" />
                <span>{review.views} views</span>
              </div>
            )}
          </div>
        );
      case 'firstHalf':
        return (
          <div className="flex flex-col justify-center h-full px-6 animate-fade-in">
            <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 border border-orange-500/30 shadow-[0_0_30px_rgba(251,146,60,0.15)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎬</span>
                <h3 className="text-xl font-bold text-orange-400">First Half</h3>
              </div>
              <p className="text-white/90 leading-relaxed text-base">
                {review.firstHalf}
              </p>
            </div>
          </div>
        );
      case 'secondHalf':
        return (
          <div className="flex flex-col justify-center h-full px-6 animate-fade-in">
            <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎥</span>
                <h3 className="text-xl font-bold text-red-400">Second Half</h3>
              </div>
              <p className="text-white/90 leading-relaxed text-base">
                {review.secondHalf}
              </p>
            </div>
          </div>
        );
      case 'verdict':
        return (
          <div className="flex flex-col justify-center h-full px-6 animate-fade-in">
            <div className="space-y-4">
              <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-emerald-400">Positives</h3>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">{review.positives}</p>
              </div>
              <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-5 border border-red-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-red-400">Negatives</h3>
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed">{review.negatives}</p>
              </div>
              <div className="bg-primary/10 backdrop-blur-md rounded-2xl p-5 border border-primary/30">
                <p className="text-primary font-bold text-center text-lg">"{review.overall}"</p>
              </div>
              <button
                onClick={handleReadFull}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-full text-base hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              >
                Read Full Review →
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      {/* Story container */}
      <div
        className="relative w-full max-w-md h-[90vh] max-h-[800px] mx-auto overflow-hidden rounded-2xl"
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={review.image}
            alt={review.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-20">
          {SLIDES.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{
                  width: i < currentSlide ? '100%' : i === currentSlide ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span className="text-sm">🎬</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{review.title}</p>
              <p className="text-white/60 text-xs">{SLIDES[currentSlide].replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Slide content */}
        <div className="relative z-10 h-full pt-20 pb-6">
          {renderSlideContent()}
        </div>

        {/* Story counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <span className="text-white/40 text-xs">
            {currentReviewIndex + 1} / {reviews.length}
          </span>
        </div>
      </div>

      {/* Desktop nav arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrevSlide(); }}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goNextSlide(); }}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};
