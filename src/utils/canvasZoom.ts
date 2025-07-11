import React from 'react';

/**
 * Canvas Zoom Utilities
 * Calculates optimal zoom levels for canvas previews based on viewport and content dimensions
 */

export interface ZoomConfig {
  /** Target percentage of viewport to fill (0.6 = 60%) */
  targetFillPercent?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Padding around the content in pixels */
  padding?: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface ContentDimensions {
  width: number;
  height: number;
}

/**
 * Calculates optimal zoom level for displaying content in a viewport
 * @param viewport Available viewport dimensions
 * @param content Content dimensions to fit
 * @param config Zoom configuration options
 * @returns Optimal zoom level
 */
export function calculateOptimalZoom(
  viewport: ViewportDimensions,
  content: ContentDimensions,
  config: ZoomConfig = {}
): number {
  const {
    targetFillPercent = 0.7, // 70% of viewport by default
    minZoom = 0.1,
    maxZoom = 3,
    padding = 40
  } = config;

  // Available space after padding
  const availableWidth = viewport.width - (padding * 2);
  const availableHeight = viewport.height - (padding * 2);
  
  // Target dimensions (percentage of available space)
  const targetWidth = availableWidth * targetFillPercent;
  const targetHeight = availableHeight * targetFillPercent;
  
  // Calculate zoom to fit width and height
  const zoomToFitWidth = targetWidth / content.width;
  const zoomToFitHeight = targetHeight / content.height;
  
  // Use the smaller zoom to ensure content fits in both dimensions
  const optimalZoom = Math.min(zoomToFitWidth, zoomToFitHeight);
  
  // Clamp within bounds
  return Math.max(minZoom, Math.min(maxZoom, optimalZoom));
}

/**
 * Calculates optimal zoom for card preview specifically
 * Uses card-optimized defaults for better initial presentation
 */
export function calculateCardPreviewZoom(
  viewport: ViewportDimensions,
  cardDimensions: ContentDimensions
): number {
  // Card-specific configuration
  // - Show more of the card (75% fill)
  // - Allow higher max zoom for detail viewing
  // - Use appropriate padding for card viewing
  return calculateOptimalZoom(viewport, cardDimensions, {
    targetFillPercent: 0.75,
    minZoom: 0.2,
    maxZoom: 2,
    padding: 60
  });
}

/**
 * Hook to get viewport dimensions with resize handling
 */
export function useViewportDimensions(elementRef?: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = React.useState<ViewportDimensions>({
    width: 800,
    height: 600
  });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      } else {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [elementRef]);

  return dimensions;
}