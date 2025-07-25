import React from 'react';
import { CRDElement as CRDElementType } from '@/types/crdFrames';

interface CRDElementProps {
  element: CRDElementType;
  containerWidth: number;
  containerHeight: number;
  className?: string;
}

export const CRDElement: React.FC<CRDElementProps> = ({
  element,
  containerWidth,
  containerHeight,
  className = ''
}) => {
  const {
    imageUrl,
    position,
    dimensions,
    zIndex,
    opacity = 1,
    rotation = 0,
    scale = 1,
    name,
    type,
    cssStyles,
    textContent
  } = element;

  // Calculate responsive positioning
  const leftPercent = (position.x / containerWidth) * 100;
  const topPercent = (position.y / containerHeight) * 100;
  const widthPercent = (dimensions.width / containerWidth) * 100;
  const heightPercent = (dimensions.height / containerHeight) * 100;

  // Render based on element type
  const renderContent = () => {
    if (type === 'text' && textContent) {
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          style={cssStyles}
        >
          {textContent}
        </div>
      );
    }

    if (type?.startsWith('css-') && cssStyles) {
      return (
        <div
          className="w-full h-full"
          style={cssStyles}
        />
      );
    }

    // Default to image rendering with fallback
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto'
          }}
          draggable={false}
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    return null;
  };

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        zIndex,
        opacity,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center'
      }}
    >
      {renderContent()}
    </div>
  );
};