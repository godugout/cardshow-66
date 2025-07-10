import React from 'react';
import { CRDRenderContext } from '@/types/crd';

interface CRDImageLayerProps {
  context: CRDRenderContext;
  onLoad: () => void;
  onError: () => void;
  loaded: boolean;
  error: boolean;
}

export const CRDImageLayer: React.FC<CRDImageLayerProps> = ({
  context,
  onLoad,
  onError,
  loaded,
  error
}) => {
  const { card, frame } = context;
  
  // Calculate image position and size based on frame placeholder
  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${(frame.imagePlaceholder.x / frame.dimensions.width) * 100}%`,
    top: `${(frame.imagePlaceholder.y / frame.dimensions.height) * 100}%`,
    width: `${(frame.imagePlaceholder.width / frame.dimensions.width) * 100}%`,
    height: `${(frame.imagePlaceholder.height / frame.dimensions.height) * 100}%`,
    borderRadius: frame.imagePlaceholder.borderRadius || 0,
    overflow: 'hidden',
    zIndex: 5
  };

  // Apply material effects to image
  const getImageFilters = () => {
    const filters: string[] = [];
    const { material, effects } = card;
    
    // Base material adjustments
    switch (material.type) {
      case 'holographic':
        filters.push(`hue-rotate(${context.mousePosition?.x * 60 || 0}deg)`);
        filters.push(`saturate(${1 + (material.intensity / 200)})`);
        filters.push(`brightness(${1 + (material.intensity / 500)})`);
        break;
      case 'metallic':
        filters.push(`contrast(${1 + (material.intensity / 300)})`);
        filters.push(`brightness(${1 + (material.intensity / 400)})`);
        filters.push(`saturate(${0.8 + (material.intensity / 500)})`);
        break;
      case 'chrome':
        filters.push(`contrast(${1 + (material.intensity / 200)})`);
        filters.push(`brightness(${1 + (material.intensity / 300)})`);
        filters.push(`saturate(${0.7 + (material.intensity / 400)})`);
        break;
      case 'crystal':
        filters.push(`brightness(${1 + (material.intensity / 400)})`);
        filters.push(`saturate(${1 + (material.intensity / 300)})`);
        filters.push(`hue-rotate(${material.intensity / 10}deg)`);
        break;
      case 'vintage':
        filters.push(`sepia(${material.intensity / 200})`);
        filters.push(`contrast(${1 + (material.intensity / 400)})`);
        filters.push(`brightness(${0.9 + (material.intensity / 1000)})`);
        break;
      case 'prismatic':
        const prizmHue = ((context.mousePosition?.x || 0.5) + (context.mousePosition?.y || 0.5)) * material.intensity;
        filters.push(`hue-rotate(${prizmHue}deg)`);
        filters.push(`saturate(${1 + (material.intensity / 200)})`);
        break;
    }
    
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  if (!card.imageUrl) {
    return (
      <div style={imageStyle} className="crd-image-placeholder">
        <div className="w-full h-full bg-gradient-to-br from-cs-neutral-3 to-cs-neutral-4 flex items-center justify-center">
          <div className="text-cs-neutral-8 text-center">
            <div className="text-4xl mb-2 opacity-50">🖼️</div>
            <div className="text-sm opacity-70">No Image</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={imageStyle} className="crd-image-container">
      {/* Loading state */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-cs-accent-2 to-cs-accent-3 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <div className="text-sm">Loading image...</div>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-sm">Failed to load</div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={card.imageUrl}
        alt={card.title || 'Card image'}
        className="w-full h-full object-cover"
        style={{
          filter: getImageFilters(),
          transition: 'filter 0.3s ease',
          opacity: error ? 0 : 1
        }}
        onLoad={onLoad}
        onError={onError}
        draggable={false}
      />
    </div>
  );
};