
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import type { EnvironmentScene, LightingPreset } from '../types';
import { ENVIRONMENT_SCENES, LIGHTING_PRESETS } from '../constants';
import { getEnvironmentSceneName, getLightingPresetName } from '../types';

interface EnvironmentSectionProps {
  selectedScene: EnvironmentScene;
  selectedLighting: LightingPreset;
  overallBrightness: number[];
  interactiveLighting: boolean;
  onSceneChange: (scene: EnvironmentScene) => void;
  onLightingChange: (lighting: LightingPreset) => void;
  onBrightnessChange: (value: number[]) => void;
  onInteractiveLightingToggle: () => void;
}

export const EnvironmentSection: React.FC<EnvironmentSectionProps> = ({
  selectedScene,
  selectedLighting,
  overallBrightness,
  interactiveLighting,
  onSceneChange,
  onLightingChange,
  onBrightnessChange,
  onInteractiveLightingToggle
}) => {
  const [showEnvironment, setShowEnvironment] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium flex items-center">
          <Sparkles className="w-4 h-4 text-crd-green mr-2" />
          Environment
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowEnvironment(!showEnvironment)} className="text-white hover:text-white">
          {showEnvironment ? 'Hide' : 'Show'}
        </Button>
      </div>
      {showEnvironment && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="scene-select" className="text-white text-sm mb-2 block">
              Scene
            </Label>
            <Select onValueChange={(value) => onSceneChange(value as EnvironmentScene)}>
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                <SelectValue placeholder={getEnvironmentSceneName(selectedScene)} />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20">
                {ENVIRONMENT_SCENES.map((scene) => (
                  <SelectItem key={scene.id} value={scene.id} className="text-white hover:bg-white/10">
                    {scene.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lighting-select" className="text-white text-sm mb-2 block">
              Lighting
            </Label>
            <Select onValueChange={(value) => onLightingChange(value as LightingPreset)}>
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                <SelectValue placeholder={getLightingPresetName(selectedLighting)} />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20">
                {LIGHTING_PRESETS.map((lighting) => (
                  <SelectItem key={lighting.id} value={lighting.id} className="text-white hover:bg-white/10">
                    {lighting.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="brightness-slider" className="text-white text-sm mb-2 block">
              Brightness: {overallBrightness[0]}%
            </Label>
            <Slider
              id="brightness-slider"
              value={overallBrightness}
              max={200}
              step={1}
              onValueChange={onBrightnessChange}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="interactive-lighting" className="text-white text-sm">
              Interactive Lighting
            </Label>
            <Switch
              id="interactive-lighting"
              checked={interactiveLighting}
              onCheckedChange={onInteractiveLightingToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
};
