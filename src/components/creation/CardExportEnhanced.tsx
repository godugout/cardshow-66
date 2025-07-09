import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Home, Plus, Download, Share2, Heart, Star } from 'lucide-react';
import { CRDFrameRenderer } from '@/components/frames/crd/CRDFrameRenderer';
import { CardExportModal } from './CardExportModal';
import { getCRDFrameById, CRD_FRAMES } from '@/data/crdFrames';
import { cardCacheManager } from '@/lib/storage/CardCacheManager';
import { toast } from 'sonner';
import type { UnifiedCardData } from '@/types/cardCreation';

interface CardExportEnhancedProps {
  cardData: UnifiedCardData;
  uploadedImage: string;
  onCreateAnother: () => void;
}

export const CardExportEnhanced: React.FC<CardExportEnhancedProps> = ({
  cardData,
  uploadedImage,
  onCreateAnother
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [cachedImageUrl, setCachedImageUrl] = useState<string>('');
  const [cacheStats, setCacheStats] = useState({ count: 0, sizeEstimate: '0 MB' });

  // Get the frame data
  const selectedFrame = getCRDFrameById(cardData.design_metadata?.frame_id || cardData.frame) || CRD_FRAMES[0];
  
  // Extract serial number and card ID if available
  const serialNumber = cardData.design_metadata?.serial_number || 'CRD No. NEW';
  const cardId = cardData.design_metadata?.card_id;

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // Get cache stats
        const stats = await cardCacheManager.getCacheStats();
        setCacheStats(stats);

        // Try to get cached image URL if we have a card ID
        if (cardId) {
          const cachedUrl = await cardCacheManager.getCachedImageUrl(cardId);
          if (cachedUrl) {
            setCachedImageUrl(cachedUrl);
          }
        }
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    };

    loadCachedData();
  }, [cardId]);

  const handleShare = async () => {
    const shareData = {
      title: `${cardData.title} - ${serialNumber}`,
      text: `Check out my ${cardData.rarity} trading card: ${cardData.title}!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      toast.success('Share details copied to clipboard!');
    }
  };

  const handleDownload = () => {
    // For now, open export modal
    setShowExportModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-crd-green to-crd-blue rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Card Created! 🎉</h1>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {serialNumber}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Your AI-enhanced trading card is ready to amaze collectors!
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Final Card Display */}
        <div className="order-2 lg:order-1">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Your Masterpiece</h2>
            <p className="text-muted-foreground">
              Now available for offline viewing and sharing
            </p>
          </div>
          
          {/* Large Card Showcase */}
          <div className="flex justify-center">
            <div className="relative transform hover:scale-105 transition-all duration-500">
              {/* Display cached image if available, otherwise use renderer */}
              {cachedImageUrl ? (
                <div className="relative">
                  <img 
                    src={cachedImageUrl}
                    alt={cardData.title}
                    className="w-[450px] h-[630px] object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-crd-green text-black font-bold">
                      CACHED
                    </Badge>
                  </div>
                </div>
              ) : (
                <CRDFrameRenderer
                  frame={selectedFrame}
                  userImage={uploadedImage}
                  width={450}
                  height={630}
                  className="shadow-2xl rounded-2xl"
                  interactive={false}
                />
              )}
              
              {/* Floating Serial Number */}
              <div className="absolute -top-6 -right-6">
                <div className="bg-gradient-to-r from-crd-orange to-crd-green rounded-full px-6 py-3 shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {serialNumber}
                  </span>
                </div>
              </div>
              
              {/* Floating Rarity Badge */}
              <div className="absolute -bottom-6 -left-6">
                <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-bold capitalize">
                      {cardData.rarity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Card Details & Actions */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Card Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-border p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-crd-green" />
              Card Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Title:</span>
                <span className="text-white font-semibold">{cardData.title}</span>
              </div>
              {cardData.description && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-white text-right max-w-[200px]">{cardData.description}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rarity:</span>
                <Badge variant="outline" className="capitalize">
                  {cardData.rarity}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Frame:</span>
                <span className="text-white font-medium">{selectedFrame.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Serial:</span>
                <span className="text-crd-green font-mono font-bold">{serialNumber}</span>
              </div>
            </div>
          </Card>

          {/* Offline Availability */}
          <Card className="bg-card/50 backdrop-blur-sm border-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">Offline Access</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cache Status:</span>
                <Badge variant={cachedImageUrl ? "default" : "outline"}>
                  {cachedImageUrl ? "Cached" : "Caching..."}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Cached:</span>
                <span className="text-white">{cacheStats.count} cards</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Storage Used:</span>
                <span className="text-white">{cacheStats.sizeEstimate}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your cards are saved locally for offline viewing and faster loading.
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleDownload}
              className="w-full bg-crd-green hover:bg-crd-green/90 text-black font-semibold h-12"
            >
              <Download className="w-5 h-5 mr-2" />
              Export & Download
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-crd-blue text-crd-blue hover:bg-crd-blue/10 h-10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                onClick={onCreateAnother}
                variant="outline"
                className="border-crd-orange text-crd-orange hover:bg-crd-orange/10 h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Card
              </Button>
            </div>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 h-10"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Tags */}
          {cardData.tags && cardData.tags.length > 0 && (
            <Card className="bg-card/30 backdrop-blur-sm border-border p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {cardData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <CardExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        cardData={{
          title: cardData.title,
          description: cardData.description,
          imageUrl: cachedImageUrl || cardData.imageUrl || cardData.image_url || uploadedImage,
          frameId: cardData.frame
        }}
      />
    </div>
  );
};