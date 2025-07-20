import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import { Card3DPreviewModal } from '@/components/editor/modals/Card3DPreviewModal';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'effect' | 'frame' | 'material';
  visible: boolean;
  locked: boolean;
  opacity: number;
  data: any;
}

interface CardData {
  title: string;
  description: string;
  image_url: string;
  rarity: string;
  tags: string[];
}

interface EnhancedCardPreviewProps {
  card: CardData;
  selectedFrame?: string;
  layers?: Layer[];
  width?: number;
  height?: number;
  showControls?: boolean;
}

export const EnhancedCardPreview: React.FC<EnhancedCardPreviewProps> = ({
  card,
  selectedFrame,
  layers = [],
  width = 320,
  height = 448,
  showControls = true,
}) => {
  const [show3DModal, setShow3DModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'2d' | 'tilt' | '3d'>('2d');
  const { state } = useAdvancedStudio();
  const currentMaterial = state.material;
  const currentEffects = state.effectLayers;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-slate-400 to-slate-600';
      case 'uncommon': return 'from-emerald-400 to-emerald-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-amber-400 to-amber-600';
      case 'mythic': return 'from-red-400 to-red-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-[0_0_30px_rgba(251,191,36,0.5)]';
      case 'mythic': return 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
      case 'epic': return 'shadow-[0_0_20px_rgba(147,51,234,0.4)]';
      case 'rare': return 'shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      default: return '';
    }
  };

  const getFrameEffects = () => {
    if (!selectedFrame) return '';
    
    switch (selectedFrame) {
      case 'holographic-prism': return 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-[shimmer_2s_ease-in-out_infinite] after:skew-x-12';
      case 'legendary-crown': return 'after:absolute after:inset-0 after:bg-gradient-to-b after:from-amber-300/20 after:to-transparent';
      case 'mythic-cosmos': return 'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.3),transparent_70%)] after:animate-pulse';
      default: return '';
    }
  };

  const getMaterialEffects = () => {
    if (!currentMaterial) return {};
    
    const baseStyle: React.CSSProperties = {};
    
    switch (currentMaterial.preset) {
      case 'metallic':
        baseStyle.filter = 'contrast(1.1) saturate(0.9)';
        baseStyle.background = 'linear-gradient(135deg, rgba(192,192,192,0.1), rgba(128,128,128,0.1))';
        break;
      case 'chrome':
        baseStyle.filter = 'contrast(1.2) brightness(1.1)';
        baseStyle.background = 'linear-gradient(135deg, rgba(232,232,232,0.15), rgba(160,160,160,0.1))';
        break;
      case 'holographic':
        baseStyle.background = 'linear-gradient(135deg, rgba(255,107,74,0.1), rgba(79,255,176,0.1), rgba(74,144,255,0.1))';
        baseStyle.animation = 'hue-rotate 3s linear infinite';
        break;
      case 'crystal':
        baseStyle.filter = 'brightness(1.1) contrast(1.05)';
        baseStyle.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(200,255,255,0.05))';
        break;
    }
    
    return baseStyle;
  };

  const cyclePreviewMode = () => {
    setPreviewMode(prev => {
      switch (prev) {
        case '2d': return 'tilt';
        case 'tilt': return '3d';
        case '3d': return '2d';
        default: return '2d';
      }
    });
  };

  const getPreviewTransform = () => {
    switch (previewMode) {
      case 'tilt': return 'perspective(1000px) rotateX(5deg) rotateY(-5deg)';
      case '3d': return 'perspective(1000px) rotateX(10deg) rotateY(-10deg) scale(1.05)';
      default: return 'none';
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live Preview
            </Badge>
            {currentMaterial && (
              <Badge variant="secondary" className="text-xs">
                {currentMaterial.preset}
              </Badge>
            )}
            {currentEffects.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {currentEffects.length} effects
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={cyclePreviewMode}
              className="h-7 px-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {previewMode.toUpperCase()}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShow3DModal(true)}
              className="h-7 px-2"
            >
              <Maximize2 className="w-3 h-3 mr-1" />
              3D View
            </Button>
          </div>
        </div>
      )}

      {/* Card Preview */}
      <div className="w-full flex justify-center">
        <div 
          className={`relative bg-gradient-to-br ${getRarityColor(card.rarity)} p-1 rounded-xl shadow-2xl ${getRarityGlow(card.rarity)} transition-all duration-500 ${getFrameEffects()}`}
          style={{ 
            width, 
            height,
            transform: getPreviewTransform()
          }}
        >
          {/* Card Content */}
          <div 
            className="w-full h-full bg-card rounded-lg overflow-hidden relative"
            style={getMaterialEffects()}
          >
            {/* Frame Effects Overlay */}
            {selectedFrame && (
              <div className="absolute inset-0 z-10 pointer-events-none opacity-80">
                {/* Dynamic frame rendering based on selectedFrame */}
              </div>
            )}

            {/* Main Image Area */}
            <div className="relative h-3/4 bg-muted overflow-hidden">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.title}
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{
                    filter: currentMaterial?.preset === 'holographic' ? 'hue-rotate(0deg)' : 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No image uploaded</p>
                  </div>
                </div>
              )}
              
              {/* Rarity indicator */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                  {card.rarity.toUpperCase()}
                </Badge>
              </div>

              {/* Effect Overlays */}
              {layers.filter(layer => layer.visible && layer.type === 'effect').map((layer, index) => (
                <div
                  key={layer.id}
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    opacity: layer.opacity,
                    zIndex: 5 + index,
                    mixBlendMode: 'screen'
                  }}
                >
                  {/* Effect rendering based on layer.data */}
                  {layer.data?.type === 'glow' && (
                    <div 
                      className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-transparent"
                      style={{
                        background: `radial-gradient(circle, ${layer.data.color}20 0%, transparent 70%)`
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Card Info Section */}
            <div className="h-1/4 p-3 bg-background/95 backdrop-blur-sm">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1 text-foreground">
                    {card.title || 'Untitled Card'}
                  </h3>
                  {card.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {card.description}
                    </p>
                  )}
                </div>
                
                {/* Tags */}
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {card.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{card.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Indicators */}
      {layers.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {layers.filter(l => l.visible).map((layer, index) => (
            <Badge key={layer.id} variant="outline" className="text-xs">
              {layer.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 3D Preview Modal */}
      <Card3DPreviewModal
        isOpen={show3DModal}
        onClose={() => setShow3DModal(false)}
        cardData={{
          id: 'preview',
          title: card.title,
          image_url: card.image_url,
          rarity: card.rarity,
          description: card.description
        }}
        imageUrl={card.image_url}
      />
    </div>
  );
};