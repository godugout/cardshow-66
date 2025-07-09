import React, { useCallback, useEffect, useRef } from 'react';
import { EnhancedCardContainer } from '@/components/viewer/EnhancedCardContainer';
import { StudioCardPreview } from '@/components/studio/enhanced/components/StudioCardPreview';
import { EffectProvider, useEffectContext } from '@/components/viewer/contexts/EffectContext';
import { CardEffectsLayer } from '@/components/viewer/components/CardEffectsLayer';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, Maximize, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useResponsiveLayout, getResponsiveCardSize } from './hooks/useResponsiveLayout';
import type { CardData } from '@/types/card';
import type { CreatorState } from './types/CreatorState';

interface EffectInteractiveContainerProps {
  children: React.ReactNode;
  className?: string;
  currentEffects: Record<string, number>;
}

const EffectInteractiveContainer: React.FC<EffectInteractiveContainerProps> = ({ 
  children, 
  className,
  currentEffects 
}) => {
  const effectContext = useEffectContext();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!effectContext) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    effectContext.setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (effectContext) {
      effectContext.setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (effectContext) {
      effectContext.setIsHovering(false);
    }
  };

  return (
    <div 
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

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
  const effectContextRef = useRef<any>(null);
  const { screenWidth, screenHeight, isMobile } = useResponsiveLayout();
  const cardSize = getResponsiveCardSize(screenWidth, screenHeight);

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

  // Effect context values that update based on current state
  const effectContextValue = {
    holographic: { intensity: currentEffects.holographic || 0 },
    chrome: { intensity: currentEffects.chrome || 0 },
    crystal: { intensity: currentEffects.crystal || 0 },
    metallic: { intensity: currentEffects.metallic || 0 },
    vintage: { intensity: currentEffects.vintage || 0 },
    prismatic: { intensity: currentEffects.prismatic || 0 },
    rainbow: { intensity: currentEffects.rainbow || 0 }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* Card Container with integrated upload - Responsive sizing */}
      <div className="relative flex-1 flex items-center justify-center w-full">
        {/* Enhanced Card with Effects */}
        <EffectProvider
          key={`${state.currentSide}-${JSON.stringify(currentEffects)}`} // Force re-render when effects change
          initialEffects={effectContextValue}
          initialValues={{
            showEffects: true,
            isHovering: false,
            materialSettings: {
              metalness: 0.5,
              roughness: 0.3,
              clearcoat: 0.1,
              transmission: 0,
              reflectivity: 80
            }
          }}
        >
          <EffectInteractiveContainer 
            className="relative overflow-hidden rounded-xl w-full h-full flex items-center justify-center"
            currentEffects={currentEffects}
          >
            {state.uploadedImage && state.currentSide === 'front' ? (
              <EnhancedCardContainer
                card={card}
                width={cardSize.width}
                height={cardSize.height}
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

            {/* Visual Effects Layer */}
            <CardEffectsLayer />
            
            {/* Upload overlay for uploaded images */}
            {state.uploadedImage && (
              <button
                onClick={handleImageUpload}
                className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                title="Change image"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </EffectInteractiveContainer>
        </EffectProvider>
        
        {/* Side Indicator */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {state.currentSide === 'front' ? 'Front Side' : 'Back Side'}
          </div>
        </div>
      </div>

      {/* Card Controls - Responsive layout */}
      <div className="mt-2 sm:mt-4 lg:mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-2 w-full max-w-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 touch-manipulation"
          onClick={() => onStateUpdate({ currentSide: state.currentSide === 'front' ? 'back' : 'front' })}
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border hidden sm:block" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
          <RotateCw className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border hidden sm:block" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border hidden sm:block" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats - Responsive layout */}
      <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground text-center">
        <span>Frame: {state.selectedFrame}</span>
        <span className="hidden sm:block">•</span>
        <span>Material: {state.currentSide === 'front' ? state.frontMaterial : state.backMaterial}</span>
        <span className="hidden sm:block">•</span>
        <span>Effects: {Object.values(state.currentSide === 'front' ? state.frontEffects : state.backEffects).filter(v => v > 0).length} active</span>
      </div>
    </div>
  );
};