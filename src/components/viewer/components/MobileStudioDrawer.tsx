
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ProgressiveCustomizePanel } from './ProgressiveCustomizePanel';
import type { EffectValues } from '../hooks/useEnhancedCardEffects';
import type { EnvironmentScene, LightingPreset, MaterialSettings } from '../types';

interface MobileStudioDrawerProps {
  selectedScene: EnvironmentScene;
  selectedLighting: LightingPreset;
  effectValues: EffectValues;
  overallBrightness: number[];
  interactiveLighting: boolean;
  materialSettings: MaterialSettings;
  isFullscreen: boolean;
  onSceneChange: (scene: EnvironmentScene) => void;
  onLightingChange: (lighting: LightingPreset) => void;
  onEffectChange: (effectId: string, parameterId: string, value: number | boolean | string) => void;
  onResetAllEffects: () => void;
  onBrightnessChange: (value: number[]) => void;
  onInteractiveLightingToggle: () => void;
  onMaterialSettingsChange: (settings: MaterialSettings) => void;
  onToggleFullscreen: () => void;
  onDownload: () => void;
  onShare?: () => void;
  card: any;
  selectedPresetId?: string;
  onPresetSelect: (presetId: string) => void;
  onApplyCombo: (combo: any) => void;
  isApplyingPreset?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileStudioDrawer: React.FC<MobileStudioDrawerProps> = ({
  selectedScene,
  selectedLighting,
  effectValues,
  overallBrightness,
  interactiveLighting,
  materialSettings,
  isFullscreen,
  onSceneChange,
  onLightingChange,
  onEffectChange,
  onResetAllEffects,
  onBrightnessChange,
  onInteractiveLightingToggle,
  onMaterialSettingsChange,
  onToggleFullscreen,
  onDownload,
  onShare,
  card,
  selectedPresetId,
  onPresetSelect,
  onApplyCombo,
  isApplyingPreset = false,
  isOpen,
  onOpenChange
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="bg-black bg-opacity-70 hover:bg-opacity-80 backdrop-blur border border-white/20 text-white px-6 py-3"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          <span className="text-base font-medium">Open Studio</span>
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="bg-black bg-opacity-95 backdrop-blur-lg border-white/10 max-h-[85vh]">
        <DrawerHeader className="border-b border-white/10">
          <DrawerTitle className="text-white text-lg font-semibold flex items-center">
            <Sparkles className="w-5 h-5 text-crd-green mr-2" />
            Enhanced Studio
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full max-w-none">
            <ProgressiveCustomizePanel
              selectedScene={selectedScene}
              selectedLighting={selectedLighting}
              effectValues={effectValues}
              overallBrightness={overallBrightness}
              interactiveLighting={interactiveLighting}
              materialSettings={materialSettings}
              isFullscreen={isFullscreen}
              onSceneChange={onSceneChange}
              onLightingChange={onLightingChange}
              onEffectChange={onEffectChange}
              onResetAllEffects={onResetAllEffects}
              onBrightnessChange={onBrightnessChange}
              onInteractiveLightingToggle={onInteractiveLightingToggle}
              onMaterialSettingsChange={onMaterialSettingsChange}
              onToggleFullscreen={onToggleFullscreen}
              onDownload={onDownload}
              onShare={onShare}
              onClose={() => onOpenChange(false)}
              card={card}
              selectedPresetId={selectedPresetId}
              onPresetSelect={onPresetSelect}
              onApplyCombo={onApplyCombo}
              isApplyingPreset={isApplyingPreset}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
