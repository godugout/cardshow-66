import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CreatorLeftSidebar } from './CreatorLeftSidebar';
import { CreatorRightSidebar } from './CreatorRightSidebar';
import { CreatorMainView } from './CreatorMainView';
import { CreatorHeader } from './CreatorHeader';
import { useCardCreator } from './hooks/useCardCreator';
import type { CardData } from '@/types/card';

export interface CreatorState {
  selectedFrame: string;
  uploadedImage?: string;
  currentSide: 'front' | 'back';
  frontEffects: Record<string, number>;
  backEffects: Record<string, number>;
  frontMaterial: string;
  backMaterial: string;
  frontLighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
  backLighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
}

interface CardCreatorLayoutProps {
  card: CardData;
}

export const CardCreatorLayout: React.FC<CardCreatorLayoutProps> = ({ card }) => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'dual' | 'single-left' | 'single-right'>('dual');
  const { cardData, updateCardData, saveCard, isSaving } = useCardCreator();
  
  const [creatorState, setCreatorState] = useState<CreatorState>({
    selectedFrame: 'oakland-as-donruss',
    currentSide: 'front',
    frontEffects: {
      metallic: 0.2,
      holographic: 0.1,
      chrome: 0,
      crystal: 0,
      vintage: 0.1,
      prismatic: 0,
      interference: 0,
      rainbow: 0
    },
    backEffects: {
      metallic: 0.1,
      holographic: 0.7,
      chrome: 0,
      crystal: 0.3,
      vintage: 0,
      prismatic: 0.4,
      interference: 0.2,
      rainbow: 0.1
    },
    frontMaterial: 'standard',
    backMaterial: 'holographic',
    frontLighting: {
      intensity: 0.6,
      direction: { x: 0.4, y: 0.6 },
      color: '#FF6B4A',
      environment: 'studio'
    },
    backLighting: {
      intensity: 0.8,
      direction: { x: 0.3, y: 0.7 },
      color: '#4FFFB0',
      environment: 'cosmic'
    }
  });

  const updateCreatorState = (updates: Partial<CreatorState>) => {
    setCreatorState(prev => ({ ...prev, ...updates }));
  };

  // Handle save and export actions
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SAVE_CARD') {
        handleSave();
      } else if (event.data.type === 'EXPORT_PNG') {
        handleExport('png');
      } else if (event.data.type === 'EXPORT_PDF') {
        handleExport('pdf');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSave = async () => {
    await saveCard(creatorState);
  };

  const handleExport = (format: string) => {
    // For now, just show a toast - this would be implemented with canvas export
    toast.success(`Exporting as ${format.toUpperCase()}...`);
  };

  const getCurrentEffects = () => {
    return creatorState.currentSide === 'front' ? creatorState.frontEffects : creatorState.backEffects;
  };

  const getCurrentMaterial = () => {
    return creatorState.currentSide === 'front' ? creatorState.frontMaterial : creatorState.backMaterial;
  };

  const getCurrentLighting = () => {
    return creatorState.currentSide === 'front' ? creatorState.frontLighting : creatorState.backLighting;
  };

  const updateCurrentEffects = (effects: Record<string, number>) => {
    if (creatorState.currentSide === 'front') {
      updateCreatorState({ frontEffects: effects });
    } else {
      updateCreatorState({ backEffects: effects });
    }
  };

  const updateCurrentMaterial = (material: string) => {
    if (creatorState.currentSide === 'front') {
      updateCreatorState({ frontMaterial: material });
    } else {
      updateCreatorState({ backMaterial: material });
    }
  };

  const updateCurrentLighting = (lighting: CreatorState['frontLighting']) => {
    if (creatorState.currentSide === 'front') {
      updateCreatorState({ frontLighting: lighting });
    } else {
      updateCreatorState({ backLighting: lighting });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col">
      {/* Header */}
      <CreatorHeader 
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        onSave={handleSave}
        onExport={() => handleExport('png')}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {(layoutMode === 'dual' || layoutMode === 'single-left') && (
          <div className={cn(
            "relative bg-card border-r border-border transition-all duration-300",
            leftSidebarOpen ? "w-80" : "w-14"
          )}>
            <CreatorLeftSidebar
              isOpen={leftSidebarOpen}
              selectedFrame={creatorState.selectedFrame}
              uploadedImage={creatorState.uploadedImage}
              onFrameSelect={(frameId) => updateCreatorState({ selectedFrame: frameId })}
              onImageUpload={(imageUrl) => updateCreatorState({ uploadedImage: imageUrl })}
            />
            
            {/* Left Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-4 top-4 z-10 bg-background border border-border shadow-lg"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            >
              {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Main Card View */}
        <div className="flex-1 flex items-center justify-center p-8">
          <CreatorMainView
            card={card}
            state={creatorState}
            onStateUpdate={updateCreatorState}
          />
        </div>

        {/* Right Sidebar */}
        {(layoutMode === 'dual' || layoutMode === 'single-right') && (
          <div className={cn(
            "relative bg-card border-l border-border transition-all duration-300",
            rightSidebarOpen ? "w-96" : "w-14"
          )}>
            <CreatorRightSidebar
              isOpen={rightSidebarOpen}
              currentSide={creatorState.currentSide}
              effects={getCurrentEffects()}
              material={getCurrentMaterial()}
              lighting={getCurrentLighting()}
              onSideChange={(side) => updateCreatorState({ currentSide: side })}
              onEffectsChange={updateCurrentEffects}
              onMaterialChange={updateCurrentMaterial}
              onLightingChange={updateCurrentLighting}
            />
            
            {/* Right Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-4 top-4 z-10 bg-background border border-border shadow-lg"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              {rightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};