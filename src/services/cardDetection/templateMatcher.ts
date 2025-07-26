export interface TemplateMatchResult {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  aspectRatio: number;
  corners: Array<{ x: number; y: number }>;
  matchScore: number;
}

export class TemplateCardMatcher {
  private readonly TARGET_ASPECT_RATIO = 2.5 / 3.5;
  private readonly ASPECT_TOLERANCE = 0.12;
  private readonly MIN_CARD_AREA = 6000;

  async detectCards(image: HTMLImageElement): Promise<TemplateMatchResult[]> {
    console.log('🎯 Starting template matching card detection...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // Create multiple template patterns for different card types
    const templates = this.generateCardTemplates();
    const matches: TemplateMatchResult[] = [];

    for (const template of templates) {
      const templateMatches = await this.matchTemplate(canvas, template);
      matches.push(...templateMatches);
    }

    // Remove overlapping detections and return best matches
    return this.filterOverlappingMatches(matches);
  }

  private generateCardTemplates(): Array<{
    width: number;
    height: number;
    pattern: string;
  }> {
    // Generate templates for different card sizes
    const baseSizes = [
      { width: 100, height: 140 },
      { width: 150, height: 210 },
      { width: 200, height: 280 },
      { width: 250, height: 350 }
    ];

    return baseSizes.map((size, index) => ({
      ...size,
      pattern: `template-${index}`
    }));
  }

  private async matchTemplate(
    canvas: HTMLCanvasElement, 
    template: { width: number; height: number; pattern: string }
  ): Promise<TemplateMatchResult[]> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const matches: TemplateMatchResult[] = [];

    // Sliding window approach for template matching
    const stepSize = Math.max(5, Math.min(template.width, template.height) / 4);
    
    for (let y = 0; y <= canvas.height - template.height; y += stepSize) {
      for (let x = 0; x <= canvas.width - template.width; x += stepSize) {
        const region = {
          x, y,
          width: template.width,
          height: template.height
        };

        const matchScore = this.calculateTemplateMatch(imageData, region, template);
        
        if (matchScore > 0.6) {
          const aspectRatio = template.width / template.height;
          
          if (Math.abs(aspectRatio - this.TARGET_ASPECT_RATIO) <= this.ASPECT_TOLERANCE) {
            matches.push({
              id: `template-${template.pattern}-${x}-${y}-${Date.now()}`,
              bounds: region,
              confidence: matchScore,
              aspectRatio,
              corners: [
                { x, y },
                { x: x + template.width, y },
                { x: x + template.width, y: y + template.height },
                { x, y: y + template.height }
              ],
              matchScore
            });
          }
        }
      }
    }

    return matches;
  }

  private calculateTemplateMatch(
    imageData: ImageData,
    region: { x: number; y: number; width: number; height: number },
    template: { width: number; height: number; pattern: string }
  ): number {
    const { data, width } = imageData;
    let score = 0;
    let sampleCount = 0;

    // Sample points for template matching
    const sampleStep = 4;
    
    for (let y = 0; y < region.height; y += sampleStep) {
      for (let x = 0; x < region.width; x += sampleStep) {
        const imgX = region.x + x;
        const imgY = region.y + y;
        
        if (imgX >= 0 && imgX < width && imgY >= 0 && imgY < imageData.height) {
          const idx = (imgY * width + imgX) * 4;
          
          // Expected card-like properties
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // Calculate features that are typical of trading cards
          const edgeX = x / region.width;
          const edgeY = y / region.height;
          
          // Cards typically have distinct borders
          const isNearBorder = edgeX < 0.1 || edgeX > 0.9 || edgeY < 0.1 || edgeY > 0.9;
          
          // Cards often have varied colors and some contrast
          const intensity = (r + g + b) / 3;
          const colorVariance = Math.abs(r - intensity) + Math.abs(g - intensity) + Math.abs(b - intensity);
          
          let featureScore = 0;
          
          // Border areas should have some edge strength
          if (isNearBorder) {
            featureScore += Math.min(1.0, colorVariance / 100) * 0.3;
          }
          
          // Inner areas should have varied content
          if (!isNearBorder) {
            featureScore += Math.min(1.0, colorVariance / 80) * 0.7;
          }
          
          // Brightness diversity is good
          featureScore += Math.min(0.2, Math.abs(intensity - 128) / 128) * 0.2;
          
          score += featureScore;
          sampleCount++;
        }
      }
    }

    return sampleCount > 0 ? Math.min(1.0, score / sampleCount) : 0;
  }

  private filterOverlappingMatches(matches: TemplateMatchResult[]): TemplateMatchResult[] {
    // Sort by confidence
    const sortedMatches = matches.sort((a, b) => b.confidence - a.confidence);
    const filtered: TemplateMatchResult[] = [];

    for (const match of sortedMatches) {
      const hasOverlap = filtered.some(existing => 
        this.calculateOverlap(match.bounds, existing.bounds) > 0.3
      );

      if (!hasOverlap) {
        filtered.push(match);
      }
    }

    return filtered.slice(0, 8); // Limit to top 8 matches
  }

  private calculateOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): number {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const overlapArea = (x2 - x1) * (y2 - y1);
    const totalArea = rect1.width * rect1.height + rect2.width * rect2.height - overlapArea;

    return overlapArea / totalArea;
  }
}

export const templateCardMatcher = new TemplateCardMatcher();