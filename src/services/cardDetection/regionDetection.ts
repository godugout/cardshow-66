import type { DetectedRegion } from './types';

export const detectCardRegions = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<DetectedRegion[]> => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const regions: DetectedRegion[] = [];

  // Use a grid-based approach to detect card-like rectangles
  const rectangles = detectRectangularRegions(imageData, canvas.width, canvas.height);

  // Filter for card-like rectangles (approximately 2.5:3.5 aspect ratio)
  const targetRatio = 2.5 / 3.5;
  const tolerance = 0.3;

  for (const rect of rectangles) {
    const ratio = rect.width / rect.height;
    const ratioDiff = Math.abs(ratio - targetRatio);
    
    if (ratioDiff <= tolerance) {
      regions.push({
        x: rect.x / canvas.width,
        y: rect.y / canvas.height,
        width: rect.width / canvas.width,
        height: rect.height / canvas.height,
        confidence: Math.max(0.1, 1 - (ratioDiff / tolerance))
      });
    }
  }

  return regions.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
};

const detectRectangularRegions = (imageData: ImageData, width: number, height: number): Array<{x: number, y: number, width: number, height: number}> => {
  const rectangles: Array<{x: number, y: number, width: number, height: number}> = [];
  const { data } = imageData;
  
  // Calculate average brightness for comparison
  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    totalBrightness += brightness;
  }
  const avgBrightness = totalBrightness / (data.length / 4);
  
  // Grid-based detection with smaller steps for better precision
  const stepSize = Math.min(width, height) / 50; // Adaptive step size
  const minCardWidth = Math.min(width, height) * 0.1; // Minimum 10% of image dimension
  const maxCardWidth = Math.min(width, height) * 0.8; // Maximum 80% of image dimension
  
  for (let y = 0; y < height - minCardWidth; y += stepSize) {
    for (let x = 0; x < width - minCardWidth; x += stepSize) {
      
      // Try different card sizes
      for (let scale = 0.1; scale <= 0.8; scale += 0.1) {
        const cardWidth = Math.min(width - x, maxCardWidth * scale);
        const cardHeight = cardWidth * (3.5 / 2.5); // Trading card aspect ratio
        
        if (x + cardWidth > width || y + cardHeight > height) continue;
        
        // Check if this region looks like a card
        const confidence = analyzeRegion(data, width, height, Math.round(x), Math.round(y), Math.round(cardWidth), Math.round(cardHeight), avgBrightness);
        
        if (confidence > 0.3) {
          rectangles.push({
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(cardWidth),
            height: Math.round(cardHeight)
          });
        }
      }
    }
  }
  
  // Remove overlapping rectangles
  return removeOverlapping(rectangles);
};

const analyzeRegion = (data: Uint8ClampedArray, imgWidth: number, imgHeight: number, x: number, y: number, width: number, height: number, avgBrightness: number): number => {
  let edgeScore = 0;
  let brightnessVariance = 0;
  let sampleCount = 0;
  
  // Sample pixels around the border to detect edges
  const borderSamples = 20;
  
  // Top and bottom edges
  for (let i = 0; i < borderSamples; i++) {
    const sampleX = x + (i / borderSamples) * width;
    if (sampleX >= 0 && sampleX < imgWidth) {
      // Top edge
      if (y > 0) {
        const topInside = getPixelBrightness(data, imgWidth, Math.round(sampleX), y + 2);
        const topOutside = getPixelBrightness(data, imgWidth, Math.round(sampleX), y - 2);
        edgeScore += Math.abs(topInside - topOutside);
        sampleCount++;
      }
      
      // Bottom edge
      if (y + height < imgHeight - 2) {
        const bottomInside = getPixelBrightness(data, imgWidth, Math.round(sampleX), y + height - 2);
        const bottomOutside = getPixelBrightness(data, imgWidth, Math.round(sampleX), y + height + 2);
        edgeScore += Math.abs(bottomInside - bottomOutside);
        sampleCount++;
      }
    }
  }
  
  // Left and right edges
  for (let i = 0; i < borderSamples; i++) {
    const sampleY = y + (i / borderSamples) * height;
    if (sampleY >= 0 && sampleY < imgHeight) {
      // Left edge
      if (x > 0) {
        const leftInside = getPixelBrightness(data, imgWidth, x + 2, Math.round(sampleY));
        const leftOutside = getPixelBrightness(data, imgWidth, x - 2, Math.round(sampleY));
        edgeScore += Math.abs(leftInside - leftOutside);
        sampleCount++;
      }
      
      // Right edge
      if (x + width < imgWidth - 2) {
        const rightInside = getPixelBrightness(data, imgWidth, x + width - 2, Math.round(sampleY));
        const rightOutside = getPixelBrightness(data, imgWidth, x + width + 2, Math.round(sampleY));
        edgeScore += Math.abs(rightInside - rightOutside);
        sampleCount++;
      }
    }
  }
  
  const avgEdgeScore = sampleCount > 0 ? edgeScore / sampleCount : 0;
  
  // Calculate internal brightness variance to detect uniform regions
  let internalBrightness = 0;
  let internalSamples = 0;
  
  for (let sy = y + 5; sy < y + height - 5; sy += 5) {
    for (let sx = x + 5; sx < x + width - 5; sx += 5) {
      if (sx >= 0 && sx < imgWidth && sy >= 0 && sy < imgHeight) {
        internalBrightness += getPixelBrightness(data, imgWidth, sx, sy);
        internalSamples++;
      }
    }
  }
  
  const avgInternalBrightness = internalSamples > 0 ? internalBrightness / internalSamples : avgBrightness;
  const contrastScore = Math.abs(avgInternalBrightness - avgBrightness) / 255;
  
  // Combine edge detection and contrast for confidence score
  const normalizedEdgeScore = Math.min(avgEdgeScore / 100, 1);
  const confidence = (normalizedEdgeScore * 0.7) + (contrastScore * 0.3);
  
  return confidence;
};

const getPixelBrightness = (data: Uint8ClampedArray, width: number, x: number, y: number): number => {
  const idx = (y * width + x) * 4;
  if (idx >= 0 && idx < data.length - 3) {
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }
  return 0;
};

const removeOverlapping = (rectangles: Array<{x: number, y: number, width: number, height: number}>): Array<{x: number, y: number, width: number, height: number}> => {
  const filtered: Array<{x: number, y: number, width: number, height: number}> = [];
  
  for (const rect of rectangles) {
    let shouldAdd = true;
    
    for (const existing of filtered) {
      const overlapX = Math.max(0, Math.min(rect.x + rect.width, existing.x + existing.width) - Math.max(rect.x, existing.x));
      const overlapY = Math.max(0, Math.min(rect.y + rect.height, existing.y + existing.height) - Math.max(rect.y, existing.y));
      const overlapArea = overlapX * overlapY;
      const rectArea = rect.width * rect.height;
      const existingArea = existing.width * existing.height;
      
      // If more than 30% overlap, skip this rectangle
      if (overlapArea > 0.3 * Math.min(rectArea, existingArea)) {
        shouldAdd = false;
        break;
      }
    }
    
    if (shouldAdd) {
      filtered.push(rect);
    }
  }
  
  return filtered;
};