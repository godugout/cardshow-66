import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Move, Sparkles, Zap, X } from 'lucide-react';
import { CRDFactory } from '@/components/viewer/factories/CRDFactory';
import type { CRD_DNA } from '@/types/crd-dna';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';

interface DemoState {
  isRunning: boolean;
  currentCRD: CRD_DNA;
  currentTemplate: string;
  currentMaterial: 'glass' | 'crystal' | 'metal' | 'energy';
  currentRarity: CRD_DNA['rarity'];
  rotationSpeed: number;
  cycleProgress: number;
  phase: 'template' | 'material' | 'effects' | 'rarity';
}

interface DemoTemplate {
  name: string;
  rarity: CRD_DNA['rarity'];
  material: 'glass' | 'crystal' | 'metal' | 'energy';
  description: string;
  duration: number; // ms to display
}

// Demo templates with optimal material/effect combinations
const templates: DemoTemplate[] = [
  {
    name: 'Crystal Prism',
    rarity: 'Rare',
    material: 'crystal',
    description: 'Refractive crystal with prismatic effects and neon glow',
    duration: 4000
  },
  {
    name: 'Energy Field',
    rarity: 'Legendary',
    material: 'energy',
    description: 'Pulsing energy matrix with particle effects',
    duration: 4000
  },
  {
    name: 'Mythic Crystal',
    rarity: 'Mythic',
    material: 'crystal',
    description: 'Ultimate crystal formation with complex lighting',
    duration: 4000
  },
  {
    name: 'Chrome Metal',
    rarity: 'Epic',
    material: 'metal',
    description: 'Polished chrome with holographic reflections',
    duration: 4000
  },
  {
    name: 'Glass Showcase',
    rarity: 'Uncommon',
    material: 'glass',
    description: 'Clear glass display with subtle effects',
    duration: 3000
  },
  {
    name: 'Neon Energy',
    rarity: 'Legendary',
    material: 'energy',
    description: 'Vibrant neon energy with dynamic lighting',
    duration: 4000
  },
  {
    name: 'Prismatic Metal',
    rarity: 'Epic',
    material: 'metal',
    description: 'Iridescent metal with color shifting effects',
    duration: 3000
  }
];

export const EnhancedCRDDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 440, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  
  // Get studio context to control the main viewer
  const { state, updateMaterial, updateAnimation, updateLighting } = useAdvancedStudio();

  // Demo image URL - using a more reliable placeholder
  const demoImageUrl = '/placeholder.svg';
  
  const [demoState, setDemoState] = useState<DemoState>({
    isRunning: false,
    currentCRD: CRDFactory.createBaseCRD(demoImageUrl, 'Demo CRD'),
    currentTemplate: templates[0].name,
    currentMaterial: templates[0].material,
    currentRarity: templates[0].rarity,
    rotationSpeed: 1.0,
    cycleProgress: 0,
    phase: 'template'
  });

  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  // Apply template to main studio viewer
  const applyTemplateToStudio = useCallback((template: DemoTemplate) => {
    // Apply material settings based on template
    const materialSettings = {
      glass: { metalness: 10, roughness: 5, transparency: 30, emission: 5 },
      crystal: { metalness: 20, roughness: 15, transparency: 25, emission: 15 },
      metal: { metalness: 90, roughness: 20, transparency: 0, emission: 10 },
      energy: { metalness: 50, roughness: 5, transparency: 40, emission: 60 }
    };

    const settings = materialSettings[template.material];
    updateMaterial({
      preset: 'holographic',
      ...settings
    });

    // Apply lighting based on rarity
    const lightingSettings = {
      'Common': { intensity: 60, ambientLight: 50 },
      'Uncommon': { intensity: 70, ambientLight: 60 },
      'Rare': { intensity: 80, ambientLight: 70 },
      'Epic': { intensity: 90, ambientLight: 80 },
      'Legendary': { intensity: 95, ambientLight: 85 },
      'Mythic': { intensity: 100, ambientLight: 90 }
    };

    const lighting = lightingSettings[template.rarity];
    updateLighting({
      preset: 'studio',
      ...lighting,
      shadowIntensity: 60
    });

    // Enable rotation animation
    updateAnimation({
      preset: 'rotate',
      isPlaying: true,
      speed: 30,
      amplitude: 50
    });
  }, [updateMaterial, updateLighting, updateAnimation]);

  // Auto-cycle through templates
  useEffect(() => {
    if (!demoState.isRunning) return;

    const interval = setInterval(() => {
      setDemoState(prev => {
        const newProgress = prev.cycleProgress + (100 / (templates[currentTemplateIndex].duration / 100));
        
        if (newProgress >= 100) {
          // Move to next template
          const nextIndex = (currentTemplateIndex + 1) % templates.length;
          const nextTemplate = templates[nextIndex];
          
          // Apply template to main studio
          applyTemplateToStudio(nextTemplate);
          
          // Create new CRD with optimal settings for this template
          const newCRD = CRDFactory.createOptimalTemplate(
            demoImageUrl,
            nextTemplate.rarity,
            `Demo ${nextTemplate.name}`
          );
          
          setCurrentTemplateIndex(nextIndex);
          
          toast({
            title: `CRD Demo: ${nextTemplate.name}`,
            description: nextTemplate.description,
          });
          
          return {
            ...prev,
            currentCRD: newCRD,
            currentTemplate: nextTemplate.name,
            currentMaterial: nextTemplate.material,
            currentRarity: nextTemplate.rarity,
            cycleProgress: 0
          };
        }
        
        return {
          ...prev,
          cycleProgress: newProgress
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [demoState.isRunning, currentTemplateIndex, applyTemplateToStudio, toast, demoImageUrl]);

  const startDemo = () => {
    setDemoState(prev => ({ ...prev, isRunning: true }));
    // Apply first template immediately
    applyTemplateToStudio(templates[0]);
    toast({
      title: "CRD Demo Started",
      description: "Watch the main viewer cycle through templates"
    });
  };

  const stopDemo = () => {
    setDemoState(prev => ({ ...prev, isRunning: false, cycleProgress: 0 }));
    // Reset to default state
    updateAnimation({ isPlaying: false });
    toast({
      title: "CRD Demo Stopped",
      description: "Demo cycle has been paused"
    });
  };

  const resetDemo = () => {
    setCurrentTemplateIndex(0);
    setDemoState(prev => ({
      ...prev,
      isRunning: false,
      cycleProgress: 0,
      currentTemplate: templates[0].name,
      currentMaterial: templates[0].material,
      currentRarity: templates[0].rarity
    }));
  };

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  const currentTemplate = templates[currentTemplateIndex];

  return (
    <div
      className="fixed z-50 w-96 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">CRD 3D Demo</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Demo Controls */}
          <div className="flex items-center gap-2">
            {!demoState.isRunning ? (
              <Button onClick={startDemo} size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Demo
              </Button>
            ) : (
              <Button onClick={stopDemo} variant="outline" size="sm" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause Demo
              </Button>
            )}
            <Button onClick={resetDemo} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Template Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Current Template</h4>
              <Badge variant="outline" className="text-xs">
                {currentTemplateIndex + 1}/{templates.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">{currentTemplate.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {demoState.currentRarity}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {currentTemplate.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Material:</span>
                  <div className="font-medium capitalize">{demoState.currentMaterial}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rarity:</span>
                  <div className="font-medium">{demoState.currentRarity}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          {demoState.isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Template Progress</span>
                <span>{Math.round(demoState.cycleProgress)}%</span>
              </div>
              <Progress value={demoState.cycleProgress} className="h-2" />
            </div>
          )}

          {/* CRD DNA Properties */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium">CRD DNA Properties</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Translucency:</span>
                <div className="font-medium">{Math.round(demoState.currentCRD.translucency * 100)}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Slab Depth:</span>
                <div className="font-medium">{demoState.currentCRD.slabDepth?.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Embed Depth:</span>
                <div className="font-medium">{demoState.currentCRD.embeddedImage.position.z.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Image Clarity:</span>
                <div className="font-medium">{Math.round((demoState.currentCRD.embeddedImage.clarity || 0.95) * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Template Progress */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Template Progress</div>
            <div className="text-lg font-bold text-primary">
              {Math.round((currentTemplateIndex / templates.length) * 100)}%
            </div>
          </div>

          {/* CRD Token Value */}
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">Estimated Token Value</div>
            <div className="text-xl font-bold text-primary flex items-center justify-center gap-1">
              🪙 {demoState.currentCRD.crdTokenValue} CRD
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};