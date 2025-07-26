import { CardRegion } from './types';
import { removeOverlappingRegions } from './confidenceCalculator';

export const detectCardRegions = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<CardRegion[]> => {
  console.log('🔍 Starting straightforward card detection...');
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const regions: CardRegion[] = [];
  const targetAspectRatio = 2.5 / 3.5; // Standard trading card ratio
  
  // Try different card sizes as percentages of image size
  const scales = [0.08, 0.12, 0.16, 0.20, 0.25, 0.30, 0.35, 0.40];
  
  for (const scale of scales) {
    const cardWidth = canvas.width * scale;
    const cardHeight = cardWidth / targetAspectRatio;
    
    // Skip if card would be too tall for image
    if (cardHeight > canvas.height * 0.9) continue;
    
    // Use smaller steps for better coverage
    const stepX = Math.max(10, cardWidth * 0.15);
    const stepY = Math.max(10, cardHeight * 0.15);
    
    for (let y = 0; y <= canvas.height - cardHeight; y += stepY) {
      for (let x = 0; x <= canvas.width - cardWidth; x += stepX) {
        // Calculate a simple confidence score based on edge detection
        const confidence = calculateSimpleConfidence(data, canvas.width, canvas.height, x, y, cardWidth, cardHeight);
        
        if (confidence > 0.3) {
          regions.push({
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(cardWidth),
            height: Math.round(cardHeight),
            confidence
          });
        }
      }
    }
  }
  
  console.log(`Found ${regions.length} potential regions before filtering`);
  
  // Remove overlapping regions, keeping the highest confidence ones
  const filteredRegions = removeOverlappingRegions(regions);
  console.log(`After removing overlaps: ${filteredRegions.length} regions`);
  
  // Sort by confidence and return top results
  const sortedRegions = filteredRegions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12);
  
  console.log(`Returning top ${sortedRegions.length} regions`);
  
  return sortedRegions;
};

function calculateSimpleConfidence(
  data: Uint8ClampedArray, 
  width: number, 
  height: number, 
  x: number, 
  y: number, 
  w: number, 
  h: number
): number {
  // Sample points around the border of the region
  const borderSamples = 24;
  let edgeScore = 0;
  let validSamples = 0;
  
  // Sample the top and bottom edges
  for (let i = 0; i < borderSamples; i++) {
    const sampleX = x + (w * i) / (borderSamples - 1);
    
    // Top edge
    const topInside = getPixelBrightness(data, width, height, sampleX, y + 2);
    const topOutside = getPixelBrightness(data, width, height, sampleX, y - 2);
    edgeScore += Math.abs(topInside - topOutside) / 255;
    validSamples++;
    
    // Bottom edge
    const bottomInside = getPixelBrightness(data, width, height, sampleX, y + h - 2);
    const bottomOutside = getPixelBrightness(data, width, height, sampleX, y + h + 2);
    edgeScore += Math.abs(bottomInside - bottomOutside) / 255;
    validSamples++;
  }
  
  // Sample the left and right edges
  for (let i = 0; i < borderSamples; i++) {
    const sampleY = y + (h * i) / (borderSamples - 1);
    
    // Left edge
    const leftInside = getPixelBrightness(data, width, height, x + 2, sampleY);
    const leftOutside = getPixelBrightness(data, width, height, x - 2, sampleY);
    edgeScore += Math.abs(leftInside - leftOutside) / 255;
    validSamples++;
    
    // Right edge
    const rightInside = getPixelBrightness(data, width, height, x + w - 2, sampleY);
    const rightOutside = getPixelBrightness(data, width, height, x + w + 2, sampleY);
    edgeScore += Math.abs(rightInside - rightOutside) / 255;
    validSamples++;
  }
  
  const avgEdgeScore = validSamples > 0 ? edgeScore / validSamples : 0;
  
  // Also check for color uniformity within the region (cards tend to have consistent backgrounds)
  const uniformityScore = calculateUniformity(data, width, height, x, y, w, h);
  
  // Combine edge detection with uniformity
  return (avgEdgeScore * 0.7) + (uniformityScore * 0.3);
}

function calculateUniformity(
  data: Uint8ClampedArray, 
  width: number, 
  height: number, 
  x: number, 
  y: number, 
  w: number, 
  h: number
): number {
  const samples = 16;
  let totalVariance = 0;
  
  for (let i = 0; i < samples; i++) {
    const sampleX = x + w * 0.2 + (w * 0.6) * Math.random();
    const sampleY = y + h * 0.2 + (h * 0.6) * Math.random();
    
    const center = getPixelBrightness(data, width, height, sampleX, sampleY);
    let localVariance = 0;
    let neighbors = 0;
    
    // Check nearby pixels
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const neighbor = getPixelBrightness(data, width, height, sampleX + dx * 3, sampleY + dy * 3);
        localVariance += Math.pow(neighbor - center, 2);
        neighbors++;
      }
    }
    
    totalVariance += localVariance / neighbors;
  }
  
  const avgVariance = totalVariance / samples;
  // Lower variance means more uniform (better for cards)
  return Math.max(0, 1 - (avgVariance / 10000));
}

function getPixelBrightness(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  const px = Math.max(0, Math.min(width - 1, Math.floor(x)));
  const py = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const idx = (py * width + px) * 4;
  
  if (idx >= 0 && idx < data.length - 3) {
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }
  return 128;
}
