import React, { useCallback } from 'react';
import { EnhancedCardContainer } from '@/components/viewer/EnhancedCardContainer';
import { StudioCardPreview } from '@/components/studio/enhanced/components/StudioCardPreview';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, Maximize, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { CardData } from '@/types/card';
import type { CreatorState } from './types/CreatorState';

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
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          onStateUpdate({ 
            uploadedImage: imageUrl,
            currentSide: 'front' // Switch to front when image is uploaded
          });
          toast.success('Image uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [onStateUpdate]);

  const getCurrentEffects = () => {
    return state.currentSide === 'front' ? state.frontEffects : state.backEffects;
  };

  const currentEffects = getCurrentEffects();

  return (
    <div className="relative flex flex-col items-center justify-center max-w-2xl mx-auto">
      {/* Card Container with integrated upload */}
      <div className="relative">
        {/* Enhanced Card with Effects */}
        <div 
          className="relative"
          style={{
            filter: `
              brightness(${1 + (currentEffects.vintage || 0) * 0.1})
              contrast(${1 + (currentEffects.chrome || 0) * 0.3})
              saturate(${1 + (currentEffects.prismatic || 0) * 0.5})
              hue-rotate(${(currentEffects.rainbow || 0) * 60}deg)
            `,
            background: currentEffects.holographic > 0 ? 
              `linear-gradient(45deg, 
                rgba(255, 107, 74, ${currentEffects.holographic * 0.2}), 
                rgba(79, 255, 176, ${currentEffects.holographic * 0.2}), 
                rgba(74, 144, 255, ${currentEffects.holographic * 0.2})
              )` : 'transparent',
            borderRadius: '12px',
            boxShadow: currentEffects.metallic > 0 ? 
              `0 0 ${currentEffects.metallic * 20}px rgba(255, 255, 255, ${currentEffects.metallic * 0.3})` : 'none'
          }}
        >
          {state.uploadedImage && state.currentSide === 'front' ? (
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
          ) : (
            <StudioCardPreview
              uploadedImage={state.uploadedImage}
              selectedFrame={state.selectedFrame}
              orientation="portrait"
              show3DPreview={false}
              cardName={card.title || "New Card"}
              onImageUpload={handleImageUpload}
            />
          )}
          
          {/* Upload overlay for uploaded images */}
          {state.uploadedImage && (
            <button
              onClick={handleImageUpload}
              className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
              title="Change image"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
        
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