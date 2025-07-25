import { pipeline, env } from '@huggingface/transformers';
import { DETECTION_CONFIG } from '../cardExtractor/config';

// Configure transformers for optimal performance
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface AIDetectedCard {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  aspectRatio: number;
  label: string;
  area: number;
}

export interface AIDetectionResult {
  cards: AIDetectedCard[];
  processingTime: number;
  method: 'ai-vision' | 'object-detection' | 'segmentation';
  backgroundRemoved: boolean;
}

export class AIVisionCardDetector {
  private objectDetector: any = null;
  private segmentationModel: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🤖 Initializing AI Vision models...');
    
    try {
      // Initialize object detection model for rectangular objects
      this.objectDetector = await pipeline(
        'object-detection',
        'facebook/detr-resnet-50',
        { device: 'webgpu' }
      );
      
      console.log('✅ Object detection model loaded');
      this.isInitialized = true;
    } catch (error) {
      console.warn('⚠️ WebGPU not available, falling back to CPU');
      try {
        this.objectDetector = await pipeline(
          'object-detection',
          'facebook/detr-resnet-50'
        );
        this.isInitialized = true;
      } catch (fallbackError) {
        console.error('❌ Failed to load AI models:', fallbackError);
        throw new Error('AI vision models failed to load');
      }
    }
  }

  async detectCards(image: HTMLImageElement, file: File): Promise<AIDetectionResult> {
    const startTime = Date.now();
    
    await this.initialize();
    
    console.log('🔍 Starting AI-powered card detection...');
    
    // Try background removal first for better detection
    let processedImage = image;
    let backgroundRemoved = false;
    
    try {
      const backgroundRemovedImage = await this.removeBackgroundForDetection(image);
      if (backgroundRemovedImage) {
        processedImage = backgroundRemovedImage;
        backgroundRemoved = true;
        console.log('✅ Background removal successful');
      }
    } catch (error) {
      console.log('⚠️ Background removal failed, using original image');
    }

    // Run object detection
    const detectionResults = await this.runObjectDetection(processedImage);
    
    // Filter and process results for card-like objects
    const cardCandidates = this.filterCardLikeObjects(detectionResults, image);
    
    // Apply geometric constraints for trading cards
    const finalCards = this.applyCardConstraints(cardCandidates, image);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`🏁 AI detection completed in ${processingTime}ms, found ${finalCards.length} cards`);
    
    return {
      cards: finalCards,
      processingTime,
      method: 'ai-vision',
      backgroundRemoved
    };
  }

  private async removeBackgroundForDetection(image: HTMLImageElement): Promise<HTMLImageElement | null> {
    try {
      // Use the background removal service for better object isolation
      const { removeBackground, loadImage } = await import('@/lib/backgroundRemoval');
      
      // Convert HTMLImageElement to blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      });
      
      const processedBlob = await removeBackground(image);
      return await loadImage(processedBlob);
    } catch (error) {
      console.warn('Background removal failed:', error);
      return null;
    }
  }

  private async runObjectDetection(image: HTMLImageElement): Promise<any[]> {
    try {
      // Convert image to canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Resize image if too large for efficient processing
      const maxDim = 800;
      const scale = Math.min(maxDim / image.width, maxDim / image.height, 1);
      
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL for the model
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Run object detection
      const results = await this.objectDetector(imageData);
      
      // Scale results back to original image size
      return results.map((result: any) => ({
        ...result,
        box: {
          xmin: result.box.xmin / scale,
          ymin: result.box.ymin / scale,
          xmax: result.box.xmax / scale,
          ymax: result.box.ymax / scale
        }
      }));
    } catch (error) {
      console.error('Object detection failed:', error);
      return [];
    }
  }

  private filterCardLikeObjects(detectionResults: any[], originalImage: HTMLImageElement): AIDetectedCard[] {
    const cardCandidates: AIDetectedCard[] = [];
    
    for (const detection of detectionResults) {
      const { box, label, score } = detection;
      
      // Calculate dimensions
      const width = box.xmax - box.xmin;
      const height = box.ymax - box.ymin;
      const aspectRatio = width / height;
      const area = width * height;
      
      // Filter for rectangular objects that could be cards
      const isRectangularObject = [
        'book', 'laptop', 'cell phone', 'remote', 'keyboard',
        'mouse', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
      ].includes(label) || label.includes('card');
      
      // Check if object has card-like properties
      const hasCardAspectRatio = Math.abs(aspectRatio - DETECTION_CONFIG.TARGET_ASPECT_RATIO) < 0.3;
      const hasReasonableSize = area > (originalImage.width * originalImage.height * 0.01);
      const hasMinimumConfidence = score > 0.3;
      
      if ((isRectangularObject || hasCardAspectRatio) && hasReasonableSize && hasMinimumConfidence) {
        cardCandidates.push({
          x: box.xmin,
          y: box.ymin,
          width,
          height,
          confidence: score,
          aspectRatio,
          label,
          area
        });
      }
    }
    
    return cardCandidates;
  }

  private applyCardConstraints(candidates: AIDetectedCard[], originalImage: HTMLImageElement): AIDetectedCard[] {
    const imageArea = originalImage.width * originalImage.height;
    
    return candidates
      .filter(card => {
        // Area constraints
        const areaRatio = card.area / imageArea;
        if (areaRatio < DETECTION_CONFIG.MIN_CARD_AREA_RATIO || 
            areaRatio > DETECTION_CONFIG.MAX_CARD_AREA_RATIO) {
          return false;
        }
        
        // Aspect ratio constraints (more lenient for AI detection)
        const aspectDiff = Math.abs(card.aspectRatio - DETECTION_CONFIG.TARGET_ASPECT_RATIO);
        if (aspectDiff > DETECTION_CONFIG.ASPECT_TOLERANCE * 1.5) {
          return false;
        }
        
        // Minimum confidence
        if (card.confidence < 0.4) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, DETECTION_CONFIG.MAX_FINAL_RESULTS);
  }

  // Fallback method using edge detection with AI enhancement
  async detectWithEdgeEnhancement(image: HTMLImageElement): Promise<AIDetectedCard[]> {
    console.log('🔧 Using edge-enhanced detection as fallback...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const edges = this.sobelEdgeDetection(imageData.data, canvas.width, canvas.height);
    
    // Find rectangular regions using enhanced edge detection
    const rectangles = this.findRectangularRegionsEnhanced(edges, canvas.width, canvas.height);
    
    return rectangles
      .map(rect => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        confidence: rect.confidence,
        aspectRatio: rect.width / rect.height,
        label: 'detected-rectangle',
        area: rect.width * rect.height
      }))
      .filter(card => {
        const aspectDiff = Math.abs(card.aspectRatio - DETECTION_CONFIG.TARGET_ASPECT_RATIO);
        return aspectDiff <= DETECTION_CONFIG.ASPECT_TOLERANCE;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, DETECTION_CONFIG.MAX_FINAL_RESULTS);
  }

  private sobelEdgeDetection(data: Uint8ClampedArray, width: number, height: number): number[] {
    const edges = new Array(width * height).fill(0);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            
            gx += gray * sobelX[kernelIdx];
            gy += gray * sobelY[kernelIdx];
          }
        }
        
        edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return edges;
  }

  private findRectangularRegionsEnhanced(edges: number[], width: number, height: number): Array<{x: number, y: number, width: number, height: number, confidence: number}> {
    const rectangles: Array<{x: number, y: number, width: number, height: number, confidence: number}> = [];
    const threshold = 30;
    
    // More intelligent sampling based on card aspect ratio
    const targetRatio = DETECTION_CONFIG.TARGET_ASPECT_RATIO;
    const stepSize = Math.max(3, Math.floor(Math.min(width, height) / 60));
    
    for (let y = 5; y < height * 0.9; y += stepSize) {
      for (let x = 5; x < width * 0.9; x += stepSize) {
        // Test multiple scales but focus on card-like ratios
        const scales = [0.1, 0.15, 0.2, 0.25, 0.3];
        
        for (const scale of scales) {
          const w = Math.floor(width * scale);
          const h = Math.floor(w / targetRatio); // Maintain card aspect ratio
          
          if (x + w >= width || y + h >= height) continue;
          
          const edgeScore = this.calculateRectangleEdgeScore(x, y, w, h, edges, width);
          
          if (edgeScore > threshold) {
            rectangles.push({
              x, y, width: w, height: h,
              confidence: Math.min(edgeScore / 100, 0.9)
            });
          }
        }
      }
    }
    
    return rectangles;
  }

  private calculateRectangleEdgeScore(x: number, y: number, w: number, h: number, edges: number[], width: number): number {
    let score = 0;
    let samples = 0;
    const step = Math.max(1, Math.floor(Math.min(w, h) / 20));
    
    // Top and bottom edges
    for (let i = x; i < x + w; i += step) {
      if (y >= 0 && y < edges.length / width && (y + h) >= 0 && (y + h) < edges.length / width) {
        score += edges[y * width + i] || 0;
        score += edges[(y + h) * width + i] || 0;
        samples += 2;
      }
    }
    
    // Left and right edges  
    for (let i = y; i < y + h; i += step) {
      if (i >= 0 && i * width + x < edges.length && i * width + (x + w) < edges.length) {
        score += edges[i * width + x] || 0;
        score += edges[i * width + (x + w)] || 0;
        samples += 2;
      }
    }
    
    return samples > 0 ? score / samples : 0;
  }
}

export const aiVisionCardDetector = new AIVisionCardDetector();