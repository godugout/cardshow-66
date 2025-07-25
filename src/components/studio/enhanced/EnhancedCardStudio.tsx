
import React, { useState } from 'react';
import { MinimalistFrameCarousel } from '@/components/editor/frames/MinimalistFrameCarousel';
import { ProDesignModeToggle } from '../ProDesignModeToggle';
import { ProDesignInterface } from './ProDesignInterface';

interface TextLayer {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  opacity: number;
  visible: boolean;
}

interface EnhancedCardStudioProps {
  selectedFrame?: string;
  uploadedImage?: string;
  onFrameSelect: (frameId: string) => void;
  onImageUpload: (imageUrl: string) => void;
  theme?: string;
  primaryColor?: string;
}

export const EnhancedCardStudio: React.FC<EnhancedCardStudioProps> = ({
  selectedFrame,
  uploadedImage,
  onFrameSelect,
  onImageUpload,
  theme = 'default',
  primaryColor = '#00ff88'
}) => {
  const [isProMode, setIsProMode] = useState(false);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);

  console.log('EnhancedCardStudio rendering with:', { 
    selectedFrame, 
    uploadedImage, 
    theme, 
    primaryColor,
    isProMode,
    textLayersCount: textLayers.length
  });

  const handleTextLayerAdd = (layer: TextLayer) => {
    setTextLayers(prev => [...prev, layer]);
  };

  const handleTextLayerUpdate = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  const handleTextLayerDelete = (id: string) => {
    setTextLayers(prev => prev.filter(layer => layer.id !== id));
  };

  if (isProMode) {
    return (
      <div className="w-full h-full min-h-[600px] flex" style={{
        '--primary-color': primaryColor
      } as React.CSSProperties}>
        {/* Main Canvas Area */}
        <div className="flex-1 bg-gradient-to-br from-crd-darkest via-crd-dark to-crd-darkest">
          <div className="h-full flex items-center justify-center p-6">
            <div className="relative">
              <MinimalistFrameCarousel
                selectedFrame={selectedFrame}
                uploadedImage={uploadedImage}
                onFrameSelect={onFrameSelect}
                onImageUpload={onImageUpload}
              />
              
              {/* Text Layer Overlays */}
              {textLayers.map(layer => (
                layer.visible && (
                  <div
                    key={layer.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      fontSize: `${layer.fontSize}px`,
                      color: layer.color,
                      opacity: layer.opacity / 100,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      fontFamily: layer.fontFamily,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      zIndex: 20
                    }}
                  >
                    {layer.content}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Pro Design Tools Panel */}
        <div className="w-96 border-l border-crd-border bg-crd-darkest">
          <div className="p-4 border-b border-crd-border">
            <ProDesignModeToggle
              isProMode={isProMode}
              onToggle={setIsProMode}
            />
          </div>
          
          <div className="h-[calc(100%-5rem)] overflow-hidden">
            <ProDesignInterface
              onTextLayerAdd={handleTextLayerAdd}
              onTextLayerUpdate={handleTextLayerUpdate}
              onTextLayerDelete={handleTextLayerDelete}
              textLayers={textLayers}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px]" style={{
      '--primary-color': primaryColor
    } as React.CSSProperties}>
      <div className="p-4">
        <ProDesignModeToggle
          isProMode={isProMode}
          onToggle={setIsProMode}
        />
      </div>
      
      <MinimalistFrameCarousel
        selectedFrame={selectedFrame}
        uploadedImage={uploadedImage}
        onFrameSelect={onFrameSelect}
        onImageUpload={onImageUpload}
      />
    </div>
  );
};
