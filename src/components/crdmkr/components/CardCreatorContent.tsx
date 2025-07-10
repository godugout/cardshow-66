import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CreatorMainView } from '../CreatorMainView';
import { CreatorRightSidebar } from '../CreatorRightSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useCardEditor } from '@/hooks/useCardEditor';
import type { CreatorState, CardCreatorLayoutProps } from '../types/CreatorState';

interface CardCreatorContentProps extends CardCreatorLayoutProps {
  creatorState: CreatorState;
  updateCreatorState: (updates: Partial<CreatorState>) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  getCurrentEffects: () => Record<string, number>;
  getCurrentMaterial: () => string;
  getCurrentLighting: () => CreatorState['frontLighting'];
  updateCurrentEffects: (effects: Record<string, number>) => void;
  updateCurrentMaterial: (material: string) => void;
  updateCurrentLighting: (lighting: CreatorState['frontLighting']) => void;
}

export const CardCreatorContent: React.FC<CardCreatorContentProps> = ({
  card,
  creatorState,
  updateCreatorState,
  rightSidebarOpen,
  setRightSidebarOpen,
  getCurrentEffects,
  getCurrentMaterial,
  getCurrentLighting,
  updateCurrentEffects,
  updateCurrentMaterial,
  updateCurrentLighting
}) => {
  // Initialize card editor with existing card data
  const cardEditor = useCardEditor({
    initialData: card
  });

  // Initialize creator state with saved effects if available
  useEffect(() => {
    if (card?.design_metadata?.effects && Object.keys(creatorState.frontEffects).length === 0) {
      const savedEffects = card.design_metadata.effects;
      updateCreatorState({
        frontEffects: { ...savedEffects },
        backEffects: { ...savedEffects }
      });
    }
  }, [card?.design_metadata?.effects]);

  // Sync effects changes to card design metadata
  useEffect(() => {
    const currentEffects = getCurrentEffects();
    
    // Convert effects to the format expected by the advanced effects system
    const normalizedEffects = Object.keys(currentEffects).reduce((acc, key) => {
      acc[key] = currentEffects[key] || 0;
      return acc;
    }, {} as Record<string, number>);
    
    cardEditor.updateDesignMetadata('effects', normalizedEffects);
  }, [JSON.stringify(getCurrentEffects())]);

  // Sync material changes to card design metadata
  useEffect(() => {
    const currentMaterial = getCurrentMaterial();
    cardEditor.updateDesignMetadata('material', currentMaterial);
  }, [getCurrentMaterial()]);

  // Sync lighting changes to card design metadata
  useEffect(() => {
    const currentLighting = getCurrentLighting();
    cardEditor.updateDesignMetadata('lighting', currentLighting);
  }, [JSON.stringify(getCurrentLighting())]);

  // Expose cardEditor functions for the layout to use
  useEffect(() => {
    // Store cardEditor save function in window for access from layout
    (window as any).cardEditorSave = cardEditor.saveCard;
    
    // Store function to update image URL
    (window as any).cardEditorUpdateImage = (imageUrl: string) => {
      cardEditor.updateCardField('image_url', imageUrl);
    };
    
    return () => {
      delete (window as any).cardEditorSave;
      delete (window as any).cardEditorUpdateImage;
    };
  }, [cardEditor.saveCard, cardEditor.updateCardField]);
  return (
    <div className="flex-1 flex overflow-hidden bg-background relative z-10">
      {/* Mobile Layout: Stack vertically on small screens */}
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Main Card View - Full width on mobile, flex-1 on desktop */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-8 min-h-[50vh] lg:min-h-full">
          <CreatorMainView
            card={{
              ...card,
              ...cardEditor.cardData,
              created_at: card?.created_at || new Date().toISOString(),
              creator_id: cardEditor.cardData.creator_id || card?.creator_id || ''
            }}
            state={creatorState}
            onStateUpdate={updateCreatorState}
          />
        </div>

        {/* Mobile Bottom Sheet & Desktop Sidebar */}
        <div className={cn(
          "relative bg-card border-border transition-all duration-300",
          // Mobile: Bottom sheet that slides up
          "lg:border-l border-t lg:border-t-0",
          // Desktop: Traditional sidebar
          rightSidebarOpen 
            ? "w-full lg:w-80 xl:w-96 h-[50vh] lg:h-full" 
            : "w-full lg:w-14 h-16 lg:h-full"
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
          
          {/* Responsive Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute z-10 bg-background border border-border shadow-lg transition-all",
              "lg:-left-4 lg:top-4",
              "top-2 left-1/2 -translate-x-1/2 lg:translate-x-0"
            )}
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          >
            <div className="lg:hidden">
              {rightSidebarOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </div>
            <div className="hidden lg:block">
              {rightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};