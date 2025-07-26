export interface HistogramDetectedCard {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  aspectRatio: number;
  corners: Array<{ x: number; y: number }>;
  colorVariance: number;
  textureScore: number;
}

export class HistogramCardDetector {
  private readonly TARGET_ASPECT_RATIO = 2.5 / 3.5;
  private readonly ASPECT_TOLERANCE = 0.25; // Increased for more flexibility
  private readonly MIN_CARD_AREA = 4000; // Lowered for smaller cards

  async detectCards(image: HTMLImageElement): Promise<HistogramDetectedCard[]> {
    console.log('🎨 Starting histogram-based card detection...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Detect regions with distinct color patterns (typical of trading cards)
    const colorRegions = this.findColorDistinctRegions(imageData);
    
    // Filter regions by card-like properties
    const cardRegions = this.filterCardLikeRegions(colorRegions);
    
    return cardRegions.map((region, index) => ({
      id: `histogram-${index}-${Date.now()}`,
      bounds: region.bounds,
      confidence: region.confidence,
      aspectRatio: region.bounds.width / region.bounds.height,
      corners: [
        { x: region.bounds.x, y: region.bounds.y },
        { x: region.bounds.x + region.bounds.width, y: region.bounds.y },
        { x: region.bounds.x + region.bounds.width, y: region.bounds.y + region.bounds.height },
        { x: region.bounds.x, y: region.bounds.y + region.bounds.height }
      ],
      colorVariance: region.colorVariance,
      textureScore: region.textureScore
    }));
  }

  private findColorDistinctRegions(imageData: ImageData): Array<{
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
    colorVariance: number;
    textureScore: number;
  }> {
    const { width, height, data } = imageData;
    const regions = [];
    const maxRegions = 50; // Increase to user's requested max
    
    // Optimized grid size for better coverage
    const gridSize = Math.max(15, Math.min(width, height) / 60);
    
    // Test a broader range of card sizes with smaller increments
    for (let y = 0; y < height - 100 && regions.length < maxRegions; y += gridSize) {
      for (let x = 0; x < width - 60 && regions.length < maxRegions; x += gridSize) {
        // Test more size variations with finer granularity
        for (let w = 60; w <= Math.min(350, width - x); w += 20) {
          for (let h = 80; h <= Math.min(450, height - y); h += 25) {
            if (regions.length >= maxRegions) break;
            
            const aspectRatio = w / h;
            if (Math.abs(aspectRatio - this.TARGET_ASPECT_RATIO) <= this.ASPECT_TOLERANCE) {
              const region = { x, y, width: w, height: h };
              const analysis = this.analyzeRegionHistogram(data, width, region);
              
              // Lower thresholds for better detection
              if (analysis.colorVariance > 0.15 && analysis.textureScore > 0.2) {
                regions.push({
                  bounds: region,
                  confidence: Math.min(0.85, analysis.colorVariance * 0.5 + analysis.textureScore * 0.5),
                  colorVariance: analysis.colorVariance,
                  textureScore: analysis.textureScore
                });
              }
            }
          }
        }
      }
    }
    
    return regions;
  }

  private analyzeRegionHistogram(data: Uint8ClampedArray, width: number, region: { x: number; y: number; width: number; height: number }) {
    const rHist = new Array(256).fill(0);
    const gHist = new Array(256).fill(0);
    const bHist = new Array(256).fill(0);
    let totalPixels = 0;
    let textureSum = 0;

    // Sample pixels from the region
    const sampleStep = 4;
    for (let y = region.y; y < region.y + region.height; y += sampleStep) {
      for (let x = region.x; x < region.x + region.width; x += sampleStep) {
        if (y >= 0 && y < data.length / width / 4 && x >= 0 && x < width) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          rHist[r]++;
          gHist[g]++;
          bHist[b]++;
          totalPixels++;
          
          // Simple texture analysis using local variance
          if (x > region.x && y > region.y) {
            const prevIdx = ((y - sampleStep) * width + (x - sampleStep)) * 4;
            const variance = Math.abs(r - data[prevIdx]) + Math.abs(g - data[prevIdx + 1]) + Math.abs(b - data[prevIdx + 2]);
            textureSum += variance;
          }
        }
      }
    }

    // Calculate color variance (how diverse the colors are)
    const colorVariance = this.calculateHistogramVariance([rHist, gHist, bHist], totalPixels);
    
    // Calculate texture score
    const textureScore = Math.min(1.0, textureSum / (totalPixels * 100));

    return { colorVariance, textureScore };
  }

  private calculateHistogramVariance(histograms: number[][], totalPixels: number): number {
    let variance = 0;
    
    histograms.forEach(hist => {
      const mean = hist.reduce((sum, count, index) => sum + count * index, 0) / totalPixels;
      const histVariance = hist.reduce((sum, count, index) => {
        return sum + count * Math.pow(index - mean, 2);
      }, 0) / totalPixels;
      variance += histVariance;
    });
    
    return Math.min(1.0, variance / (255 * 255 * 3));
  }

  private filterCardLikeRegions(regions: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
    colorVariance: number;
    textureScore: number;
  }>) {
    return regions
      .filter(region => {
        const area = region.bounds.width * region.bounds.height;
        return area >= this.MIN_CARD_AREA && region.confidence > 0.3; // Lower confidence threshold
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 50); // Increase to user's requested max
  }
}

export const histogramCardDetector = new HistogramCardDetector();