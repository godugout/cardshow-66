import React, { useCallback, useEffect, useRef } from 'react';
import { CRDRenderer } from '@/components/crd/CRDRenderer';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, Maximize, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useResponsiveLayout, getResponsiveCardSize } from './hooks/useResponsiveLayout';
import { useCustomAuth } from '@/features/auth/hooks/useCustomAuth';
import { supabase } from '@/integrations/supabase/client';
import type { CardData } from '@/types/card';
import type { CreatorState } from './types/CreatorState';
import type { CRDCard } from '@/types/crd';


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
  const { user } = useCustomAuth();
  const cardSize = getResponsiveCardSize(screenWidth, screenHeight);

  // Upload function to Supabase storage
  const uploadFileToStorage = useCallback(async (file: File) => {
    if (!user) {
      throw new Error('Please sign in to upload files');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/card-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('card-assets')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('card-assets')
      .getPublicUrl(filePath);

    return {
      path: data.path,
      publicUrl,
      metadata: {
        originalName: file.name,
        size: file.size,
        type: file.type,
        publicUrl
      }
    };
  }, [user]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          toast.success('Uploading image...');
          
          // Upload to Supabase storage
          const uploadResult = await uploadFileToStorage(file);
          
          if (uploadResult?.publicUrl) {
            onStateUpdate({ 
              uploadedImage: uploadResult.publicUrl,
              currentSide: 'front' // Switch to front when image is uploaded
            });
            // Also update the card editor with the new image
            if ((window as any).cardEditorUpdateImage) {
              (window as any).cardEditorUpdateImage(uploadResult.publicUrl);
            }
            toast.success('Image uploaded successfully!');
          } else {
            throw new Error('Failed to get public URL');
          }
        } catch (error) {
          console.error('Upload failed:', error);
          // Fallback to local file reading for demo purposes
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            onStateUpdate({ 
              uploadedImage: imageUrl,
              currentSide: 'front'
            });
            // Also update the card editor with the new image
            if ((window as any).cardEditorUpdateImage) {
              (window as any).cardEditorUpdateImage(imageUrl);
            }
            toast.success('Image loaded locally (demo mode)');
          };
          reader.readAsDataURL(file);
        }
      }
    };
    
    input.click();
  }, [onStateUpdate, uploadFileToStorage]);

  const getCurrentEffects = () => {
    return state.currentSide === 'front' ? state.frontEffects : state.backEffects;
  };

  const getCurrentMaterial = () => {
    return state.currentSide === 'front' ? state.frontMaterial : state.backMaterial;
  };

  const getCurrentLighting = () => {
    return state.currentSide === 'front' ? state.frontLighting : state.backLighting;
  };

  const currentEffects = getCurrentEffects();

  // Convert CardData to CRDCard format
  const materialType = getCurrentMaterial();
  const validMaterialType = ['standard', 'holographic', 'metallic', 'chrome', 'crystal', 'vintage', 'prismatic'].includes(materialType) 
    ? materialType as 'standard' | 'holographic' | 'metallic' | 'chrome' | 'crystal' | 'vintage' | 'prismatic'
    : 'standard';

  const lighting = getCurrentLighting();
  
  const crdCard: CRDCard = {
    id: card.id || 'temp-id',
    frameId: state.selectedFrame,
    imageUrl: state.uploadedImage || card.image_url || null,
    title: card.title,
    description: card.description || '',
    material: {
      type: validMaterialType,
      intensity: 50,
      surface: {
        roughness: 50,
        reflectivity: 50,
        transparency: 0
      },
      animation: {
        enabled: false,
        speed: 1,
        pattern: 'linear'
      }
    },
    effects: {
      metallic: currentEffects.metallic || 0,
      holographic: currentEffects.holographic || 0,
      chrome: currentEffects.chrome || 0,
      crystal: currentEffects.crystal || 0,
      vintage: currentEffects.vintage || 0,
      prismatic: currentEffects.prismatic || 0,
      interference: currentEffects.interference || 0,
      rainbow: currentEffects.rainbow || 0,
      particles: Boolean(currentEffects.particles),
      glow: {
        enabled: false,
        color: '#ffffff',
        intensity: 0,
        radius: 10
      },
      distortion: {
        enabled: false,
        type: 'wave',
        intensity: 0
      }
    },
    lighting: {
      environment: 'studio',
      intensity: lighting.intensity || 80,
      color: {
        primary: '#ffffff',
        secondary: '#f0f0f0',
        ambient: '#e8e8e8'
      },
      shadows: {
        enabled: true,
        softness: 70,
        intensity: 40
      },
      highlights: {
        enabled: true,
        sharpness: 60,
        intensity: 80
      }
    }
  };

  // Debug logs
  console.log('CreatorMainView - CRD Card:', {
    hasImage: !!crdCard.imageUrl,
    currentSide: state.currentSide,
    effects: crdCard.effects,
    uploadedImage: state.uploadedImage
  });

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* Card Container with integrated upload - Responsive sizing */}
      <div className="relative flex-1 flex items-center justify-center w-full">
        {/* CRD Renderer with simplified image handling */}
        <div className="relative">
          <CRDRenderer
            card={crdCard}
            width={cardSize.width}
            height={cardSize.height}
            className="relative"
            interactive={true}
            performance="medium"
            key={`crd-${state.currentSide}-${JSON.stringify(currentEffects)}-${state.uploadedImage || 'default'}`}
          />
          
          {/* Upload overlay - only show if no image */}
          {!crdCard.imageUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-50 rounded-xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-crd-orange/20 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-crd-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Your Image</h3>
                  <p className="text-sm text-gray-300">Click to add an image to your card</p>
                </div>
                <Button
                  onClick={handleImageUpload}
                  className="bg-crd-orange hover:bg-crd-orange/90 text-white"
                >
                  Choose Image
                </Button>
              </div>
            </div>
          )}
          
          {/* Upload overlay for existing images */}
          {crdCard.imageUrl && (
            <button
              onClick={handleImageUpload}
              className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
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