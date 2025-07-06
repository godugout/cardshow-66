import React from 'react';
import { CardEffects } from '@/types/template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface VisualEffectsPanelProps {
  effects: CardEffects;
  onEffectsChange: (effects: CardEffects) => void;
  userProgress: {
    cardsCreated: number;
    subscriptionTier: string;
  };
}

export const VisualEffectsPanel: React.FC<VisualEffectsPanelProps> = ({
  effects,
  onEffectsChange,
  userProgress
}) => {
  const effectsConfig = [
    {
      key: 'holographic' as keyof CardEffects,
      name: 'Holographic',
      description: 'Rainbow shimmer effect',
      unlockRequirement: { type: 'cards-created', value: 3 },
      cssClass: 'holographic-effect'
    },
    {
      key: 'chrome' as keyof CardEffects,
      name: 'Chrome',
      description: 'Metallic chrome finish',
      unlockRequirement: { type: 'cards-created', value: 5 },
      cssClass: 'chrome-effect'
    },
    {
      key: 'foil' as keyof CardEffects,
      name: 'Foil',
      description: 'Reflective foil highlights',
      unlockRequirement: { type: 'default', value: 'always' },
      cssClass: 'foil-effect'
    }
  ];

  const isEffectUnlocked = (effect: typeof effectsConfig[0]) => {
    if (effect.unlockRequirement.type === 'default') {
      return true;
    }
    
    if (effect.unlockRequirement.type === 'cards-created') {
      return userProgress.cardsCreated >= (effect.unlockRequirement.value as number);
    }
    
    return false;
  };

  const handleEffectToggle = (effectKey: keyof CardEffects, value: boolean) => {
    onEffectsChange({
      ...effects,
      [effectKey]: value
    });
  };

  const handleIntensityChange = (value: number[]) => {
    onEffectsChange({
      ...effects,
      intensity: value[0]
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Visual Effects
          <Badge variant="outline">
            {userProgress.cardsCreated} cards created
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {effectsConfig.map((effect) => {
          const isUnlocked = isEffectUnlocked(effect);
          const isActive = effects[effect.key] as boolean;

          return (
            <div key={effect.key} className={`space-y-3 ${!isUnlocked ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {effect.name}
                    {!isUnlocked && <Badge variant="outline" className="text-xs">🔒</Badge>}
                  </Label>
                  <p className="text-xs text-muted-foreground">{effect.description}</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => handleEffectToggle(effect.key, checked)}
                  disabled={!isUnlocked}
                />
              </div>
              
              {!isUnlocked && (
                <Badge variant="outline" className="text-xs">
                  Unlock at {effect.unlockRequirement.value} cards
                </Badge>
              )}
            </div>
          );
        })}

        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">Effect Intensity</Label>
          <div className="space-y-2">
            <Slider
              value={[effects.intensity]}
              onValueChange={handleIntensityChange}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle</span>
              <span>{Math.round(effects.intensity * 100)}%</span>
              <span>Intense</span>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div 
            className={`
              h-24 bg-gradient-to-br from-muted to-muted/50 rounded-lg 
              flex items-center justify-center text-muted-foreground
              ${effects.holographic ? 'holographic-effect' : ''}
              ${effects.chrome ? 'chrome-effect' : ''}
              ${effects.foil ? 'foil-effect' : ''}
            `}
            style={{
              '--effect-intensity': effects.intensity
            } as React.CSSProperties}
          >
            <span className="text-sm font-medium">Effect Preview</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};