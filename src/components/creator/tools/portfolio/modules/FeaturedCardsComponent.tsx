import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeaturedCardsConfig } from '@/types/portfolio';

interface FeaturedCardsComponentProps {
  config: FeaturedCardsConfig;
}

export const FeaturedCardsComponent: React.FC<FeaturedCardsComponentProps> = ({ config }) => {
  const { cardIds, displayStyle, title } = config;

  // Mock card data for preview
  const mockCards = [
    {
      id: '1',
      title: 'Rookie Sensation',
      image: '/placeholder.svg',
      rarity: 'legendary',
      price: 'CRD 250'
    },
    {
      id: '2',
      title: 'Champion Series',
      image: '/placeholder.svg',
      rarity: 'rare',
      price: 'CRD 150'
    },
    {
      id: '3',
      title: 'Hall of Fame',
      image: '/placeholder.svg',
      rarity: 'epic',
      price: 'CRD 300'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-crd-yellow border-crd-yellow/30 bg-crd-yellow/20';
      case 'epic': return 'text-purple-400 border-purple-400/30 bg-purple-400/20';
      case 'rare': return 'text-crd-blue border-crd-blue/30 bg-crd-blue/20';
      default: return 'text-crd-muted border-crd-border bg-crd-surface/20';
    }
  };

  return (
    <Card className="p-6 bg-crd-surface/20 border-crd-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-crd-foreground">
            {title || 'Featured Cards'}
          </h2>
          <Badge variant="outline" className="text-crd-muted border-crd-border">
            {cardIds.length || mockCards.length} cards
          </Badge>
        </div>

        <div className={`grid gap-4 ${
          displayStyle === 'carousel' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          displayStyle === 'featured' ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {(cardIds.length > 0 ? [] : mockCards).map((card) => (
            <Card key={card.id} className="overflow-hidden bg-crd-surface/30 border-crd-border hover:border-crd-blue/50 transition-colors group cursor-pointer">
              <div className="aspect-[2.5/3.5] bg-gradient-to-br from-crd-surface/50 to-crd-surface/20 flex items-center justify-center">
                <div className="text-4xl">🎴</div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-crd-foreground mb-1 group-hover:text-crd-blue transition-colors">
                  {card.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <Badge className={getRarityColor(card.rarity)}>
                    {card.rarity}
                  </Badge>
                  <span className="text-sm font-medium text-crd-green">
                    {card.price}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          
          {cardIds.length === 0 && (
            <Card className="border-2 border-dashed border-crd-border/50 bg-crd-surface/10 p-6 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <p className="text-sm text-crd-muted">
                No cards selected. Configure this module to choose your featured cards.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};