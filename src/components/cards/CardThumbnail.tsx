import React, { memo, useState, useRef, useEffect } from 'react';
import { Heart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  current_case?: string;
  views_count?: number;
  like_count?: number;
  is_public?: boolean;
}

interface CardThumbnailProps {
  card: Card;
  onClick: () => void;
  onLikeToggle: (cardId: string, isLiked: boolean) => void;
  isOwner?: boolean;
  isLiked?: boolean;
}

const caseStyles = {
  'penny-sleeve': 'border-2 border-gray-400',
  'top-loader': 'border-2 border-blue-400 shadow-blue-400/20',
  'magnetic': 'border-2 border-purple-400 shadow-purple-400/20',
  'graded-slab': 'border-2 border-yellow-400 shadow-yellow-400/20',
  'premium': 'border-2 border-gradient-to-r from-crd-orange to-crd-green shadow-crd-green/30',
};

export const CardThumbnail = memo<CardThumbnailProps>(({
  card,
  onClick,
  onLikeToggle,
  isOwner = false,
  isLiked = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeToggle(card.id, isLiked);
  };

  const imageUrl = card.thumbnail_url || card.image_url;
  const caseStyle = caseStyles[card.current_case as keyof typeof caseStyles] || caseStyles['penny-sleeve'];

  return (
    <div
      ref={containerRef}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Card Container */}
      <div className={cn(
        "relative bg-card rounded-lg overflow-hidden transition-all duration-300",
        "hover:scale-105 hover:shadow-xl",
        caseStyle
      )}>
        {/* Image Container */}
        <div className="aspect-[3/4] relative bg-muted overflow-hidden">
          {isInView && imageUrl && !imageError ? (
            <img
              ref={imgRef}
              src={imageUrl}
              alt={card.title}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🃏</span>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isInView && imageUrl && !imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Case Badge */}
          {card.current_case && card.current_case !== 'penny-sleeve' && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white capitalize">
              {card.current_case.replace('-', ' ')}
            </div>
          )}

          {/* Privacy Badge */}
          {isOwner && !card.is_public && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-xs text-white">
              Private
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* Card Info */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-medium text-white text-sm line-clamp-2 leading-tight">
            {card.title}
          </h3>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {/* View count */}
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{card.views_count || 0}</span>
              </div>

              {/* Like count */}
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{card.like_count || 0}</span>
              </div>
            </div>

            {/* Like button */}
            <button
              onClick={handleLikeClick}
              className={cn(
                "p-1 rounded-full transition-colors duration-200",
                "hover:bg-white/10",
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
              )}
              aria-label={isLiked ? "Unlike card" : "Like card"}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CardThumbnail.displayName = 'CardThumbnail';