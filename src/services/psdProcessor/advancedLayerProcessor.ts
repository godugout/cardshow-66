import { readPsd } from 'ag-psd';

export interface AdvancedLayerData {
  id: string;
  name: string;
  imageUrl: string;
  originalImageUrl: string; // Full size, no resizing
  thumbnailUrl: string; // Small preview for UI
  bounds: { left: number; top: number; right: number; bottom: number };
  originalBounds: { left: number; top: number; right: number; bottom: number };
  opacity: number;
  blendMode: string;
  isVisible: boolean;
  type: 'image' | 'text' | 'shape' | 'group' | 'adjustment';
  hasTransparency: boolean;
  layerEffects?: any;
  textData?: {
    content: string;
    fontSize: number;
    fontFamily: string;
    color: string;
  };
}

export interface AdvancedPSDData {
  width: number;
  height: number;
  layers: AdvancedLayerData[];
  compositeImageUrl: string; // Full composite with all visible layers
  metadata: {
    colorMode: string;
    bitsPerChannel: number;
    resolution?: number;
  };
}

export class AdvancedLayerProcessor {
  async processPSDFile(file: File): Promise<AdvancedPSDData> {
    console.log('Starting advanced PSD processing:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const psd = readPsd(arrayBuffer, { skipLayerImageData: false, skipCompositeImageData: false });
    
    if (!psd) {
      throw new Error('Failed to parse PSD file');
    }

    console.log('PSD parsed successfully:', {
      width: psd.width,
      height: psd.height,
      layerCount: psd.children?.length || 0
    });

    // Extract layers with proper positioning and no forced resizing
    const layers = await this.extractAdvancedLayers(psd);
    
    // Generate composite image showing current layer visibility state
    const compositeImageUrl = await this.generateCompositeImage(psd, layers);

    const advancedPSDData: AdvancedPSDData = {
      width: psd.width || 0,
      height: psd.height || 0,
      layers,
      compositeImageUrl,
      metadata: {
        colorMode: psd.colorMode?.toString() || 'RGB',
        bitsPerChannel: psd.bitsPerChannel || 8,
        resolution: psd.imageResources?.resolutionInfo?.horizontalResolution
      }
    };

    console.log('Advanced PSD processing completed:', {
      totalLayers: layers.length,
      layersWithImages: layers.filter(l => l.imageUrl).length
    });

    return advancedPSDData;
  }

  private async extractAdvancedLayers(psd: any): Promise<AdvancedLayerData[]> {
    const layers: AdvancedLayerData[] = [];
    
    if (!psd.children) return layers;

    for (let i = 0; i < psd.children.length; i++) {
      const layer = psd.children[i];
      
      try {
        const layerData = await this.processLayer(layer, i, psd.width, psd.height);
        if (layerData) {
          layers.push(layerData);
        }
      } catch (error) {
        console.warn(`Failed to process layer ${i} (${layer.name}):`, error);
      }
    }

    return layers;
  }

  private async processLayer(layer: any, index: number, psdWidth: number, psdHeight: number): Promise<AdvancedLayerData | null> {
    const bounds = {
      left: layer.left || 0,
      top: layer.top || 0,
      right: layer.right || (layer.left || 0) + (layer.canvas?.width || 0),
      bottom: layer.bottom || (layer.top || 0) + (layer.canvas?.height || 0)
    };

    // Determine layer type
    const layerType = this.determineLayerType(layer);
    
    // Extract text data if it's a text layer
    const textData = layerType === 'text' ? this.extractTextData(layer) : undefined;

    let imageUrl = '';
    let originalImageUrl = '';
    let thumbnailUrl = '';
    let hasTransparency = false;

    // Only process image data if the layer has a canvas
    if (layer.canvas && !layer.hidden) {
      const { original, thumbnail, hasAlpha } = await this.extractLayerImages(layer, bounds, psdWidth, psdHeight);
      imageUrl = original;
      originalImageUrl = original;
      thumbnailUrl = thumbnail;
      hasTransparency = hasAlpha;
    }

    const layerData: AdvancedLayerData = {
      id: `layer_${index}`,
      name: layer.name || `Layer ${index + 1}`,
      imageUrl,
      originalImageUrl,
      thumbnailUrl,
      bounds,
      originalBounds: { ...bounds },
      opacity: (layer.opacity !== undefined ? layer.opacity : 255) / 255,
      blendMode: layer.blendMode || 'normal',
      isVisible: !layer.hidden,
      type: layerType,
      hasTransparency,
      layerEffects: layer.effects,
      textData
    };

    return layerData;
  }

  private determineLayerType(layer: any): AdvancedLayerData['type'] {
    if (layer.text) return 'text';
    if (layer.children && layer.children.length > 0) return 'group';
    if (layer.adjustment) return 'adjustment';
    if (layer.canvas) return 'image';
    return 'shape';
  }

  private extractTextData(layer: any): AdvancedLayerData['textData'] | undefined {
    if (!layer.text) return undefined;

    try {
      const text = layer.text;
      return {
        content: text.text || '',
        fontSize: text.style?.fontSize || 12,
        fontFamily: text.style?.fontName || 'Arial',
        color: this.rgbToHex(text.style?.fillColor) || '#000000'
      };
    } catch (error) {
      console.warn('Failed to extract text data:', error);
      return undefined;
    }
  }

  private rgbToHex(color: any): string {
    if (!color) return '#000000';
    try {
      const r = Math.round((color.r || 0) * 255);
      const g = Math.round((color.g || 0) * 255);
      const b = Math.round((color.b || 0) * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch {
      return '#000000';
    }
  }

  private async extractLayerImages(layer: any, bounds: any, psdWidth: number, psdHeight: number) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Use the actual layer dimensions, no forced resizing
    const layerWidth = layer.canvas.width;
    const layerHeight = layer.canvas.height;
    
    canvas.width = layerWidth;
    canvas.height = layerHeight;

    // Draw the layer exactly as it is
    ctx.clearRect(0, 0, layerWidth, layerHeight);
    ctx.drawImage(layer.canvas, 0, 0);

    // Check for transparency
    const imageData = ctx.getImageData(0, 0, layerWidth, layerHeight);
    let hasAlpha = false;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255) {
        hasAlpha = true;
        break;
      }
    }

    // Generate original size image (PNG to preserve transparency)
    const originalImageUrl = canvas.toDataURL('image/png', 1.0);

    // Generate thumbnail (max 128px but maintain aspect ratio)
    const thumbnailUrl = this.createThumbnail(canvas, 128);

    return {
      original: originalImageUrl,
      thumbnail: thumbnailUrl,
      hasAlpha
    };
  }

  private createThumbnail(sourceCanvas: HTMLCanvasElement, maxSize: number): string {
    const thumbnailCanvas = document.createElement('canvas');
    const ctx = thumbnailCanvas.getContext('2d');
    
    if (!ctx) return '';

    const { width, height } = sourceCanvas;
    const aspectRatio = width / height;

    let thumbWidth, thumbHeight;
    if (width > height) {
      thumbWidth = Math.min(width, maxSize);
      thumbHeight = thumbWidth / aspectRatio;
    } else {
      thumbHeight = Math.min(height, maxSize);
      thumbWidth = thumbHeight * aspectRatio;
    }

    thumbnailCanvas.width = thumbWidth;
    thumbnailCanvas.height = thumbHeight;

    ctx.drawImage(sourceCanvas, 0, 0, thumbWidth, thumbHeight);
    return thumbnailCanvas.toDataURL('image/png', 0.8);
  }

  private async generateCompositeImage(psd: any, layers: AdvancedLayerData[]): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    canvas.width = psd.width;
    canvas.height = psd.height;

    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visible layers in order
    for (const layer of layers) {
      if (layer.isVisible && layer.imageUrl) {
        try {
          const img = await this.loadImage(layer.imageUrl);
          
          // Set layer opacity and blend mode
          ctx.globalAlpha = layer.opacity;
          ctx.globalCompositeOperation = this.getCanvasBlendMode(layer.blendMode);
          
          // Draw layer at correct position
          ctx.drawImage(
            img, 
            layer.bounds.left, 
            layer.bounds.top,
            layer.bounds.right - layer.bounds.left,
            layer.bounds.bottom - layer.bounds.top
          );
        } catch (error) {
          console.warn(`Failed to draw layer ${layer.name}:`, error);
        }
      }
    }

    // Reset context
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    return canvas.toDataURL('image/png', 1.0);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private getCanvasBlendMode(psdBlendMode: string): GlobalCompositeOperation {
    const blendModeMap: Record<string, GlobalCompositeOperation> = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'soft-light': 'soft-light',
      'hard-light': 'hard-light',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'darken': 'darken',
      'lighten': 'lighten'
    };
    
    return blendModeMap[psdBlendMode] || 'source-over';
  }
}

export const advancedLayerProcessor = new AdvancedLayerProcessor();