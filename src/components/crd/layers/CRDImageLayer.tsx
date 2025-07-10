import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface CRDImageLayerProps {
  card: {
    id: number;
    title?: string;
    imageUrl?: string;
  };
  onError: () => void;
}

export const CRDImageLayer: React.FC<CRDImageLayerProps> = ({ card, onError }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!card.imageUrl) {
    return (
      <div className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">No image uploaded</div>
        </div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="w-full h-full bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm font-medium">Failed to load image</div>
          <div className="text-xs mt-1 opacity-75">Check the image URL</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-lg" />
      )}
      <img
        src={card.imageUrl}
        alt={card.title || 'Card image'}
        className="w-full h-full object-cover rounded-lg"
        onLoad={() => {
          console.log('CRDImageLayer: Image loaded successfully:', card.imageUrl);
          setImageLoaded(true);
        }}
        onError={(e) => {
          console.error('CRDImageLayer: Image failed to load:', card.imageUrl);
          setImageError(true);
          onError();
        }}
        draggable={false}
      />
    </div>
  );
};