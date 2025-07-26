
import { improvedCardDetector } from '@/services/cardDetection/improvedCardDetection';
import { aiVisionCardDetector } from '@/services/cardDetection/aiVisionCardDetector';
import { calibratedCardDetector } from '@/services/cardDetection/calibratedCardDetector';
import type { DetectedCard } from '@/services/cardDetection/improvedCardDetection';

export interface EnhancedDetectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  corners?: Array<{ x: number; y: number }>;
  aspectRatio?: number;
  edgeStrength?: number;
  geometryScore?: number;
}

export const enhancedCardDetection = async (
  image: HTMLImageElement,
  file: File
): Promise<EnhancedDetectionRegion[]> => {
  console.log('🔍 Starting enhanced card detection with improved algorithm');
  console.log('📊 Image details:', {
    width: image.width,
    height: image.height,
    fileSize: file.size,
    fileName: file.name
  });
  
  try {
    // First try AI vision detection
    console.log('🤖 Attempting AI Vision detection...');
    try {
      const aiResult = await aiVisionCardDetector.detectCards(image, file);
      
      if (aiResult.cards.length > 0) {
        console.log('✅ AI Vision detection successful:', {
          cardsFound: aiResult.cards.length,
          processingTime: aiResult.processingTime,
          method: aiResult.method
        });
        
        // Convert AI results to EnhancedDetectionRegion format
        const enhancedRegions: EnhancedDetectionRegion[] = aiResult.cards.map((card, index) => ({
          x: card.x,
          y: card.y,
          width: card.width,
          height: card.height,
          confidence: card.confidence,
          aspectRatio: card.aspectRatio,
          corners: [
            { x: card.x, y: card.y },
            { x: card.x + card.width, y: card.y },
            { x: card.x + card.width, y: card.y + card.height },
            { x: card.x, y: card.y + card.height }
          ],
          edgeStrength: 0.8,
          geometryScore: card.confidence
        }));
        
        // Store debug info globally if available
        if (typeof window !== 'undefined') {
          (window as any).lastDetectionDebug = {
            method: 'AI Vision',
            processingTime: aiResult.processingTime,
            cardsFound: aiResult.cards.length,
            backgroundRemoved: aiResult.backgroundRemoved,
            rawResults: aiResult.cards
          };
        }
        
        return enhancedRegions;
      }
    } catch (aiError) {
      console.warn('⚠️ AI Vision detection failed, falling back to improved detection:', aiError);
    }
    
    // Use calibrated multi-method detection
    console.log('🎯 Calling calibratedCardDetector.detectCards...');
    const result = await calibratedCardDetector.detectCards(image);
    
    console.log('📊 Calibrated detection result:', {
      cardsFound: result.cards.length,
      processingTime: result.processingTime,
      methodsUsed: result.methodsUsed,
      totalCandidates: result.totalCandidates
    });
    
    // Log detailed card information
    result.cards.forEach((card, index) => {
      console.log(`🎴 Card ${index + 1}:`, {
        position: `${card.bounds.x},${card.bounds.y}`,
        size: `${card.bounds.width}x${card.bounds.height}`,
        confidence: `${Math.round(card.confidence * 100)}%`,
        aspectRatio: card.aspectRatio.toFixed(2),
        method: card.method
      });
    });
    
    // Convert to the expected format
    const regions: EnhancedDetectionRegion[] = result.cards.map(card => ({
      x: card.bounds.x,
      y: card.bounds.y,
      width: card.bounds.width,
      height: card.bounds.height,
      confidence: card.confidence,
      corners: card.corners,
      aspectRatio: card.aspectRatio,
      edgeStrength: card.edgeStrength,
      geometryScore: card.colorVariance || 0.7
    }));
    
    console.log('✅ Enhanced detection complete:', regions.length, 'high-quality regions found');
    console.log('🎯 Detection method used: CALIBRATED MULTI-METHOD ENSEMBLE');
    
    // Store debug info globally for potential debugging
    if (typeof window !== 'undefined') {
      (window as any).lastDetectionDebug = result.debugInfo;
      (window as any).lastDetectionMethod = 'CALIBRATED_MULTI_METHOD_ENSEMBLE';
      console.log('🐛 Debug info stored in window.lastDetectionDebug');
    }
    
    return regions;
  } catch (error) {
    console.error('❌ Improved detection failed:', error);
    
    // Fallback to simple detection
    console.log('🔄 Falling back to simple detection');
    console.log('⚠️ Detection method used: FALLBACK GRID-BASED ALGORITHM');
    if (typeof window !== 'undefined') {
      (window as any).lastDetectionMethod = 'FALLBACK_GRID_ALGORITHM';
    }
    
    return fallbackDetection(image);
  }
};

function fallbackDetection(image: HTMLImageElement): EnhancedDetectionRegion[] {
  console.log('📝 Using fallback detection method');
  
  const regions: EnhancedDetectionRegion[] = [];
  const cardAspectRatio = 2.5 / 3.5;
  
  // Improved fallback with larger, more realistic card sizes
  const scales = [0.25, 0.35, 0.45]; // Much larger scales
  
  scales.forEach((scale, index) => {
    const width = image.width * scale;
    const height = width / cardAspectRatio;
    
    if (height < image.height * 0.8) {
      // Better positioning logic for larger cards
      const positions = [
        { x: image.width * 0.05, y: image.height * 0.05 },
        { x: image.width * 0.55, y: image.height * 0.05 },
        { x: image.width * 0.05, y: image.height * 0.55 },
        { x: image.width * 0.55, y: image.height * 0.55 }
      ];
      
      positions.forEach((pos, posIndex) => {
        const x = Math.max(0, Math.min(image.width - width, pos.x));
        const y = Math.max(0, Math.min(image.height - height, pos.y));
        
        console.log(`📍 Fallback region ${regions.length + 1}:`, {
          position: `${x},${y}`,
          size: `${width}x${height}`,
          confidence: `${Math.round((0.8 - (index * 0.1) - (posIndex * 0.05)) * 100)}%`
        });
        
        regions.push({
          x,
          y,
          width,
          height,
          confidence: 0.8 - (index * 0.1) - (posIndex * 0.05),
          aspectRatio: width / height,
          edgeStrength: 0.6,
          geometryScore: 0.7,
          corners: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
          ]
        });
      });
    }
  });
  
  console.log('📊 Fallback detection complete:', regions.slice(0, 3).length, 'regions generated');
  return regions.slice(0, 3); // Limit fallback results
}
