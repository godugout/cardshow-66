import { supabase } from '@/integrations/supabase/client';

export interface CardMetadata {
  player?: string;
  team?: string;
  sport?: string;
  year?: number;
  brand?: string;
  series?: string;
  cardNumber?: string;
  position?: string;
  rarity?: string;
  isRookie?: boolean;
  stats?: Record<string, any>;
  confidence?: number;
  [key: string]: any; // Add index signature for Json compatibility
}

export interface AnalysisResult {
  metadata: CardMetadata;
  confidence: number;
  source: 'pattern_match' | 'ai_vision' | 'huggingface';
  processingTime: number;
}

export class CardMetadataAnalyzer {
  private async analyzeWithHuggingFace(imageUrl: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('card-metadata-analyzer', {
        body: { imageUrl }
      });

      if (error) throw error;

      return {
        metadata: data.metadata,
        confidence: data.confidence || 0.3,
        source: 'huggingface',
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Hugging Face analysis failed:', error);
      return this.fallbackAnalysis(imageUrl, startTime);
    }
  }

  private async fallbackAnalysis(imageUrl: string, startTime: number): Promise<AnalysisResult> {
    // Enhanced pattern matching and OCR fallback
    const metadata: CardMetadata = {
      confidence: 0.2
    };

    const urlLower = imageUrl.toLowerCase();
    
    // Enhanced pattern matching
    if (urlLower.includes('rookie') || urlLower.includes('rc')) {
      metadata.isRookie = true;
    }

    // Sport detection
    if (urlLower.includes('basketball') || urlLower.includes('nba')) {
      metadata.sport = 'Basketball';
    } else if (urlLower.includes('baseball') || urlLower.includes('mlb')) {
      metadata.sport = 'Baseball';
    } else if (urlLower.includes('football') || urlLower.includes('nfl')) {
      metadata.sport = 'Football';
    } else if (urlLower.includes('hockey') || urlLower.includes('nhl')) {
      metadata.sport = 'Hockey';
    }

    // Brand detection
    const brands = ['topps', 'panini', 'upper-deck', 'bowman', 'fleer', 'donruss'];
    for (const brand of brands) {
      if (urlLower.includes(brand)) {
        metadata.brand = brand.replace('-', ' ').split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        break;
      }
    }

    // Default rarity
    metadata.rarity = 'common';

    return {
      metadata,
      confidence: 0.2,
      source: 'pattern_match',
      processingTime: Date.now() - startTime
    };
  }

  async analyzeCard(imageUrl: string): Promise<AnalysisResult> {
    return this.analyzeWithHuggingFace(imageUrl);
  }

  async saveAnalysisResult(cardId: string, result: AnalysisResult): Promise<void> {
    // Mock implementation
    console.log('Analysis saved for card:', cardId, result);
  }

  async getBrands(): Promise<Array<{ id: string; name: string }>> {
    // Mock implementation
    return [
      { id: '1', name: 'Topps' },
      { id: '2', name: 'Panini' },
      { id: '3', name: 'Upper Deck' }
    ];
  }

  async getTeams(sport?: string): Promise<Array<{ id: string; name: string; sport: string; league: string }>> {
    // Mock implementation
    return [
      { id: '1', name: 'Lakers', sport: 'Basketball', league: 'NBA' },
      { id: '2', name: 'Warriors', sport: 'Basketball', league: 'NBA' },
      { id: '3', name: 'Celtics', sport: 'Basketball', league: 'NBA' }
    ];
  }
}

export const cardMetadataAnalyzer = new CardMetadataAnalyzer();
