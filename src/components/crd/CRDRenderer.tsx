import React, { useMemo, useState, useCallback } from 'react';
import { CRDCard, CRDRenderContext } from '@/types/crd';
import { CRDImageLayer } from './layers/CRDImageLayer';
import { CRDFrameLayer } from './layers/CRDFrameLayer';
import { CRDEffectsLayer } from './layers/CRDEffectsLayer';
import { CRDLightingLayer } from './layers/CRDLightingLayer';
import { useCRDFrame } from '@/hooks/useCRDFrame';
import { useCRDMouse } from '@/hooks/useCRDMouse';

interface CRDRendererProps {
  card: CRDCard;
  width?: number;
  height?: number;
  className?: string;
  interactive?: boolean;
  performance?: 'low' | 'medium' | 'high';
  onRender?: (context: CRDRenderContext) => void;
}

export const CRDRenderer: React.FC<CRDRendererProps> = ({
  card,
  width = 400,
  height = 560,
  className = '',
  interactive = true,
  performance = 'medium',
  onRender
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get frame data
  const frame = useCRDFrame(card.frameId);
  
  // Mouse tracking for interactive effects
  const { mousePosition, isHovering, handleMouseMove, handleMouseEnter, handleMouseLeave } = useCRDMouse();
  
  // Create render context
  const renderContext = useMemo((): CRDRenderContext => ({
    card,
    frame,
    viewport: {
      width,
      height,
      pixelRatio: window.devicePixelRatio || 1
    },
    interactive,
    mousePosition: interactive ? mousePosition : undefined,
    isHovering: interactive ? isHovering : false,
    performance
  }), [card, frame, width, height, interactive, mousePosition, isHovering, performance]);
  
  // Notify parent of render context
  React.useEffect(() => {
    onRender?.(renderContext);
  }, [renderContext, onRender]);
  
  // Calculate container styles
  const containerStyle = useMemo(() => ({
    width,
    height,
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius: '12px',
    cursor: interactive ? (isHovering ? 'pointer' : 'default') : 'default',
    transform: interactive && isHovering ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d' as const
  }), [width, height, interactive, isHovering]);
  
  // Handle image events
  const handleImageLoad = useCallback(() => {
    console.log('CRDRenderer: Image loaded successfully for card:', card.id);
    setImageLoaded(true);
    setImageError(false);
  }, [card.id]);
  
  const handleImageError = useCallback(() => {
    console.error('CRDRenderer: Image failed to load for card:', card.id, 'URL:', card.imageUrl);
    setImageError(true);
    setImageLoaded(false);
  }, [card.id, card.imageUrl]);
  
  if (!frame) {
    return (
      <div style={containerStyle} className={`crd-renderer-loading ${className}`}>
        <div className="flex items-center justify-center w-full h-full bg-cs-neutral-2 text-cs-neutral-11">
          <div className="text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <div>Loading frame...</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      style={containerStyle}
      className={`crd-renderer ${className}`}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseEnter={interactive ? handleMouseEnter : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
    >
      {/* Lighting Layer - Base environment lighting */}
      <CRDLightingLayer context={renderContext} />
      
      {/* Frame Layer - Card frame and decorations */}
      <CRDFrameLayer context={renderContext} />
      
      {/* Image Layer - User uploaded image */}
      <CRDImageLayer
        card={{
          id: parseInt(card.id) || 1,
          title: card.title,
          imageUrl: card.imageUrl
        }}
        onError={handleImageError}
      />
      
      {/* Effects Layer - Material effects and animations */}
      <CRDEffectsLayer 
        context={renderContext}
        imageLoaded={imageLoaded}
        imageError={imageError}
      />
      
      {/* Debug overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-50">
          <div>Frame: {frame.name}</div>
          <div>Material: {card.material.type}</div>
          <div>Image: {card.imageUrl ? 'loaded' : 'none'}</div>
          {interactive && (
            <div>Mouse: {mousePosition.x.toFixed(2)}, {mousePosition.y.toFixed(2)}</div>
          )}
        </div>
      )}
    </div>
  );
};