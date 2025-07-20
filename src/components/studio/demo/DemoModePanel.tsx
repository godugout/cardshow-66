import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Palette, 
  Layers,
  Move,
  X
} from 'lucide-react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { useToast } from '@/hooks/use-toast';

interface DemoStep {
  template: string;
  material: string;
  effects: string[];
  duration: number;
  description: string;
}

const demoSteps: DemoStep[] = [
  {
    template: 'holographic',
    material: 'holographic',
    effects: ['holographic', 'glow'],
    duration: 3000,
    description: 'Holographic template with iridescent materials and ethereal glow effects'
  },
  {
    template: 'chrome',
    material: 'chrome',
    effects: ['chrome', 'particle'],
    duration: 3000,
    description: 'Chrome template with reflective metallic surface and particle shimmer'
  },
  {
    template: 'crystal',
    material: 'crystal',
    effects: ['distortion', 'glow'],
    duration: 3000,
    description: 'Crystal template with refractive materials and distortion waves'
  },
  {
    template: 'neon',
    material: 'emissive',
    effects: ['glow', 'particle'],
    duration: 3000,
    description: 'Neon template with emissive materials and electric particle effects'
  },
  {
    template: 'gold',
    material: 'metallic',
    effects: ['chrome', 'holographic'],
    duration: 3000,
    description: 'Gold template with premium metallic finish and holographic accents'
  },
  {
    template: 'cyberpunk',
    material: 'glass',
    effects: ['distortion', 'particle'],
    duration: 3000,
    description: 'Cyberpunk template with translucent materials and digital effects'
  }
];

export const DemoModePanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 350 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { updateMaterial, updateAnimation, addEffectLayer, removeEffectLayer, state } = useAdvancedStudio();
  const { toast } = useToast();

  // Auto-cycle through demo steps
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (demoSteps[currentStep].duration / 100));
        if (newProgress >= 100) {
          // Move to next step
          setCurrentStep(prev => (prev + 1) % demoSteps.length);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  // Apply demo step effects
  useEffect(() => {
    if (!isPlaying) return;

    const step = demoSteps[currentStep];
    
    // Apply rotation animation
    updateAnimation({
      preset: 'rotate',
      isPlaying: true,
      speed: 30,
      amplitude: 50
    });

    // Apply material
    updateMaterial({
      preset: step.material,
      metalness: step.material === 'metallic' ? 90 : 20,
      roughness: step.material === 'chrome' ? 10 : 50,
      transparency: step.material === 'glass' ? 30 : 0,
      emission: step.material === 'emissive' ? 80 : 0
    });

    // Clear existing effect layers
    state.effectLayers.forEach(layer => {
      removeEffectLayer(layer.id);
    });

    // Add new effect layers
    step.effects.forEach((effect, index) => {
      setTimeout(() => {
        addEffectLayer({
          type: effect as any,
          enabled: true,
          intensity: 70,
          opacity: 80,
          blendMode: 'normal',
          parameters: {}
        });
      }, index * 500);
    });

    toast({
      title: `Demo: ${step.template.charAt(0).toUpperCase() + step.template.slice(1)} Template`,
      description: step.description,
    });
  }, [currentStep, isPlaying]);

  const handleStartDemo = () => {
    setIsPlaying(true);
    setIsVisible(true);
    setCurrentStep(0);
    setProgress(0);
  };

  const handleStopDemo = () => {
    setIsPlaying(false);
    updateAnimation({ isPlaying: false });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    updateAnimation({ isPlaying: false });
    
    // Clear all effect layers
    state.effectLayers.forEach(layer => {
      removeEffectLayer(layer.id);
    });
    
    // Reset to default material
    updateMaterial({
      preset: 'standard',
      metalness: 50,
      roughness: 50,
      transparency: 0,
      emission: 0
    });
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
      x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 320, e.clientY - dragOffset.y))
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

  if (!isVisible) {
    return (
      <Button
        onClick={handleStartDemo}
        className="fixed bottom-4 right-4 z-50 bg-crd-accent hover:bg-crd-accent/80"
        size="lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Start Demo
      </Button>
    );
  }

  const currentStepData = demoSteps[currentStep];

  return (
    <Card 
      className="fixed z-50 w-96 bg-crd-dark/95 backdrop-blur-sm border-crd-border text-crd-text-primary shadow-2xl"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <CardHeader 
        className="pb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="w-4 h-4" />
            CRD Demo Mode
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Template Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-crd-text-primary">Current Template</h4>
            <Badge variant="outline" className="bg-crd-accent/20 text-crd-accent">
              {currentStep + 1} / {demoSteps.length}
            </Badge>
          </div>
          
          <div className="bg-crd-darkest rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-crd-accent" />
              <span className="font-medium capitalize">{currentStepData.template}</span>
            </div>
            <p className="text-sm text-crd-text-secondary">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Material & Effects */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Material
            </h5>
            <Badge variant="secondary" className="w-full justify-center">
              {currentStepData.material}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Effects
            </h5>
            <div className="flex flex-wrap gap-1">
              {currentStepData.effects.map((effect, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {effect}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            onClick={isPlaying ? handleStopDemo : () => setIsPlaying(true)}
            className="flex-1"
          >
            {isPlaying ? (
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
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="text-xs text-crd-text-secondary bg-crd-darkest rounded p-2">
          <div className="flex justify-between">
            <span>Active Effects:</span>
            <span>{state.effectLayers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Material:</span>
            <span className="capitalize">{state.material.preset}</span>
          </div>
          <div className="flex justify-between">
            <span>Animation:</span>
            <span>{state.animation.isPlaying ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};