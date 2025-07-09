import React from 'react';
import { EnhancedCardContainer } from '@/components/viewer/EnhancedCardContainer';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { CardData } from '@/types/card';
import type { CreatorState } from './CardCreatorLayout';

interface CreatorMainViewProps {
  card: CardData;
  state: CreatorState;
  onStateUpdate: (updates: Partial<CreatorState>) => void;
}

export const CreatorMainView: React.FC<CreatorMainViewProps> = ({
  card,
  state,
  onStateUpdate
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center max-w-2xl mx-auto">
      {/* Card Container */}
      <div className="relative">
        <EnhancedCardContainer
          card={card}
          width={450}
          height={630}
          allowFlip={true}
          showControls={false}
          initialFrontSide={{
            frameId: state.selectedFrame,
            material: state.frontMaterial,
            effects: {
              metallic: state.frontEffects.metallic || 0,
              holographic: state.frontEffects.holographic || 0,
              chrome: state.frontEffects.chrome || 0,
              crystal: state.frontEffects.crystal || 0,
              vintage: state.frontEffects.vintage || 0,
              prismatic: state.frontEffects.prismatic || 0,
              interference: state.frontEffects.interference || 0,
              rainbow: state.frontEffects.rainbow || 0,
              particles: Boolean(state.frontEffects.particles)
            },
            lighting: state.frontLighting
          }}
          initialBackSide={{
            frameId: state.selectedFrame,
            material: state.backMaterial,
            effects: {
              metallic: state.backEffects.metallic || 0,
              holographic: state.backEffects.holographic || 0,
              chrome: state.backEffects.chrome || 0,
              crystal: state.backEffects.crystal || 0,
              vintage: state.backEffects.vintage || 0,
              prismatic: state.backEffects.prismatic || 0,
              interference: state.backEffects.interference || 0,
              rainbow: state.backEffects.rainbow || 0,
              particles: Boolean(state.backEffects.particles)
            },
            lighting: state.backLighting
          }}
        />
        
        {/* Side Indicator */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {state.currentSide === 'front' ? 'Front Side' : 'Back Side'}
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div className="mt-6 flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onStateUpdate({ currentSide: state.currentSide === 'front' ? 'back' : 'front' })}
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RotateCw className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>Frame: {state.selectedFrame}</span>
        <span>•</span>
        <span>Material: {state.currentSide === 'front' ? state.frontMaterial : state.backMaterial}</span>
        <span>•</span>
        <span>Effects: {Object.values(state.currentSide === 'front' ? state.frontEffects : state.backEffects).filter(v => v > 0).length} active</span>
      </div>
    </div>
  );
};