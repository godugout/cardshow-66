// Stable Collections View - Core User Journey Component
import React, { useState, useEffect } from 'react';
import { useCRDData } from '@/services/crdDataService';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { 
  Grid3x3, 
  List, 
  Plus, 
  Eye, 
  Heart, 
  Star,
  Calendar,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface StableCollectionsViewProps {
  onCardClick?: (card: any) => void;
}

export const StableCollectionsView: React.FC<StableCollectionsViewProps> = ({ onCardClick }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  const { userCards, userCollections, profile, loading } = useCRDData();

  if (loading) {
    return (
      <div className="min-h-screen bg-crd-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-crd-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-crd-text-dim">Loading your collection...</p>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-400',
      uncommon: 'border-green-400',
      rare: 'border-blue-400',
      epic: 'border-purple-400',
      legendary: 'border-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityTextColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-crd-black">
      {/* Header */}
      <div className="bg-crd-surface border-b border-crd-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-crd-text">My Collection</h1>
              <p className="text-crd-text-dim mt-1">
                {userCards.length} card{userCards.length !== 1 ? 's' : ''} • 
                {userCollections.length} collection{userCollections.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-crd-black rounded-lg p-1">
                <CRDButton
                  variant={viewMode === 'grid' ? 'orange' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </CRDButton>
                <CRDButton
                  variant={viewMode === 'list' ? 'orange' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </CRDButton>
              </div>

              <CRDButton variant="success" onClick={() => window.location.href = '/stable-create'}>
                <Plus className="w-4 h-4 mr-2" />
                Create Card
              </CRDButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CRDCard className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-crd-orange/20 rounded-lg flex items-center justify-center mr-4">
                <ImageIcon className="w-6 h-6 text-crd-orange" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-crd-text">{userCards.length}</h3>
                <p className="text-sm text-crd-text-dim">Total Cards</p>
              </div>
            </div>
          </CRDCard>

          <CRDCard className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-crd-green/20 rounded-lg flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-crd-green" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-crd-text">{userCollections.length}</h3>
                <p className="text-sm text-crd-text-dim">Collections</p>
              </div>
            </div>
          </CRDCard>

          <CRDCard className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-crd-yellow/20 rounded-lg flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-crd-yellow" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-crd-text">{profile?.crdTokens || 0}</h3>
                <p className="text-sm text-crd-text-dim">CRD Tokens</p>
              </div>
            </div>
          </CRDCard>
        </div>

        {/* Cards Grid/List */}
        {userCards.length === 0 ? (
          // Empty State
          <CRDCard className="p-12 text-center">
            <div className="w-24 h-24 bg-crd-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-crd-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-crd-text mb-2">No cards yet</h3>
            <p className="text-crd-text-dim mb-6 max-w-md mx-auto">
              Start building your collection by creating your first digital trading card.
            </p>
            <CRDButton variant="orange" onClick={() => window.location.href = '/stable-create'}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Card
            </CRDButton>
          </CRDCard>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {userCards.map((card) => (
              <CRDCard 
                key={card.id} 
                className={`group cursor-pointer overflow-hidden transition-all duration-200 ${
                  viewMode === 'grid' ? 'hover:scale-105' : ''
                }`}
                onClick={() => onCardClick?.(card)}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className={`aspect-[2.5/3.5] relative overflow-hidden border-2 ${getRarityColor(card.rarity)}`}>
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <div className={`px-2 py-1 bg-black/70 rounded text-xs font-medium ${getRarityTextColor(card.rarity)}`}>
                          {card.rarity.toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h4 className="text-white font-semibold text-sm mb-1 truncate">
                          {card.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {card.viewsCount}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {card.likeCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center p-4 space-x-4">
                    <div className={`w-20 h-28 border-2 rounded-lg overflow-hidden flex-shrink-0 ${getRarityColor(card.rarity)}`}>
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-crd-text truncate">
                        {card.title}
                      </h4>
                      {card.description && (
                        <p className="text-sm text-crd-text-dim mt-1 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      <div className="flex items-center mt-3 space-x-4 text-sm text-crd-text-muted">
                        <span className={`font-medium ${getRarityTextColor(card.rarity)}`}>
                          {card.rarity.toUpperCase()}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(card.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {card.viewsCount}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {card.likeCount}
                        </span>
                      </div>
                    </div>

                    {card.isPublic && (
                      <div className="text-xs bg-crd-green/20 text-crd-green px-2 py-1 rounded">
                        Public
                      </div>
                    )}
                  </div>
                )}
              </CRDCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};