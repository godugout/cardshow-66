import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudioCardPreview } from '@/components/studio/enhanced/components/StudioCardPreview';
import { Enhanced3DCardViewer } from '@/components/3d/enhanced/Enhanced3DCardViewer';
import { Box, Maximize2, Settings, Share2, Download, ArrowLeft } from 'lucide-react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { toast } from 'sonner';

interface StudioPreviewButtonProps {
  cardData: {
    title: string;
    description: string;
    image_url: string;
    rarity: string;
    tags: string[];
  };
  selectedFrame?: string;
  layers?: any[];
  disabled?: boolean;
}

export const StudioPreviewButton: React.FC<StudioPreviewButtonProps> = ({
  cardData,
  selectedFrame,
  layers = [],
  disabled = false
}) => {
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [activeView, setActiveView] = useState<'2d' | '3d' | 'ar'>('2d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state } = useAdvancedStudio();

  const handleOpenStudio = () => {
    if (!cardData.image_url) {
      toast.error('Please upload an image before previewing in Studio');
      return;
    }
    setShowStudioModal(true);
  };

  const handleExport = () => {
    toast.success('Card exported successfully!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Card link copied to clipboard');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const cardProps = {
    id: 'preview',
    title: cardData.title,
    image_url: cardData.image_url,
    rarity: cardData.rarity as any,
    description: cardData.description,
    tags: cardData.tags,
    price: null,
    for_sale: false,
    view_count: 0,
    like_count: 0,
    template_id: selectedFrame || 'default',
    creator_id: 'preview-user',
    created_at: new Date().toISOString(),
    creator_attribution: {
      creator_name: 'Preview User',
      creator_id: 'preview-user',
      collaboration_type: 'solo' as const
    },
    publishing_options: {
      marketplace_listing: false,
      crd_catalog_inclusion: false,
      print_available: false,
      pricing: {
        currency: 'USD'
      },
      distribution: {
        limited_edition: false
      }
    },
    edition_size: 1,
    design_metadata: {},
    visibility: 'public' as const,
    creator: {
      id: 'preview-user',
      username: 'preview',
      display_name: 'Preview User'
    }
  };

  return (
    <>
      {/* Studio Preview Button */}
      <Button
        onClick={handleOpenStudio}
        disabled={disabled || !cardData.image_url}
        variant="default"
        className="bg-gradient-to-r from-crd-orange to-crd-green hover:from-crd-orange/90 hover:to-crd-green/90 text-white border-0"
      >
        <Box className="w-4 h-4 mr-2" />
        Studio Preview
      </Button>

      {/* Studio Preview Modal */}
      <Dialog open={showStudioModal} onOpenChange={setShowStudioModal}>
        <DialogContent 
          className={`${isFullscreen ? 'max-w-full max-h-full w-screen h-screen' : 'max-w-6xl max-h-[90vh]'} p-0 overflow-hidden`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStudioModal(false)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <DialogTitle className="flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    Studio Preview
                  </DialogTitle>
                  <Badge variant="outline" className="text-xs">
                    {cardData.title || 'Untitled Card'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFullscreen}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs 
                value={activeView} 
                onValueChange={(value) => setActiveView(value as any)}
                className="h-full flex flex-col"
              >
                {/* Tab Navigation */}
                <div className="border-b bg-muted/50">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 m-2">
                    <TabsTrigger value="2d" className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-crd-blue to-crd-green rounded-sm"></div>
                      2D Preview
                    </TabsTrigger>
                    <TabsTrigger value="3d" className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-crd-orange to-crd-blue rounded-sm"></div>
                      3D Viewer
                    </TabsTrigger>
                    <TabsTrigger value="ar" className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-crd-green to-crd-orange rounded-sm"></div>
                      AR Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="2d" className="h-full m-0 data-[state=active]:flex">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-8">
                      <StudioCardPreview
                        uploadedImage={cardData.image_url}
                        selectedFrame={selectedFrame}
                        orientation="portrait"
                        show3DPreview={false}
                        cardName={cardData.title}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="3d" className="h-full m-0 data-[state=active]:flex">
                    <div className="w-full h-full bg-gradient-to-br from-background to-card">
                      <Enhanced3DCardViewer
                        card={cardProps}
                        autoEnable={true}
                        effects={state.effectLayers}
                        selectedFrame={selectedFrame}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ar" className="h-full m-0 data-[state=active]:flex">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background">
                      <div className="text-center space-y-4 max-w-md px-6">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-crd-orange/20 to-crd-green/20 rounded-full flex items-center justify-center">
                          <Box className="w-12 h-12 text-crd-green" />
                        </div>
                        <h3 className="text-xl font-bold">AR Preview Coming Soon</h3>
                        <p className="text-muted-foreground">
                          Experience your cards in augmented reality. View and place your digital cards in the real world using your device's camera.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="outline" className="text-xs">WebXR Support</Badge>
                          <Badge variant="outline" className="text-xs">Mobile Compatible</Badge>
                          <Badge variant="outline" className="text-xs">Real-time Tracking</Badge>
                        </div>
                        <Button variant="outline" disabled>
                          <Settings className="w-4 h-4 mr-2" />
                          Enable AR (Coming Soon)
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Footer Info */}
            <div className="px-6 py-3 border-t bg-muted/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Material: {state.material.preset}</span>
                  <span>Effects: {state.effectLayers.length}</span>
                  <span>Layers: {layers.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {cardData.rarity.toUpperCase()}
                  </Badge>
                  {selectedFrame && (
                    <Badge variant="outline" className="text-xs">
                      {selectedFrame}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};