import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Globe } from 'lucide-react';
import { CardCollectionsConfig } from '@/types/portfolio';

interface CardCollectionsComponentProps {
  config: CardCollectionsConfig;
}

export const CardCollectionsComponent: React.FC<CardCollectionsComponentProps> = ({ config }) => {
  const { collectionIds, showPrivate, displayStyle } = config;

  // Mock collection data for preview
  const mockCollections = [
    {
      id: '1',
      title: 'Baseball Legends',
      description: 'Classic baseball cards from the golden era',
      cardCount: 24,
      isPublic: true,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Modern Heroes',
      description: 'Contemporary sports stars and rising talents',
      cardCount: 18,
      isPublic: true,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Personal Collection',
      description: 'Private collection of rare finds',
      cardCount: 12,
      isPublic: false,
      thumbnail: '/placeholder.svg'
    }
  ];

  const filteredCollections = showPrivate 
    ? mockCollections 
    : mockCollections.filter(c => c.isPublic);

  return (
    <Card className="p-6 bg-crd-surface/20 border-crd-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-crd-foreground">
            Card Collections
          </h2>
          <Badge variant="outline" className="text-crd-muted border-crd-border">
            {filteredCollections.length} collections
          </Badge>
        </div>

        <div className={`space-y-4 ${displayStyle === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
          {filteredCollections.map((collection) => (
            <Card key={collection.id} className="p-4 bg-crd-surface/30 border-crd-border hover:border-crd-blue/50 transition-colors group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-crd-surface/50 to-crd-surface/20 flex items-center justify-center flex-shrink-0">
                  <div className="text-2xl">📚</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-crd-foreground group-hover:text-crd-blue transition-colors truncate">
                      {collection.title}
                    </h3>
                    {collection.isPublic ? (
                      <Globe className="w-4 h-4 text-crd-green" />
                    ) : (
                      <Lock className="w-4 h-4 text-crd-muted" />
                    )}
                  </div>
                  
                  <p className="text-sm text-crd-muted mb-2 line-clamp-2">
                    {collection.description}
                  </p>
                  
                  <div className="text-xs text-crd-muted">
                    {collection.cardCount} cards
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {collectionIds.length === 0 && filteredCollections.length === 0 && (
            <Card className="border-2 border-dashed border-crd-border/50 bg-crd-surface/10 p-6 text-center">
              <div className="text-2xl mb-2">📚</div>
              <p className="text-sm text-crd-muted">
                No collections selected. Configure this module to choose your collections.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};