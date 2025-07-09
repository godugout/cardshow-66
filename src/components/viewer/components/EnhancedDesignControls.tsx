import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Image, Type, Palette } from 'lucide-react';
import { CardSide } from '../EnhancedCardContainer';
import { CRD_FRAMES } from '@/data/crdFrames';

interface EnhancedDesignControlsProps {
  currentSide: CardSide;
  isFlipped: boolean;
  onUpdateSide: (side: 'front' | 'back', updates: Partial<CardSide>) => void;
}

export const EnhancedDesignControls: React.FC<EnhancedDesignControlsProps> = ({
  currentSide,
  isFlipped,
  onUpdateSide
}) => {
  const sideType = isFlipped ? 'back' : 'front';

  return (
    <div className="space-y-4">
      {/* Frame Selection */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Frame Selection
        </h4>
        
        <div className="grid grid-cols-1 gap-2">
          {CRD_FRAMES.map((frame) => (
            <Button
              key={frame.id}
              variant={currentSide.frameId === frame.id ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateSide(sideType, { frameId: frame.id })}
              className="justify-between"
            >
              <span>{frame.name}</span>
              <Badge variant="secondary" className="text-xs">
                {frame.rarity}
              </Badge>
            </Button>
          ))}
        </div>
      </Card>

      {/* Side Selection */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Card Side
        </h4>
        
        <div className="text-sm text-muted-foreground mb-2">
          Currently editing: <span className="font-medium text-foreground">
            {isFlipped ? 'Back' : 'Front'}
          </span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Use the flip button to switch between front and back designs
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Quick Actions
        </h4>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateSide(sideType, {
              effects: {
                ...currentSide.effects,
                metallic: 0,
                holographic: 0,
                chrome: 0,
                crystal: 0,
                vintage: 0,
                prismatic: 0,
                interference: 0,
                rainbow: 0,
                particles: false
              }
            })}
            className="w-full"
          >
            Reset Effects
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateSide(sideType, {
              lighting: {
                intensity: 0.5,
                direction: { x: 0.5, y: 0.5 },
                color: '#ffffff',
                environment: 'studio'
              }
            })}
            className="w-full"
          >
            Reset Lighting
          </Button>
        </div>
      </Card>
    </div>
  );
};