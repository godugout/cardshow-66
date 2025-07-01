
import { processEnhancedPSD, EnhancedProcessedPSD } from './enhancedPsdProcessingService';
import { psdProcessingService } from './psdProcessingService';

export interface UnifiedPSDProcessingOptions {
  extractImages?: boolean;
  generateThumbnails?: boolean;
  maxLayerSize?: number;
}

export class UnifiedPSDService {
  async processPSDFile(
    file: File, 
    options: UnifiedPSDProcessingOptions = {}
  ): Promise<EnhancedProcessedPSD> {
    try {
      console.log('Starting unified PSD processing:', file.name);
      
      // First, do basic PSD processing
      const basicProcessedPSD = await psdProcessingService.processPSDFile(file);
      
      // Then enhance with image extraction
      const enhancedPSD = await processEnhancedPSD(file, basicProcessedPSD);
      
      // Validate the result
      if (!this.validateEnhancedPSD(enhancedPSD)) {
        console.error('Enhanced PSD validation failed:', enhancedPSD);
        throw new Error('Invalid PSD processing result');
      }
      
      console.log('Unified PSD processing completed successfully');
      return enhancedPSD;
      
    } catch (error) {
      console.error('Unified PSD processing failed:', error);
      throw new Error(`Failed to process PSD: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateEnhancedPSD(psd: any): psd is EnhancedProcessedPSD {
    if (!psd || typeof psd !== 'object') {
      console.log('Validation failed: not an object');
      return false;
    }
    if (!Array.isArray(psd.layers)) {
      console.log('Validation failed: layers not array');
      return false;
    }
    if (typeof psd.width !== 'number' || typeof psd.height !== 'number') {
      console.log('Validation failed: width/height not numbers');
      return false;
    }
    if (!psd.extractedImages || typeof psd.extractedImages !== 'object') {
      console.log('Validation failed: extractedImages not object');
      return false;
    }
    if (!Array.isArray(psd.extractedImages.layerImages)) {
      console.log('Validation failed: layerImages not array');
      return false;
    }
    if (!(psd.layerPreviews instanceof Map)) {
      console.log('Validation failed: layerPreviews not Map');
      return false;
    }
    return true;
  }
}

export const unifiedPSDService = new UnifiedPSDService();
