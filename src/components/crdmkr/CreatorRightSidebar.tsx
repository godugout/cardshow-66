import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Palette, Sparkles, Sun, Share2, Layers, Zap, Chrome, Gem, Rainbow, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
interface CreatorRightSidebarProps {
  isOpen: boolean;
  currentSide: 'front' | 'back';
  effects: Record<string, number>;
  material: string;
  lighting: {
    intensity: number;
    direction: {
      x: number;
      y: number;
    };
    color: string;
    environment: string;
  };
  onSideChange: (side: 'front' | 'back') => void;
  onEffectsChange: (effects: Record<string, number>) => void;
  onMaterialChange: (material: string) => void;
  onLightingChange: (lighting: any) => void;
}
const materials = [{
  id: 'standard',
  name: 'Standard',
  description: 'Clean, professional finish',
  icon: '📄'
}, {
  id: 'holographic',
  name: 'Holographic',
  description: 'Rainbow reflective surface',
  icon: '🌈'
}, {
  id: 'metallic',
  name: 'Metallic',
  description: 'Chrome-like reflections',
  icon: '⚡'
}, {
  id: 'crystal',
  name: 'Crystal',
  description: 'Glass-like transparency',
  icon: '💎'
}, {
  id: 'matte',
  name: 'Matte',
  description: 'No-glare surface',
  icon: '🖤'
}];
const effectPresets = [{
  name: 'Clean',
  effects: {
    metallic: 0,
    holographic: 0,
    chrome: 0,
    crystal: 0,
    vintage: 0,
    prismatic: 0,
    interference: 0,
    rainbow: 0
  }
}, {
  name: 'Premium',
  effects: {
    metallic: 0.3,
    holographic: 0.2,
    chrome: 0.1,
    crystal: 0,
    vintage: 0,
    prismatic: 0,
    interference: 0,
    rainbow: 0
  }
}, {
  name: 'Holographic',
  effects: {
    metallic: 0.1,
    holographic: 0.8,
    chrome: 0,
    crystal: 0.2,
    vintage: 0,
    prismatic: 0.4,
    interference: 0.3,
    rainbow: 0.2
  }
}, {
  name: 'Vintage',
  effects: {
    metallic: 0.2,
    holographic: 0,
    chrome: 0,
    crystal: 0,
    vintage: 0.7,
    prismatic: 0,
    interference: 0,
    rainbow: 0
  }
}];
const environments = [{
  id: 'studio',
  name: 'Studio',
  icon: '🎬'
}, {
  id: 'cosmic',
  name: 'Cosmic',
  icon: '🌌'
}, {
  id: 'bedroom',
  name: 'Bedroom',
  icon: '🛏️'
}, {
  id: 'mathematical',
  name: 'Mathematical',
  icon: '📐'
}];
export const CreatorRightSidebar: React.FC<CreatorRightSidebarProps> = ({
  isOpen,
  currentSide,
  effects,
  material,
  lighting,
  onSideChange,
  onEffectsChange,
  onMaterialChange,
  onLightingChange
}) => {
  const [materialsOpen, setMaterialsOpen] = useState(true);
  const [effectsOpen, setEffectsOpen] = useState(true);
  const [lightingOpen, setLightingOpen] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const updateEffect = (effectName: string, value: number) => {
    onEffectsChange({
      ...effects,
      [effectName]: value
    });
  };
  const applyPreset = (preset: typeof effectPresets[0]) => {
    onEffectsChange(preset.effects);
  };
  if (!isOpen) {
    return (
      <div className="w-full lg:w-14 h-16 lg:h-full flex lg:flex-col items-center justify-center lg:justify-start lg:py-4 gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground touch-manipulation">
          <Palette className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground touch-manipulation">
          <Sparkles className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground touch-manipulation">
          <Sun className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground touch-manipulation">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  return (
    <div className="w-full lg:w-80 xl:w-96 flex flex-col h-full">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center justify-between mb-3 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-1">Visual Effects</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Materials, effects & lighting</p>
          </div>
          
          {/* Side Toggle */}
          <div className="flex bg-muted rounded-lg p-1 w-full sm:w-auto">
            <Button 
              variant={currentSide === 'front' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => onSideChange('front')} 
              className="text-xs px-3 flex-1 sm:flex-none touch-manipulation"
            >
              Front
            </Button>
            <Button 
              variant={currentSide === 'back' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => onSideChange('back')} 
              className="text-xs px-3 flex-1 sm:flex-none touch-manipulation"
            >
              Back
            </Button>
          </div>
        </div>
        
        <Badge variant="outline" className="text-xs">
          Editing {currentSide} side
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-3 sm:px-4">
        <div className="space-y-4 sm:space-y-6 pb-4">
          {/* Materials Section */}
          <Collapsible open={materialsOpen} onOpenChange={setMaterialsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="font-medium">Materials</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="grid gap-2">
                {materials.map(mat => <div key={mat.id} className={cn("p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md", material === mat.id ? "border-crd-orange bg-crd-orange/5 shadow-lg shadow-crd-orange/10" : "border-border hover:border-crd-orange/30")} onClick={() => onMaterialChange(mat.id)}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{mat.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{mat.name}</p>
                        <p className="text-xs text-muted-foreground">{mat.description}</p>
                      </div>
                      {material === mat.id && <div className="w-2 h-2 bg-crd-orange rounded-full" />}
                    </div>
                  </div>)}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Effects Section */}
          <Collapsible open={effectsOpen} onOpenChange={setEffectsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">CRD Styles</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              {/* Preset Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {effectPresets.map(preset => (
                  <Button 
                    key={preset.name} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyPreset(preset)} 
                    className="text-xs touch-manipulation"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Effect Sliders */}
              <div className="space-y-4">
                {[{
                key: 'metallic',
                label: 'Metallic',
                icon: Chrome,
                color: 'from-slate-400 to-slate-600'
              }, {
                key: 'holographic',
                label: 'Holographic',
                icon: Rainbow,
                color: 'from-pink-400 via-purple-400 to-blue-400'
              }, {
                key: 'chrome',
                label: 'Chrome',
                icon: Zap,
                color: 'from-gray-300 to-gray-500'
              }, {
                key: 'crystal',
                label: 'Crystal',
                icon: Gem,
                color: 'from-blue-200 to-cyan-300'
              }, {
                key: 'vintage',
                label: 'Vintage',
                icon: Layers,
                color: 'from-amber-200 to-orange-300'
              }, {
                key: 'prismatic',
                label: 'Prismatic',
                icon: Rainbow,
                color: 'from-red-300 via-yellow-300 to-green-300'
              }].map(({
                key,
                label,
                icon: Icon,
                color
              }) => <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round((effects[key] || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Slider value={[effects[key] || 0]} onValueChange={([value]) => updateEffect(key, value)} max={1} step={0.01} className="w-full" />
                      {/* Gradient background for slider track */}
                      <div className={cn("absolute top-1/2 -translate-y-1/2 h-2 rounded-full opacity-20 pointer-events-none", `bg-gradient-to-r ${color}`)} style={{
                    width: `${(effects[key] || 0) * 100}%`
                  }} />
                    </div>
                  </div>)}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Lighting Section */}
          <Collapsible open={lightingOpen} onOpenChange={setLightingOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-medium">Lighting</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              {/* Environment */}
              <div>
                <p className="text-sm font-medium mb-2">Environment</p>
                <div className="grid grid-cols-2 gap-2">
                {environments.map(env => (
                  <Button 
                    key={env.id} 
                    variant={lighting.environment === env.id ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => onLightingChange({
                      ...lighting,
                      environment: env.id
                    })} 
                    className="justify-start gap-2 text-xs touch-manipulation"
                  >
                    <span>{env.icon}</span>
                    {env.name}
                  </Button>
                ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Intensity</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(lighting.intensity * 100)}%
                  </span>
                </div>
                <Slider value={[lighting.intensity]} onValueChange={([value]) => onLightingChange({
                ...lighting,
                intensity: value
              })} max={1} step={0.01} className="w-full" />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Color</span>
                <div className="grid grid-cols-4 gap-2">
                  {['#FF6B4A', '#4FFFB0', '#4A90FF', '#FF4A9D'].map(color => <button key={color} className={cn("w-full h-8 rounded border-2 transition-all", lighting.color === color ? "border-foreground scale-105" : "border-border hover:scale-105")} style={{
                  backgroundColor: color
                }} onClick={() => onLightingChange({
                  ...lighting,
                  color
                })} />)}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Export Section */}
          <Collapsible open={exportOpen} onOpenChange={setExportOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Export & Share</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <Button className="w-full touch-manipulation" size="sm">
                Save to Gallery
              </Button>
              <Button variant="outline" className="w-full touch-manipulation" size="sm">
                Download PNG
              </Button>
              <Button variant="outline" className="w-full touch-manipulation" size="sm">
                Download PDF
              </Button>
              <div className="flex items-center justify-between text-sm">
                <span>Public visibility</span>
                <Switch defaultChecked />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
};