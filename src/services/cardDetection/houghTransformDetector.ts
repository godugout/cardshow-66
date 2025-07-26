export interface HoughDetectedCard {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  aspectRatio: number;
  corners: Array<{ x: number; y: number }>;
  lineStrength: number;
  rectangularScore: number;
}

export class HoughTransformDetector {
  private readonly TARGET_ASPECT_RATIO = 2.5 / 3.5;
  private readonly ASPECT_TOLERANCE = 0.15;
  private readonly MIN_CARD_AREA = 5000;

  async detectCards(image: HTMLImageElement): Promise<HoughDetectedCard[]> {
    console.log('📐 Starting Hough transform line detection...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Detect lines using simplified Hough transform
    const lines = this.detectLines(imageData);
    
    // Find rectangular intersections
    const rectangles = this.findRectangularIntersections(lines, canvas.width, canvas.height);
    
    return rectangles.map((rect, index) => ({
      id: `hough-${index}-${Date.now()}`,
      bounds: rect.bounds,
      confidence: rect.confidence,
      aspectRatio: rect.bounds.width / rect.bounds.height,
      corners: [
        { x: rect.bounds.x, y: rect.bounds.y },
        { x: rect.bounds.x + rect.bounds.width, y: rect.bounds.y },
        { x: rect.bounds.x + rect.bounds.width, y: rect.bounds.y + rect.bounds.height },
        { x: rect.bounds.x, y: rect.bounds.y + rect.bounds.height }
      ],
      lineStrength: rect.lineStrength,
      rectangularScore: rect.rectangularScore
    }));
  }

  private detectLines(imageData: ImageData): Array<{
    x1: number; y1: number; x2: number; y2: number;
    angle: number; strength: number;
  }> {
    const { width, height, data } = imageData;
    const edges = this.detectEdges(data, width, height);
    const lines: Array<{
      x1: number; y1: number; x2: number; y2: number;
      angle: number; strength: number;
    }> = [];

    // Simplified Hough transform for horizontal and vertical lines
    const threshold = 50;
    const minLineLength = 60;

    // Detect horizontal lines
    for (let y = 0; y < height; y += 2) {
      let lineStart = -1;
      let lineStrength = 0;
      
      for (let x = 0; x < width; x++) {
        if (edges[y * width + x] > threshold) {
          if (lineStart === -1) {
            lineStart = x;
            lineStrength = edges[y * width + x];
          } else {
            lineStrength += edges[y * width + x];
          }
        } else {
          if (lineStart !== -1 && x - lineStart >= minLineLength) {
            lines.push({
              x1: lineStart, y1: y,
              x2: x - 1, y2: y,
              angle: 0,
              strength: lineStrength / (x - lineStart)
            });
          }
          lineStart = -1;
          lineStrength = 0;
        }
      }
    }

    // Detect vertical lines
    for (let x = 0; x < width; x += 2) {
      let lineStart = -1;
      let lineStrength = 0;
      
      for (let y = 0; y < height; y++) {
        if (edges[y * width + x] > threshold) {
          if (lineStart === -1) {
            lineStart = y;
            lineStrength = edges[y * width + x];
          } else {
            lineStrength += edges[y * width + x];
          }
        } else {
          if (lineStart !== -1 && y - lineStart >= minLineLength) {
            lines.push({
              x1: x, y1: lineStart,
              x2: x, y2: y - 1,
              angle: 90,
              strength: lineStrength / (y - lineStart)
            });
          }
          lineStart = -1;
          lineStrength = 0;
        }
      }
    }

    return lines.filter(line => line.strength > 30);
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): number[] {
    const edges = new Array(width * height).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Convert to grayscale
        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // Sobel edge detection
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const upIdx = ((y - 1) * width + x) * 4;
        const downIdx = ((y + 1) * width + x) * 4;
        
        const left = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const right = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
        const up = (data[upIdx] + data[upIdx + 1] + data[upIdx + 2]) / 3;
        const down = (data[downIdx] + data[downIdx + 1] + data[downIdx + 2]) / 3;
        
        const gx = right - left;
        const gy = down - up;
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        edges[y * width + x] = magnitude;
      }
    }
    
    return edges;
  }

  private findRectangularIntersections(
    lines: Array<{ x1: number; y1: number; x2: number; y2: number; angle: number; strength: number }>,
    width: number,
    height: number
  ): Array<{
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
    lineStrength: number;
    rectangularScore: number;
  }> {
    const rectangles = [];
    const horizontalLines = lines.filter(line => line.angle === 0);
    const verticalLines = lines.filter(line => line.angle === 90);

    // Find intersections between horizontal and vertical lines to form rectangles
    for (let i = 0; i < horizontalLines.length - 1; i++) {
      for (let j = i + 1; j < horizontalLines.length; j++) {
        const hLine1 = horizontalLines[i];
        const hLine2 = horizontalLines[j];
        
        // Skip if lines are too close
        if (Math.abs(hLine1.y1 - hLine2.y1) < 60) continue;
        
        for (let k = 0; k < verticalLines.length - 1; k++) {
          for (let l = k + 1; l < verticalLines.length; l++) {
            const vLine1 = verticalLines[k];
            const vLine2 = verticalLines[l];
            
            // Skip if lines are too close
            if (Math.abs(vLine1.x1 - vLine2.x1) < 40) continue;
            
            // Check if lines can form a rectangle
            const rect = this.checkRectangleFormation(hLine1, hLine2, vLine1, vLine2);
            
            if (rect) {
              const aspectRatio = rect.width / rect.height;
              
              if (Math.abs(aspectRatio - this.TARGET_ASPECT_RATIO) <= this.ASPECT_TOLERANCE) {
                const area = rect.width * rect.height;
                
                if (area >= this.MIN_CARD_AREA) {
                  const avgLineStrength = (hLine1.strength + hLine2.strength + vLine1.strength + vLine2.strength) / 4;
                  
                  rectangles.push({
                    bounds: rect,
                    confidence: Math.min(0.9, avgLineStrength / 100),
                    lineStrength: avgLineStrength,
                    rectangularScore: 0.85
                  });
                }
              }
            }
          }
        }
      }
    }

    return rectangles
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6); // Top 6 candidates
  }

  private checkRectangleFormation(
    hLine1: { x1: number; y1: number; x2: number; y2: number },
    hLine2: { x1: number; y1: number; x2: number; y2: number },
    vLine1: { x1: number; y1: number; x2: number; y2: number },
    vLine2: { x1: number; y1: number; x2: number; y2: number }
  ): { x: number; y: number; width: number; height: number } | null {
    // Check if lines can form a proper rectangle
    const tolerance = 10;
    
    // Horizontal lines should overlap with vertical lines
    const h1OverlapsV1 = this.linesOverlap(hLine1, vLine1, tolerance);
    const h1OverlapsV2 = this.linesOverlap(hLine1, vLine2, tolerance);
    const h2OverlapsV1 = this.linesOverlap(hLine2, vLine1, tolerance);
    const h2OverlapsV2 = this.linesOverlap(hLine2, vLine2, tolerance);
    
    if (h1OverlapsV1 && h1OverlapsV2 && h2OverlapsV1 && h2OverlapsV2) {
      const x = Math.min(vLine1.x1, vLine2.x1);
      const y = Math.min(hLine1.y1, hLine2.y1);
      const width = Math.abs(vLine2.x1 - vLine1.x1);
      const height = Math.abs(hLine2.y1 - hLine1.y1);
      
      return { x, y, width, height };
    }
    
    return null;
  }

  private linesOverlap(
    line1: { x1: number; y1: number; x2: number; y2: number },
    line2: { x1: number; y1: number; x2: number; y2: number },
    tolerance: number
  ): boolean {
    // Check if a horizontal line overlaps with a vertical line within tolerance
    if (line1.y1 === line1.y2) { // line1 is horizontal
      return (line1.x1 <= line2.x1 + tolerance && line1.x2 >= line2.x1 - tolerance) &&
             (line2.y1 <= line1.y1 + tolerance && line2.y2 >= line1.y1 - tolerance);
    } else { // line1 is vertical
      return (line2.x1 <= line1.x1 + tolerance && line2.x2 >= line1.x1 - tolerance) &&
             (line1.y1 <= line2.y1 + tolerance && line1.y2 >= line2.y1 - tolerance);
    }
  }
}

export const houghTransformDetector = new HoughTransformDetector();