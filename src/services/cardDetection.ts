
import { cropImageFromFile, adjustCropBounds, type CropBounds } from './imageCropper';

export interface DetectedCard {
  id: string;
  originalImageId: string;
  originalImageUrl: string;
  croppedImageUrl: string;
  bounds: CropBounds;
  confidence: number;
  metadata: {
    detectedAt: Date;
    processingTime: number;
    cardType?: string;
  };
}

export interface CardDetectionResult {
  sessionId: string;
  originalImage: File;
  detectedCards: DetectedCard[];
  processingTime: number;
  totalDetected: number;
}

// Smart card detection function for initial crop positioning
const detectCardBounds = (img: HTMLImageElement): CropBounds => {
  // Standard trading card aspect ratio: 2.5" x 3.5" = 0.714
  const cardAspectRatio = 2.5 / 3.5;
  
  // Start with 40% of image width for better initial sizing
  let cardWidth = img.naturalWidth * 0.4;
  let cardHeight = cardWidth / cardAspectRatio;
  
  // If calculated height is too large, constrain by height instead
  if (cardHeight > img.naturalHeight * 0.7) {
    cardHeight = img.naturalHeight * 0.7;
    cardWidth = cardHeight * cardAspectRatio;
  }
  
  // Center the crop box initially
  const x = (img.naturalWidth - cardWidth) / 2;
  const y = (img.naturalHeight - cardHeight) / 2;
  
  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
    width: Math.round(Math.min(cardWidth, img.naturalWidth)),
    height: Math.round(Math.min(cardHeight, img.naturalHeight))
  };
};

export const detectCardsInImage = async (
  imageFile: File, 
  sessionId?: string
): Promise<CardDetectionResult> => {
  const startTime = Date.now();
  
  console.log(`Starting smart card detection for ${imageFile.name}`);
  
  // Create image URL for display
  const originalImageUrl = URL.createObjectURL(imageFile);
  
  // Load image to get dimensions and detect bounds
  const img = await loadImageFromFile(imageFile);
  
  // Try to use the enhanced detection first to see if any cards are actually present
  const { enhancedCardDetection } = await import('@/services/cardExtractor/enhancedDetection');
  
  try {
    const enhancedRegions = await enhancedCardDetection(img, imageFile);
    
    // If enhanced detection found cards, use those results
    if (enhancedRegions.length > 0) {
      console.log(`Enhanced detection found ${enhancedRegions.length} cards`);
      
      const detectedCards: DetectedCard[] = [];
      
      for (let i = 0; i < Math.min(enhancedRegions.length, 3); i++) {
        const region = enhancedRegions[i];
        
        // Create actual cropped image
        let croppedImageUrl: string;
        try {
          croppedImageUrl = await cropImageFromFile(imageFile, {
            bounds: {
              x: region.x,
              y: region.y,
              width: region.width,
              height: region.height
            },
            outputWidth: 300,
            outputHeight: 420,
            quality: 0.95,
            format: 'jpeg'
          });
        } catch (error) {
          console.warn('Failed to crop image, using original:', error);
          croppedImageUrl = originalImageUrl;
        }
        
        detectedCards.push({
          id: `card-${Date.now()}-${i}`,
          originalImageId: imageFile.name,
          originalImageUrl,
          croppedImageUrl,
          bounds: {
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height
          },
          confidence: region.confidence,
          metadata: {
            detectedAt: new Date(),
            processingTime: Date.now() - startTime,
            cardType: 'Trading Card'
          }
        });
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`Smart detection completed in ${processingTime}ms with ${detectedCards.length} cards`);
      
      return {
        sessionId: sessionId || `session-${Date.now()}`,
        originalImage: imageFile,
        detectedCards,
        processingTime,
        totalDetected: detectedCards.length
      };
    }
  } catch (error) {
    console.warn('Enhanced detection failed, no fallback will be used:', error);
  }
  
  // If no cards were detected, return empty result
  console.log('No cards detected in image');
  
  return {
    sessionId: sessionId || `session-${Date.now()}`,
    originalImage: imageFile,
    detectedCards: [],
    processingTime: Date.now() - startTime,
    totalDetected: 0
  };
};

export const detectCardsInImages = async (
  imageFiles: File[]
): Promise<CardDetectionResult[]> => {
  console.log(`Processing ${imageFiles.length} images for smart card detection`);
  
  const results: CardDetectionResult[] = [];
  const sessionId = `batch-${Date.now()}`;
  
  // Process images sequentially to show realistic progress
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    console.log(`Processing image ${i + 1}/${imageFiles.length}: ${file.name}`);
    
    try {
      const result = await detectCardsInImage(file, sessionId);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Continue processing other images
    }
  }
  
  console.log(`Batch processing complete: ${results.length} images processed`);
  return results;
};

// Helper function to load image from file
const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src); // Clean up
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Re-crop a card with new boundaries
export const recropCard = async (
  originalFile: File,
  bounds: CropBounds
): Promise<string> => {
  console.log('Re-cropping card with new bounds:', bounds);
  
  return cropImageFromFile(originalFile, {
    bounds,
    outputWidth: 300,
    outputHeight: 420,
    quality: 0.95,
    format: 'jpeg'
  });
};

// Export the smart bounds detection for use in other components
export { detectCardBounds };
