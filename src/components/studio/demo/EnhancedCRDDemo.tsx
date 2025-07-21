import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Move, Sparkles, Zap, X } from 'lucide-react';
import { CRDFactory } from '@/components/viewer/factories/CRDFactory';
import type { CRD_DNA } from '@/types/crd-dna';
import { useToast } from '@/hooks/use-toast';

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

interface TemplateConfig {
  name: string;
  material: 'glass' | 'crystal' | 'metal' | 'energy';
  rarity: CRD_DNA['rarity'];
  description: string;
  duration: number;
}

const templates: TemplateConfig[] = [
  {
    name: 'Standard Glass',
    material: 'glass',
    rarity: 'Common',
    description: 'Clean translucent glass with embedded card image',
    duration: 3000
  },
  {
    name: 'Crystal Prism',
    material: 'crystal',
    rarity: 'Rare',
    description: 'Refractive crystal with prismatic effects and neon glow',
    duration: 3000
  },
  {
    name: 'Metal Core',
    material: 'metal',
    rarity: 'Epic',
    description: 'Metallic slab with reflective surface and particle effects',
    duration: 3000
  },
  {
    name: 'Energy Field',
    material: 'energy',
    rarity: 'Legendary',
    description: 'Pure energy containment with dynamic lighting and effects',
    duration: 3000
  },
  {
    name: 'Mythic Crystal',
    material: 'crystal',
    rarity: 'Mythic',
    description: 'Ultimate crystal matrix with all effects and maximum rarity',
    duration: 4000
  },
  {
    name: 'Legendary Metal',
    material: 'metal',
    rarity: 'Legendary',
    description: 'Premium metallic finish with golden accents and luxury effects',
    duration: 3000
  },
  {
    name: 'Epic Energy',
    material: 'energy',
    rarity: 'Epic',
    description: 'Contained energy with electric particle swirls and neon rings',
    duration: 3000
  },
  {
    name: 'Rare Glass',
    material: 'glass',
    rarity: 'Rare',
    description: 'Enhanced glass with subtle effects and increased clarity',
    duration: 3000
  }
];

export const EnhancedCRDDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 440, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  
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
  }, [demoState.isRunning, currentTemplateIndex, demoImageUrl, toast]);

  const handleStartDemo = () => {
    setDemoState(prev => ({ ...prev, isRunning: true }));
    setIsVisible(true);
    
    // Create first template
    const firstTemplate = templates[0];
    const newCRD = CRDFactory.createOptimalTemplate(
      demoImageUrl,
      firstTemplate.rarity,
      `Demo ${firstTemplate.name}`
    );
    
    setDemoState(prev => ({
      ...prev,
      currentCRD: newCRD,
      currentTemplate: firstTemplate.name,
      currentMaterial: firstTemplate.material,
      currentRarity: firstTemplate.rarity,
      cycleProgress: 0
    }));
    
    toast({
      title: 'CRD Demo Started',
      description: 'Showcasing optimal material and effect combinations for each rarity level',
    });
  };

  const handleStopDemo = () => {
    setDemoState(prev => ({ ...prev, isRunning: false }));
  };

  const handleReset = () => {
    setDemoState(prev => ({
      ...prev,
      isRunning: false,
      cycleProgress: 0
    }));
    setCurrentTemplateIndex(0);
    
    const baseCRD = CRDFactory.createBaseCRD(demoImageUrl, 'Demo CRD');
    setDemoState(prev => ({
      ...prev,
      currentCRD: baseCRD,
      currentTemplate: templates[0].name,
      currentMaterial: templates[0].material,
      currentRarity: templates[0].rarity
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 420, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragOffset.y))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getRarityIcon = (rarity: CRD_DNA['rarity']) => {
    switch (rarity) {
      case 'Common': return '⚪';
      case 'Uncommon': return '🟢';
      case 'Rare': return '🔵';
      case 'Epic': return '🟣';
      case 'Legendary': return '🟡';
      case 'Mythic': return '🔴';
    }
  };

  const getMaterialIcon = (material: string) => {
    switch (material) {
      case 'glass': return '💎';
      case 'crystal': return '💠';
      case 'metal': return '⚡';
      case 'energy': return <Zap className="w-4 h-4" />;
      default: return '💎';
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={handleStartDemo}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        size="lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Start CRD Demo
      </Button>
    );
  }

  const currentTemplate = templates[currentTemplateIndex];

  return (
    <Card 
      className="fixed z-50 w-[420px] bg-black/90 backdrop-blur-sm border-gray-800 text-white shadow-2xl"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <CardHeader 
        className="pb-3 cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-900/50 to-purple-900/50"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="w-4 h-4" />
            🎴 CRD 3D Demo
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Template Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Current Template</h4>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500">
              {currentTemplateIndex + 1} / {templates.length}
            </Badge>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRarityIcon(demoState.currentRarity)}</span>
              <span className="font-medium text-lg">{currentTemplate.name}</span>
              <Badge variant="secondary" className={`
                ${demoState.currentRarity === 'Mythic' ? 'bg-red-500/20 text-red-300' : ''}
                ${demoState.currentRarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                ${demoState.currentRarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' : ''}
                ${demoState.currentRarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' : ''}
                ${demoState.currentRarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' : ''}
                ${demoState.currentRarity === 'Common' ? 'bg-gray-500/20 text-gray-300' : ''}
              `}>
                {demoState.currentRarity}
              </Badge>
            </div>
            <p className="text-sm text-gray-300">
              {currentTemplate.description}
            </p>
          </div>
        </div>

        {/* CRD Properties */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              {getMaterialIcon(demoState.currentMaterial)}
              Slab Material
            </h5>
            <Badge variant="secondary" className="w-full justify-center bg-gray-800 text-white">
              {demoState.currentMaterial.charAt(0).toUpperCase() + demoState.currentMaterial.slice(1)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Effects
            </h5>
            <div className="flex flex-wrap gap-1">
              {demoState.currentCRD.effects.map((effect, index) => (
                <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                  {effect.type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* CRD DNA Properties */}
        <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-700">
          <h6 className="text-sm font-medium mb-2 text-blue-300">CRD DNA Properties</h6>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Translucency:</span>
              <span className="text-white">{Math.round(demoState.currentCRD.translucency * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slab Depth:</span>
              <span className="text-white">{demoState.currentCRD.slabDepth.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Embed Depth:</span>
              <span className="text-white">{demoState.currentCRD.embeddedDepth.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Image Clarity:</span>
              <span className="text-white">{Math.round(demoState.currentCRD.embeddedImage.clarity * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Template Progress</span>
            <span>{Math.round(demoState.cycleProgress)}%</span>
          </div>
          <Progress value={demoState.cycleProgress} className="h-2 bg-gray-800" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={demoState.isRunning ? "secondary" : "default"}
            size="sm"
            onClick={demoState.isRunning ? handleStopDemo : () => setDemoState(prev => ({ ...prev, isRunning: true }))}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {demoState.isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-gray-600 hover:bg-gray-800"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* CRD Token Value */}
        <div className="text-center p-2 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded border border-yellow-700/50">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-lg text-yellow-300">
              {demoState.currentCRD.crdTokenValue} CRD
            </span>
          </div>
          <p className="text-xs text-yellow-200/80">Estimated Token Value</p>
        </div>
      </CardContent>
    </Card>
  );
};