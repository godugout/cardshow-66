import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CreatorMainView } from '../CreatorMainView';
import { CreatorRightSidebar } from '../CreatorRightSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Expose cardEditor save function for the layout to use
  useEffect(() => {
    // Store cardEditor save function in window for access from layout
    (window as any).cardEditorSave = cardEditor.saveCard;
    
    return () => {
      delete (window as any).cardEditorSave;
    };
  }, [cardEditor.saveCard]);
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Card View */}
      <div className="flex-1 flex items-center justify-center p-8">
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

      {/* Right Sidebar */}
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
    </div>
  );
};