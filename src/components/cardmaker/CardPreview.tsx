import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'effect' | 'frame';
  visible: boolean;
  locked: boolean;
  opacity: number;
  data: any;
}

interface CardData {
  title: string;
  description: string;
  image_url: string;
  rarity: string;
  tags: string[];
}

interface CardPreviewProps {
  card: CardData;
  selectedFrame?: string;
  layers?: Layer[];
  width?: number;
  height?: number;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  selectedFrame,
  layers = [],
  width = 300,
  height = 420,
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      case 'mythic': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-yellow-400/50';
      case 'mythic': return 'shadow-red-400/50';
      case 'epic': return 'shadow-purple-400/50';
      case 'rare': return 'shadow-blue-400/50';
      default: return '';
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div 
        className={`relative bg-gradient-to-br ${getRarityColor(card.rarity)} p-1 rounded-xl shadow-2xl ${getRarityGlow(card.rarity)}`}
        style={{ width, height }}
      >
        {/* Card Border */}
        <div className="w-full h-full bg-card rounded-lg overflow-hidden relative">
          {/* Frame Effect */}
          {selectedFrame && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Frame overlay would go here */}
            </div>
          )}

          {/* Main Image Area */}
          <div className="relative h-3/4 bg-muted overflow-hidden">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            
            {/* Rarity indicator */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {card.rarity}
              </Badge>
            </div>
          </div>

          {/* Card Info Section */}
          <div className="h-1/4 p-3 bg-background/95 backdrop-blur-sm">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm line-clamp-1 text-foreground">
                  {card.title || 'Untitled Card'}
                </h3>
                {card.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {card.description}
                  </p>
                )}
              </div>
              
              {/* Tags */}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {card.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{card.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Layer Effects */}
          {layers.filter(layer => layer.visible).map((layer, index) => (
            <div
              key={layer.id}
              className="absolute inset-0 pointer-events-none"
              style={{ 
                opacity: layer.opacity,
                zIndex: 5 + index
              }}
            >
              {/* Layer rendering logic would go here based on layer.type and layer.data */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};