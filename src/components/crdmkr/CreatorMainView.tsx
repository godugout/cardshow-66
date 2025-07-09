import React from 'react';
import { StudioCardPreview } from '@/components/studio/enhanced/components/StudioCardPreview';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { CardData } from '@/types/card';
import type { CreatorState } from './CardCreatorLayout';

interface CreatorMainViewProps {
  card: CardData;
  state: CreatorState;
  onStateUpdate: (updates: Partial<CreatorState>) => void;
  onImageUpload: (imageUrl: string) => void;
  onFrameSelect: (frameId: string) => void;
}

export const CreatorMainView: React.FC<CreatorMainViewProps> = ({
  card,
  state,
  onStateUpdate,
  onImageUpload,
  onFrameSelect
}) => {
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // Create object URL for immediate preview
        const objectUrl = URL.createObjectURL(files[0]);
        onImageUpload(objectUrl);
      }
    };
    input.click();
  };

  // Create modified card data with uploaded image
  const cardWithUploadedImage = {
    ...card,
    image_url: state.uploadedImage || card.image_url
  };

  return (
    <div className="relative flex flex-col items-center justify-center max-w-2xl mx-auto">
      {/* Card Container with integrated upload */}
      <div className="relative">
        <StudioCardPreview
          uploadedImage={state.uploadedImage}
          selectedFrame={state.selectedFrame}
          orientation="portrait"
          show3DPreview={true}
          cardName={card.title}
          onImageUpload={handleImageUpload}
          effects={{
            metallic: state.currentSide === 'front' ? state.frontEffects.metallic || 0 : state.backEffects.metallic || 0,
            holographic: state.currentSide === 'front' ? state.frontEffects.holographic || 0 : state.backEffects.holographic || 0,
            chrome: state.currentSide === 'front' ? state.frontEffects.chrome || 0 : state.backEffects.chrome || 0,
            crystal: state.currentSide === 'front' ? state.frontEffects.crystal || 0 : state.backEffects.crystal || 0,
            vintage: state.currentSide === 'front' ? state.frontEffects.vintage || 0 : state.backEffects.vintage || 0,
            prismatic: state.currentSide === 'front' ? state.frontEffects.prismatic || 0 : state.backEffects.prismatic || 0,
            interference: state.currentSide === 'front' ? state.frontEffects.interference || 0 : state.backEffects.interference || 0,
            rainbow: state.currentSide === 'front' ? state.frontEffects.rainbow || 0 : state.backEffects.rainbow || 0,
          }}
          material={state.currentSide === 'front' ? state.frontMaterial : state.backMaterial}
          lighting={state.currentSide === 'front' ? state.frontLighting : state.backLighting}
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