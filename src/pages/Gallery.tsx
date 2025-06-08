
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAllCollections } from '@/hooks/useCollections';
import { useCards } from '@/hooks/useCards';
import { ImmersiveCardViewer } from '@/components/viewer/ImmersiveCardViewer';
import { MobileControlProvider } from '@/components/viewer/context/MobileControlContext';
import { GallerySection } from './Gallery/components/GallerySection';
import { GalleryHeader } from './Gallery/components/GalleryHeader';
import { CollectionsGrid } from './Gallery/components/CollectionsGrid';
import { CardsGrid } from './Gallery/components/CardsGrid';
import { useCardConversion } from './Gallery/hooks/useCardConversion';
import { useGalleryActions } from './Gallery/hooks/useGalleryActions';
import { convertToUniversalCardData } from '@/components/viewer/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus } from 'lucide-react';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('featured');
  
  const { collections, loading: collectionsLoading } = useAllCollections(1, 6);
  const { featuredCards, loading: cardsLoading } = useCards();
  
  const { convertCardsToCardData } = useCardConversion();
  const {
    selectedCardIndex,
    showImmersiveViewer,
    handleCardClick,
    handleCardChange,
    handleCloseViewer,
    handleShareCard,
    handleDownloadCard
  } = useGalleryActions();

  // Convert cards to CardData format for the viewer
  const convertedCards = convertCardsToCardData(featuredCards);
  const currentCard = convertedCards[selectedCardIndex];

  const handleCreateCollection = () => {
    // TODO: Implement collection creation
    console.log('Create collection clicked');
  };

  return (
    <MobileControlProvider>
      <div className="container mx-auto p-6 max-w-7xl bg-[#121212]">
        <GalleryHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="featured" className="mt-8">
            {/* Simplified Collections Section */}
            <GallerySection title="Collections">
              {collections && collections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <CollectionsGrid collections={collections.slice(0, 5) || []} loading={collectionsLoading} />
                  <div className="flex items-center justify-center">
                    <EmptyState
                      title="Create Collection"
                      description="Start your own collection of cards"
                      icon={<Plus className="h-12 w-12 text-crd-mediumGray mb-4" />}
                      action={{
                        label: "Create Collection",
                        onClick: handleCreateCollection,
                        icon: <Plus className="mr-2 h-4 w-4" />
                      }}
                    />
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Collections Yet"
                  description="Be the first to create a collection and showcase your cards"
                  action={{
                    label: "Create Collection",
                    onClick: handleCreateCollection,
                    icon: <Plus className="mr-2 h-4 w-4" />
                  }}
                />
              )}
            </GallerySection>

            {/* Main Focus: Featured Cards */}
            <GallerySection title="Featured Cards">
              <CardsGrid 
                cards={featuredCards || []} 
                loading={cardsLoading}
                onCardClick={(card) => handleCardClick(card, featuredCards)}
              />
            </GallerySection>
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="py-16">
              <p className="text-[#777E90] text-center">Trending content coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="new">
            <div className="py-16">
              <p className="text-[#777E90] text-center">New content coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Immersive Card Viewer with Navigation */}
        {showImmersiveViewer && currentCard && convertedCards.length > 0 && (
          <ImmersiveCardViewer
            card={convertToUniversalCardData(currentCard)}
            cards={convertedCards.map(convertToUniversalCardData)}
            currentCardIndex={selectedCardIndex}
            onCardChange={handleCardChange}
            isOpen={showImmersiveViewer}
            onClose={handleCloseViewer}
            onShare={() => handleShareCard(convertedCards)}
            onDownload={() => handleDownloadCard(convertedCards)}
            allowRotation={true}
            showStats={true}
            ambient={true}
          />
        )}
      </div>
    </MobileControlProvider>
  );
};

export default Gallery;
