import { useState, useEffect } from 'react';

export const CurtainAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if curtain has been shown before in this session
    const curtainShown = sessionStorage.getItem('curtainShown');
    
    if (curtainShown) {
      setIsVisible(false);
    } else {
      sessionStorage.setItem('curtainShown', 'true');
      // Remove curtain from DOM after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="curtain absolute inset-0 bg-gradient-to-b from-[#8b0000] to-[#b22222] origin-top animate-curtain-rise flex items-center justify-center">
        <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF8C00] drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] animate-pulse">
          SM Reviews
        </h1>
      </div>
    </div>
  );
};
