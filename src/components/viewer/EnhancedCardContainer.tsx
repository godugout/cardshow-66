import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eye, Layers, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardData } from '@/types/card';
import { CRDFrameRenderer } from '@/components/frames/crd/CRDFrameRenderer';
import { EnhancedCardBack } from './components/EnhancedCardBack';
import { CardEdgeEffects } from './components/CardEdgeEffects';
import { AdvancedMaterialSystem } from './components/AdvancedMaterialSystem';
import { InteractiveLightingEngine } from './components/InteractiveLightingEngine';
import { getCRDFrameById } from '@/data/crdFrames';

export interface CardSide {
  type: 'front' | 'back';
  frameId: string;
  customElements?: any[];
  effects: {
    metallic: number;
    holographic: number;
    chrome: number;
    crystal: number;
    vintage: number;
    prismatic: number;
    interference: number;
    rainbow: number;
    particles: boolean;
  };
  material: string;
  lighting: {
    intensity: number;
    direction: { x: number; y: number };
    color: string;
    environment: string;
  };
}

interface EnhancedCardContainerProps {
  card: CardData;
  initialFrontSide?: Partial<CardSide>;
  initialBackSide?: Partial<CardSide>;
  width?: number;
  height?: number;
  className?: string;
  allowFlip?: boolean;
  showControls?: boolean;
}

export const EnhancedCardContainer: React.FC<EnhancedCardContainerProps> = ({
  card,
  initialFrontSide,
  initialBackSide,
  width = 450,
  height = 630,
  className = '',
  allowFlip = true,
  showControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'design' | 'materials' | 'lighting'>('preview');

  // Card side configurations
  const [frontSide, setFrontSide] = useState<CardSide>({
    type: 'front',
    frameId: 'oakland-as-donruss',
    effects: {
      metallic: 0,
      holographic: 0,
      chrome: 0,
      crystal: 0,
      vintage: 0,
      prismatic: 0,
      interference: 0,
      rainbow: 0,
      particles: false
    },
    material: 'standard',
    lighting: {
      intensity: 0.5,
      direction: { x: 0.5, y: 0.5 },
      color: '#ffffff',
      environment: 'studio'
    },
    ...initialFrontSide
  });

  const [backSide, setBackSide] = useState<CardSide>({
    type: 'back',
    frameId: 'modern-holographic',
    effects: {
      metallic: 0.3,
      holographic: 0.5,
      chrome: 0,
      crystal: 0,
      vintage: 0,
      prismatic: 0.2,
      interference: 0,
      rainbow: 0,
      particles: false
    },
    material: 'holographic',
    lighting: {
      intensity: 0.7,
      direction: { x: 0.3, y: 0.7 },
      color: '#4FFFB0',
      environment: 'cosmic'
    },
    ...initialBackSide
  });

  const currentSide = isFlipped ? backSide : frontSide;
  const currentFrame = getCRDFrameById(currentSide.frameId);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  // Calculate 3D transform
  const getCardTransform = () => {
    const rotateY = isFlipped ? 180 : 0;
    const tiltX = isHovering ? (mousePos.y - 0.5) * 15 : 0;
    const tiltY = isHovering ? (mousePos.x - 0.5) * -15 : 0;
    const scale = isHovering ? 1.02 : 1;
    
    return `
      perspective(2000px) 
      rotateY(${rotateY}deg) 
      rotateX(${tiltX}deg) 
      rotateZ(${tiltY * 0.5}deg) 
      scale(${scale})
    `;
  };

  const modes = [
    { id: 'preview', name: 'Preview', icon: Eye, description: 'View final card' },
    { id: 'design', name: 'Design', icon: Layers, description: 'Edit frame & layout' },
    { id: 'materials', name: 'Materials', icon: Sparkles, description: 'Material effects' },
    { id: 'lighting', name: 'Lighting', icon: Settings, description: 'Lighting & environment' }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mode Selector */}
      {showControls && (
        <div className="flex flex-wrap gap-2 justify-center">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(mode.id as any)}
                className="flex items-center gap-1"
              >
                <Icon className="w-3 h-3" />
                {mode.name}
              </Button>
            );
          })}
        </div>
      )}

      {/* Enhanced Card Container */}
      <div className="flex justify-center">
        <div 
          className="relative"
          style={{ 
            width, 
            height,
            perspective: '2000px',
            transformStyle: 'preserve-3d'
          }}
        >
          <div
            ref={containerRef}
            className="relative w-full h-full cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              transform: getCardTransform(),
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Card Front */}
            <div 
              className={cn(
                "absolute inset-0 w-full h-full backface-hidden",
                isFlipped && "opacity-0"
              )}
              style={{
                transform: 'rotateY(0deg)',
                backfaceVisibility: 'hidden'
              }}
            >
              <Card className="relative w-full h-full overflow-hidden shadow-2xl bg-transparent">
                {/* Advanced Material System */}
                <AdvancedMaterialSystem 
                  material={frontSide.material}
                  effects={frontSide.effects}
                  mousePosition={mousePos}
                  isHovering={isHovering}
                />
                
                {/* Interactive Lighting */}
                <InteractiveLightingEngine
                  settings={frontSide.lighting}
                  mousePosition={mousePos}
                  isHovering={isHovering}
                />
                
                {/* Frame with Image */}
                {currentFrame && (
                  <CRDFrameRenderer
                    frame={currentFrame}
                    userImage={card.image_url}
                    width={width}
                    height={height}
                    className="relative z-10"
                  />
                )}
                
                {/* Card Edge Effects */}
                <CardEdgeEffects
                  effects={frontSide.effects}
                  material={frontSide.material}
                  lighting={frontSide.lighting}
                  mousePosition={mousePos}
                  isHovering={isHovering}
                />
              </Card>
            </div>

            {/* Card Back */}
            <div 
              className={cn(
                "absolute inset-0 w-full h-full backface-hidden",
                !isFlipped && "opacity-0"
              )}
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden'
              }}
            >
              <Card className="relative w-full h-full overflow-hidden shadow-2xl bg-transparent">
                <EnhancedCardBack
                  card={card}
                  frameId={backSide.frameId}
                  effects={backSide.effects}
                  material={backSide.material}
                  lighting={backSide.lighting}
                  mousePosition={mousePos}
                  isHovering={isHovering}
                  width={width}
                  height={height}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center gap-4">
          {allowFlip && (
            <Button
              variant="outline"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isFlipped ? 'Show Front' : 'Show Back'}
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground flex items-center">
            Viewing: {isFlipped ? 'Back' : 'Front'} • {currentFrame?.name}
          </div>
        </div>
      )}

      {/* Design Controls */}
      {viewMode !== 'preview' && (
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="font-semibold mb-3">
            {viewMode === 'design' && 'Frame & Layout Controls'}
            {viewMode === 'materials' && 'Material Effects'}
            {viewMode === 'lighting' && 'Lighting & Environment'}
          </h3>
          
          {/* Design controls will be implemented in the next phase */}
          <div className="text-sm text-muted-foreground">
            {viewMode} controls coming soon...
          </div>
        </div>
      )}
    </div>
  );
};