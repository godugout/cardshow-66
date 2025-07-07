import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: string;
  resolution: { width: number; height: number };
  quality: number;
  includeEffects: boolean;
  includeWatermark: boolean;
  backgroundColor: string;
  dpi: number;
  bleedMargin: number;
}

export interface CardExportData {
  id: string;
  title: string;
  imageUrl: string;
  effectValues?: Record<string, any>;
  frameConfig?: any;
}

class CardExporterService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async exportCard(cardData: CardExportData, options: ExportOptions): Promise<Blob> {
    // Set canvas dimensions
    this.canvas.width = options.resolution.width;
    this.canvas.height = options.resolution.height;

    // Clear canvas with background
    this.clearCanvas(options.backgroundColor);

    try {
      switch (options.format) {
        case 'png':
          return await this.exportToPNG(cardData, options);
        case 'jpg':
        case 'jpeg':
          return await this.exportToJPEG(cardData, options);
        case 'webp':
          return await this.exportToWebP(cardData, options);
        case 'pdf':
          return await this.exportToPDF(cardData, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export card. Please try again.');
    }
  }

  private clearCanvas(backgroundColor: string) {
    if (backgroundColor === 'transparent') {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = backgroundColor === 'white' ? '#ffffff' : 
                          backgroundColor === 'black' ? '#000000' : backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private async exportToPNG(cardData: CardExportData, options: ExportOptions): Promise<Blob> {
    await this.renderCard(cardData, options);
    
    return new Promise(resolve => {
      this.canvas.toBlob(blob => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  private async exportToJPEG(cardData: CardExportData, options: ExportOptions): Promise<Blob> {
    await this.renderCard(cardData, options);
    
    return new Promise(resolve => {
      this.canvas.toBlob(blob => {
        resolve(blob!);
      }, 'image/jpeg', options.quality / 100);
    });
  }

  private async exportToWebP(cardData: CardExportData, options: ExportOptions): Promise<Blob> {
    await this.renderCard(cardData, options);
    
    return new Promise(resolve => {
      this.canvas.toBlob(blob => {
        resolve(blob!);
      }, 'image/webp', options.quality / 100);
    });
  }

  private async exportToPDF(cardData: CardExportData, options: ExportOptions): Promise<Blob> {
    await this.renderCard(cardData, options);
    
    // Calculate PDF dimensions in mm
    const mmWidth = (options.resolution.width / options.dpi) * 25.4;
    const mmHeight = (options.resolution.height / options.dpi) * 25.4;
    
    const pdf = new jsPDF({
      orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [mmWidth, mmHeight]
    });

    // Convert canvas to image data
    const imgData = this.canvas.toDataURL('image/png');
    
    // Add bleed margin if specified
    const bleedMm = (options.bleedMargin / options.dpi) * 25.4;
    
    pdf.addImage(
      imgData, 
      'PNG', 
      bleedMm, 
      bleedMm, 
      mmWidth - (bleedMm * 2), 
      mmHeight - (bleedMm * 2)
    );

    // Add crop marks for print
    if (options.bleedMargin > 0) {
      this.addCropMarks(pdf, mmWidth, mmHeight, bleedMm);
    }

    return pdf.output('blob');
  }

  private addCropMarks(pdf: jsPDF, width: number, height: number, bleed: number) {
    const cropLength = 5; // 5mm crop marks
    
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    
    // Top-left corner
    pdf.line(0, bleed, cropLength, bleed);
    pdf.line(bleed, 0, bleed, cropLength);
    
    // Top-right corner
    pdf.line(width - cropLength, bleed, width, bleed);
    pdf.line(width - bleed, 0, width - bleed, cropLength);
    
    // Bottom-left corner
    pdf.line(0, height - bleed, cropLength, height - bleed);
    pdf.line(bleed, height - cropLength, bleed, height);
    
    // Bottom-right corner
    pdf.line(width - cropLength, height - bleed, width, height - bleed);
    pdf.line(width - bleed, height - cropLength, width - bleed, height);
  }

  private async renderCard(cardData: CardExportData, options: ExportOptions): Promise<void> {
    // Load and draw the main card image
    if (cardData.imageUrl) {
      const img = await this.loadImage(cardData.imageUrl);
      
      // Calculate scaling to fit canvas while maintaining aspect ratio
      const scale = Math.min(
        this.canvas.width / img.width,
        this.canvas.height / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (this.canvas.width - scaledWidth) / 2;
      const y = (this.canvas.height - scaledHeight) / 2;
      
      this.ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    }

    // Apply effects if enabled
    if (options.includeEffects && cardData.effectValues) {
      await this.applyEffects(cardData.effectValues, options);
    }

    // Add watermark if enabled
    if (options.includeWatermark) {
      this.addWatermark();
    }

    // Add frame/border effects
    if (cardData.frameConfig) {
      await this.applyFrame(cardData.frameConfig);
    }
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private async applyEffects(effectValues: Record<string, any>, options: ExportOptions) {
    // Apply holographic effect
    if (effectValues.holographic?.intensity > 0) {
      this.applyHolographicEffect(effectValues.holographic.intensity);
    }

    // Apply metallic effect
    if (effectValues.metallic?.intensity > 0) {
      this.applyMetallicEffect(effectValues.metallic.intensity);
    }

    // Apply chrome effect
    if (effectValues.chrome?.intensity > 0) {
      this.applyChromeEffect(effectValues.chrome.intensity);
    }

    // Apply foil effect
    if (effectValues.foil?.intensity > 0) {
      this.applyFoilEffect(effectValues.foil.intensity);
    }
  }

  private applyHolographicEffect(intensity: number) {
    // Create holographic gradient overlay
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, `rgba(255, 0, 255, ${intensity * 0.003})`);
    gradient.addColorStop(0.5, `rgba(0, 255, 255, ${intensity * 0.002})`);
    gradient.addColorStop(1, `rgba(255, 255, 0, ${intensity * 0.003})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private applyMetallicEffect(intensity: number) {
    // Create metallic sheen overlay
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, `rgba(200, 200, 200, 0)`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.004})`);
    gradient.addColorStop(1, `rgba(200, 200, 200, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private applyChromeEffect(intensity: number) {
    // Create chrome reflection effect
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.005})`);
    gradient.addColorStop(0.3, `rgba(200, 200, 200, ${intensity * 0.002})`);
    gradient.addColorStop(0.7, `rgba(100, 100, 100, ${intensity * 0.002})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${intensity * 0.005})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private applyFoilEffect(intensity: number) {
    // Create foil shimmer effect
    const shimmerGradient = this.ctx.createRadialGradient(
      this.canvas.width * 0.3, this.canvas.height * 0.3, 0,
      this.canvas.width * 0.7, this.canvas.height * 0.7, this.canvas.width
    );
    shimmerGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.006})`);
    shimmerGradient.addColorStop(0.5, `rgba(255, 215, 0, ${intensity * 0.004})`);
    shimmerGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    
    this.ctx.fillStyle = shimmerGradient;
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private addWatermark() {
    const text = 'CRD';
    const fontSize = Math.min(this.canvas.width, this.canvas.height) * 0.05;
    
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';
    
    const padding = fontSize * 0.5;
    this.ctx.fillText(
      text, 
      this.canvas.width - padding, 
      this.canvas.height - padding
    );
  }

  private async applyFrame(frameConfig: any) {
    // Apply frame overlay if frame image is available
    if (frameConfig.imageUrl) {
      try {
        const frameImg = await this.loadImage(frameConfig.imageUrl);
        this.ctx.drawImage(frameImg, 0, 0, this.canvas.width, this.canvas.height);
      } catch (error) {
        console.warn('Failed to load frame image:', error);
      }
    }
  }

  // Utility method for batch export
  async exportMultipleCards(
    cards: CardExportData[], 
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob[]> {
    const results: Blob[] = [];
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const blob = await this.exportCard(card, options);
      results.push(blob);
      
      if (onProgress) {
        onProgress(((i + 1) / cards.length) * 100);
      }
    }
    
    return results;
  }

  // Download utility
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const cardExporter = new CardExporterService();