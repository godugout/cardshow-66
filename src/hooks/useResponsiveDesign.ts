import { useState, useEffect } from 'react';

type BreakpointKey = 'mobile' | 'tablet' | 'desktop' | 'large' | 'ultrawide';

const breakpoints = {
  mobile: 0,      // < 768px
  tablet: 768,    // 768px - 1024px  
  desktop: 1024,  // 1024px - 1440px
  large: 1440,    // 1440px - 1920px
  ultrawide: 1920 // > 1920px
} as const;

interface ResponsiveConfig {
  currentBreakpoint: BreakpointKey;
  windowWidth: number;
  windowHeight: number;
  
  // Device type checks
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltrawide: boolean;
  
  // Touch vs Mouse
  isTouchDevice: boolean;
  hasHover: boolean;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Safe areas (for mobile devices)
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Dynamic spacing based on screen size
  containerPadding: string;
  gridGap: string;
  cardSize: 'sm' | 'md' | 'lg' | 'xl';
}

export const useResponsiveDesign = (): ResponsiveConfig => {
  const [config, setConfig] = useState<ResponsiveConfig>({
    currentBreakpoint: 'desktop',
    windowWidth: 0,
    windowHeight: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isUltrawide: false,
    isTouchDevice: false,
    hasHover: true,
    isPortrait: false,
    isLandscape: true,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    containerPadding: 'px-8',
    gridGap: 'gap-6',
    cardSize: 'md'
  });
  
  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine breakpoint
      let currentBreakpoint: BreakpointKey;
      if (width >= breakpoints.ultrawide) {
        currentBreakpoint = 'ultrawide';
      } else if (width >= breakpoints.large) {
        currentBreakpoint = 'large';
      } else if (width >= breakpoints.desktop) {
        currentBreakpoint = 'desktop';
      } else if (width >= breakpoints.tablet) {
        currentBreakpoint = 'tablet';
      } else {
        currentBreakpoint = 'mobile';
      }
      
      // Device type checks
      const isMobile = currentBreakpoint === 'mobile';
      const isTablet = currentBreakpoint === 'tablet';
      const isDesktop = ['desktop', 'large', 'ultrawide'].includes(currentBreakpoint);
      const isLargeDesktop = ['large', 'ultrawide'].includes(currentBreakpoint);
      const isUltrawide = currentBreakpoint === 'ultrawide';
      
      // Touch and hover detection
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      
      // Orientation
      const isPortrait = height > width;
      const isLandscape = width > height;
      
      // Safe area insets (for mobile with notches/home indicators)
      const safeAreaInsets = {
        top: isMobile ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0') : 0,
        bottom: isMobile ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0') : 0,
        left: isMobile ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0') : 0,
        right: isMobile ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0') : 0,
      };
      
      // Dynamic spacing
      const containerPadding = {
        mobile: 'px-4',
        tablet: 'px-6',
        desktop: 'px-8',
        large: 'px-12',
        ultrawide: 'px-16'
      }[currentBreakpoint];
      
      const gridGap = {
        mobile: 'gap-4',
        tablet: 'gap-5',
        desktop: 'gap-6',
        large: 'gap-8',
        ultrawide: 'gap-10'
      }[currentBreakpoint];
      
      // Card size based on available space
      let cardSize: 'sm' | 'md' | 'lg' | 'xl';
      if (isMobile) {
        cardSize = 'sm';
      } else if (isTablet) {
        cardSize = 'md';
      } else if (isLargeDesktop) {
        cardSize = 'xl';
      } else {
        cardSize = 'lg';
      }
      
      setConfig({
        currentBreakpoint,
        windowWidth: width,
        windowHeight: height,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        isUltrawide,
        isTouchDevice,
        hasHover,
        isPortrait,
        isLandscape,
        safeAreaInsets,
        containerPadding,
        gridGap,
        cardSize
      });
    };
    
    // Initial setup
    updateConfig();
    
    // Listen for changes
    window.addEventListener('resize', updateConfig);
    window.addEventListener('orientationchange', updateConfig);
    
    return () => {
      window.removeEventListener('resize', updateConfig);
      window.removeEventListener('orientationchange', updateConfig);
    };
  }, []);
  
  return config;
};

// Utility hooks for specific use cases
export const useIsMobile = () => {
  const { isMobile } = useResponsiveDesign();
  return isMobile;
};

export const useIsTablet = () => {
  const { isTablet } = useResponsiveDesign();
  return isTablet;
};

export const useIsDesktop = () => {
  const { isDesktop } = useResponsiveDesign();
  return isDesktop;
};

export const useTouchDevice = () => {
  const { isTouchDevice } = useResponsiveDesign();
  return isTouchDevice;
};

export const useCardSize = () => {
  const { cardSize } = useResponsiveDesign();
  return cardSize;
};