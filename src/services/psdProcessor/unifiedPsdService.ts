
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
    if (!psd || typeof psd !== 'object') return false;
    if (!Array.isArray(psd.layers)) return false;
    if (typeof psd.width !== 'number' || typeof psd.height !== 'number') return false;
    if (!psd.extractedImages || !Array.isArray(psd.extractedImages)) return false;
    return true;
  }
}

export const unifiedPSDService = new UnifiedPSDService();
