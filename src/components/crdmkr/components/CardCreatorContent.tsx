import React from 'react';
import { cn } from '@/lib/utils';
import { CreatorMainView } from '../CreatorMainView';
import { CreatorRightSidebar } from '../CreatorRightSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Card View */}
      <div className="flex-1 flex items-center justify-center p-8">
        <CreatorMainView
          card={card}
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