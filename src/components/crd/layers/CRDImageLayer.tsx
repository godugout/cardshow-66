import React, { useState, useEffect } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  
  // Simplified retry logic - limit to 1 retry to prevent console flooding
  useEffect(() => {
    if (error && retryCount < 1 && card.imageUrl) {
      const timer = setTimeout(() => {
        console.log(`CRDImageLayer: Retrying image load (attempt ${retryCount + 1}):`, card.imageUrl);
        setRetryCount(prev => prev + 1);
        setImageKey(prev => prev + 1); // Force image reload
      }, 2000); // Single 2-second retry
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, card.imageUrl]);
  
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
        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <div className="text-white/80 text-center">
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <div className="text-sm">Loading image...</div>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-sm">Failed to load</div>
            <div className="text-xs mt-1 opacity-60">
              {retryCount < 1 ? `Retrying... (${retryCount}/1)` : 'Check image URL'}
            </div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        key={`crd-image-${imageKey}`} // Force reload on retry with proper key
        src={card.imageUrl}
        alt={card.title || 'Card image'}
        className="w-full h-full object-cover"
        style={{
          filter: getImageFilters(),
          transition: 'filter 0.3s ease',
          opacity: error ? 0 : 1
        }}
        onLoad={() => {
          console.log('CRDImageLayer: Image loaded successfully:', card.imageUrl);
          setRetryCount(0); // Reset retry count on successful load
          onLoad();
        }}
        onError={(e) => {
          console.error('CRDImageLayer: Image failed to load:', card.imageUrl, e);
          onError();
        }}
        draggable={false}
      />
    </div>
  );
};