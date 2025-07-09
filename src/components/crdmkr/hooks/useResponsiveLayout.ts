import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const useResponsiveLayout = (): ResponsiveBreakpoints => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024 && dimensions.width < 1440,
    isLargeDesktop: dimensions.width >= 1440,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height
  };
};

export const getResponsiveCardSize = (screenWidth: number, screenHeight: number) => {
  // Mobile: Use most of the screen width
  if (screenWidth < 768) {
    return {
      width: Math.min(320, screenWidth * 0.85),
      height: Math.min(448, screenHeight * 0.5)
    };
  }
  
  // Tablet: Moderate sizing
  if (screenWidth < 1024) {
    return {
      width: Math.min(380, screenWidth * 0.6),
      height: Math.min(532, screenHeight * 0.6)
    };
  }
  
  // Desktop: Larger sizing
  if (screenWidth < 1440) {
    return {
      width: Math.min(450, screenWidth * 0.4),
      height: Math.min(630, screenHeight * 0.7)
    };
  }
  
  // Large desktop: Maximum size
  return {
    width: Math.min(500, screenWidth * 0.35),
    height: Math.min(700, screenHeight * 0.75)
  };
};