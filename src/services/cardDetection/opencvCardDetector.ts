import { DetectedCard } from '../cardDetection';

export interface OpenCVCardDetector {
  detectCards(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<DetectedCard[]>;
}

export class SimpleOpenCVCardDetector implements OpenCVCardDetector {
  async detectCards(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<DetectedCard[]> {
    console.log('🔍 Using Simple OpenCV-like detection...');
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const cards = await this.detectRectangularRegions(imageData, canvas.width, canvas.height);
    
    console.log(`📊 Simple detection found ${cards.length} cards`);
    return cards;
  }

  private async detectRectangularRegions(imageData: ImageData, width: number, height: number): Promise<DetectedCard[]> {
    const data = imageData.data;
    const cards: DetectedCard[] = [];
    
    // Convert to grayscale and apply edge detection
    const gray = this.toGrayscale(data, width, height);
    const edges = this.applySobelEdgeDetection(gray, width, height);
    
    // Find contours and rectangular regions
    const contours = this.findContours(edges, width, height);
    const rectangles = this.filterRectangularContours(contours, width, height);
    
    // Convert to DetectedCard format
    rectangles.forEach((rect, index) => {
      if (this.isValidCardSize(rect, width, height)) {
        cards.push({
          id: `opencv-${index}`,
          originalImageId: `opencv-session-${Date.now()}`,
          bounds: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          confidence: this.calculateConfidence(rect, edges, width, height),
          originalImageUrl: '',
          croppedImageUrl: '',
          metadata: {
            detectedAt: new Date(),
            processingTime: 0,
            cardType: 'trading-card'
          }
        });
      }
    });

    return cards.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  private toGrayscale(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return gray;
  }

  private applySobelEdgeDetection(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(width * height);
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = gray[(y + ky) * width + (x + kx)];
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            gx += pixel * sobelX[kernelIndex];
            gy += pixel * sobelY[kernelIndex];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = Math.min(255, magnitude);
      }
    }
    
    return edges;
  }

  private findContours(edges: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number, width: number, height: number}> {
    const threshold = 100;
    const regions: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // Simple region growing algorithm
    const visited = new Array(width * height).fill(false);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (!visited[index] && edges[index] > threshold) {
          const region = this.growRegion(edges, visited, x, y, width, height, threshold);
          if (region && region.width > 50 && region.height > 50) {
            regions.push(region);
          }
        }
      }
    }
    
    return regions;
  }

  private growRegion(
    edges: Uint8ClampedArray, 
    visited: boolean[], 
    startX: number, 
    startY: number, 
    width: number, 
    height: number, 
    threshold: number
  ): {x: number, y: number, width: number, height: number} | null {
    const stack = [{x: startX, y: startY}];
    const points: {x: number, y: number}[] = [];
    
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    
    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited[index] || edges[index] < threshold) {
        continue;
      }
      
      visited[index] = true;
      points.push({x, y});
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighbors
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
      
      // Limit region size to prevent runaway growth
      if (points.length > 10000) break;
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private filterRectangularContours(contours: Array<{x: number, y: number, width: number, height: number}>, width: number, height: number): Array<{x: number, y: number, width: number, height: number}> {
    return contours.filter(contour => {
      const aspectRatio = contour.width / contour.height;
      const cardAspectRatio = 2.5 / 3.5; // Standard trading card ratio
      
      // Check if aspect ratio is close to card ratio (with tolerance)
      const aspectDiff = Math.abs(aspectRatio - cardAspectRatio);
      const isCardLike = aspectDiff < 0.3;
      
      // Check size constraints
      const minSize = Math.min(width, height) * 0.05;
      const maxSize = Math.min(width, height) * 0.8;
      const isValidSize = contour.width > minSize && contour.height > minSize && 
                         contour.width < maxSize && contour.height < maxSize;
      
      return isCardLike && isValidSize;
    });
  }

  private isValidCardSize(rect: {x: number, y: number, width: number, height: number}, width: number, height: number): boolean {
    const aspectRatio = rect.width / rect.height;
    const cardAspectRatio = 2.5 / 3.5;
    
    return Math.abs(aspectRatio - cardAspectRatio) < 0.4 && 
           rect.width > 50 && rect.height > 50 &&
           rect.x > 0 && rect.y > 0 &&
           rect.x + rect.width < width && 
           rect.y + rect.height < height;
  }

  private calculateConfidence(rect: {x: number, y: number, width: number, height: number}, edges: Uint8ClampedArray, width: number, height: number): number {
    const aspectRatio = rect.width / rect.height;
    const cardAspectRatio = 2.5 / 3.5;
    const aspectScore = 1 - Math.abs(aspectRatio - cardAspectRatio) / cardAspectRatio;
    
    // Calculate edge density around the rectangle border
    let edgeSum = 0;
    let edgeCount = 0;
    
    // Top and bottom edges
    for (let x = rect.x; x < rect.x + rect.width; x++) {
      if (x >= 0 && x < width) {
        if (rect.y >= 0 && rect.y < height) {
          edgeSum += edges[rect.y * width + x];
          edgeCount++;
        }
        if (rect.y + rect.height >= 0 && rect.y + rect.height < height) {
          edgeSum += edges[(rect.y + rect.height) * width + x];
          edgeCount++;
        }
      }
    }
    
    // Left and right edges
    for (let y = rect.y; y < rect.y + rect.height; y++) {
      if (y >= 0 && y < height) {
        if (rect.x >= 0 && rect.x < width) {
          edgeSum += edges[y * width + rect.x];
          edgeCount++;
        }
        if (rect.x + rect.width >= 0 && rect.x + rect.width < width) {
          edgeSum += edges[y * width + (rect.x + rect.width)];
          edgeCount++;
        }
      }
    }
    
    const edgeScore = edgeCount > 0 ? (edgeSum / edgeCount) / 255 : 0;
    
    return Math.min(0.95, (aspectScore * 0.6) + (edgeScore * 0.4));
  }
}