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
      <div className="curtain absolute inset-0 bg-gradient-to-b from-[#8b0000] to-[#b22222] origin-bottom animate-curtain-up" />
    </div>
  );
};
