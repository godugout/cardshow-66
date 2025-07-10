import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Crown, Star, Circle } from 'lucide-react';

interface Frame {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  preview: string;
  description: string;
}

interface FrameSelectorProps {
  selectedFrame?: string;
  onFrameSelect: (frameId: string) => void;
}

// Demo frames data
const frames: Frame[] = [
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    rarity: 'common',
    preview: '/api/placeholder/150/210',
    description: 'Simple, clean border with subtle gradients'
  },
  {
    id: 'vintage-gold',
    name: 'Vintage Gold',
    rarity: 'uncommon',
    preview: '/api/placeholder/150/210',
    description: 'Classic gold frame with ornate details'
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    rarity: 'rare',
    preview: '/api/placeholder/150/210',
    description: 'Futuristic neon accents with digital effects'
  },
  {
    id: 'holographic-prism',
    name: 'Holographic Prism',
    rarity: 'epic',
    preview: '/api/placeholder/150/210',
    description: 'Rainbow holographic effects with prism patterns'
  },
  {
    id: 'legendary-crown',
    name: 'Legendary Crown',
    rarity: 'legendary',
    preview: '/api/placeholder/150/210',
    description: 'Majestic golden crown with jewel inlays'
  },
  {
    id: 'mythic-cosmos',
    name: 'Mythic Cosmos',
    rarity: 'mythic',
    preview: '/api/placeholder/150/210',
    description: 'Cosmic energy with swirling galaxy effects'
  }
];

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrame,
  onFrameSelect
}) => {
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Circle className="w-3 h-3" />;
      case 'uncommon': return <Circle className="w-3 h-3" />;
      case 'rare': return <Star className="w-3 h-3" />;
      case 'epic': return <Sparkles className="w-3 h-3" />;
      case 'legendary': return <Crown className="w-3 h-3" />;
      case 'mythic': return <Crown className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'uncommon': return 'text-green-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      case 'mythic': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Choose a frame style for your card
      </div>

      <ScrollArea className="h-64">
        <div className="grid grid-cols-2 gap-2">
          {frames.map((frame) => (
            <Button
              key={frame.id}
              variant={selectedFrame === frame.id ? 'default' : 'outline'}
              className="h-auto p-2 flex flex-col items-center gap-2"
              onClick={() => onFrameSelect(frame.id)}
            >
              {/* Frame Preview */}
              <div className="w-16 h-22 bg-muted rounded border overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-card to-muted flex items-center justify-center">
                  <div className={`${getRarityColor(frame.rarity)}`}>
                    {getRarityIcon(frame.rarity)}
                  </div>
                </div>
              </div>

              {/* Frame Info */}
              <div className="text-center">
                <div className="text-xs font-medium line-clamp-1">
                  {frame.name}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs mt-1 ${getRarityColor(frame.rarity)}`}
                >
                  {frame.rarity}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Selected Frame Details */}
      {selectedFrame && (
        <div className="bg-muted rounded-lg p-3">
          {(() => {
            const frame = frames.find(f => f.id === selectedFrame);
            return frame ? (
              <div className="text-center">
                <h4 className="font-medium text-sm mb-1">{frame.name}</h4>
                <p className="text-xs text-muted-foreground">{frame.description}</p>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Frame Categories */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>💡 <strong>Tip:</strong> Higher rarity frames have more visual effects</div>
        <div>🎨 More frame styles coming soon!</div>
      </div>
    </div>
  );
};