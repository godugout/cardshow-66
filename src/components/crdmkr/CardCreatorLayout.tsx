import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CreatorHeader } from './CreatorHeader';
import { CardCreatorContent } from './components/CardCreatorContent';
import { useCardCreator } from './hooks/useCardCreator';
import { useCreatorState } from './hooks/useCreatorState';
import type { CardCreatorLayoutProps } from './types/CreatorState';

export const CardCreatorLayout: React.FC<CardCreatorLayoutProps> = ({ card }) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'dual' | 'single-left' | 'single-right'>('dual');
  const { saveCard } = useCardCreator();
  
  const {
    creatorState,
    updateCreatorState,
    getCurrentEffects,
    getCurrentMaterial,
    getCurrentLighting,
    updateCurrentEffects,
    updateCurrentMaterial,
    updateCurrentLighting
  } = useCreatorState();

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
      <CardCreatorContent
        card={card}
        creatorState={creatorState}
        updateCreatorState={updateCreatorState}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        getCurrentEffects={getCurrentEffects}
        getCurrentMaterial={getCurrentMaterial}
        getCurrentLighting={getCurrentLighting}
        updateCurrentEffects={updateCurrentEffects}
        updateCurrentMaterial={updateCurrentMaterial}
        updateCurrentLighting={updateCurrentLighting}
      />
    </div>
  );
};