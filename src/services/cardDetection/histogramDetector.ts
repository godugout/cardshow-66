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
  private readonly ASPECT_TOLERANCE = 0.15;
  private readonly MIN_CARD_AREA = 6000;

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
    const maxRegions = 8; // Limit to prevent excessive processing
    
    // Much larger grid size for efficiency
    const gridSize = Math.max(40, Math.min(width, height) / 25);
    
    // Test only standard card sizes instead of all combinations
    const cardSizes = [
      { w: 100, h: 140 },
      { w: 150, h: 210 },
      { w: 200, h: 280 }
    ];
    
    for (let y = 0; y < height - 140 && regions.length < maxRegions; y += gridSize) {
      for (let x = 0; x < width - 100 && regions.length < maxRegions; x += gridSize) {
        for (const size of cardSizes) {
          if (x + size.w >= width || y + size.h >= height) continue;
          
          const aspectRatio = size.w / size.h;
          if (Math.abs(aspectRatio - this.TARGET_ASPECT_RATIO) <= this.ASPECT_TOLERANCE) {
            const region = { x, y, width: size.w, height: size.h };
            const analysis = this.analyzeRegionHistogram(data, width, region);
            
            if (analysis.colorVariance > 0.4 && analysis.textureScore > 0.5) {
              regions.push({
                bounds: region,
                confidence: Math.min(0.85, analysis.colorVariance * 0.5 + analysis.textureScore * 0.5),
                colorVariance: analysis.colorVariance,
                textureScore: analysis.textureScore
              });
              
              if (regions.length >= maxRegions) break;
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
        return area >= this.MIN_CARD_AREA && region.confidence > 0.5;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6); // Limit to top 6 candidates
  }
}

export const histogramCardDetector = new HistogramCardDetector();