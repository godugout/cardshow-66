import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface LayerThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  layerName: string;
  fullImageUrl?: string;
  thumbnailUrl?: string;
  bounds?: { left: number; top: number; right: number; bottom: number };
  elementType?: string;
}

export const LayerThumbnailModal: React.FC<LayerThumbnailModalProps> = ({
  isOpen,
  onClose,
  layerName,
  fullImageUrl,
  thumbnailUrl,
  bounds,
  elementType
}) => {
  const imageUrl = fullImageUrl || thumbnailUrl;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {layerName}
              {elementType && (
                <Badge variant="outline" className="capitalize">
                  {elementType}
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Full size image */}
          <div className="flex justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={layerName}
                className="max-w-full max-h-96 object-contain rounded-lg border shadow-sm"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-muted/50 to-muted rounded-lg border-2 border-dashed flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>
          
          {/* Layer info */}
          {bounds && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Dimensions</p>
                <p>{bounds.right - bounds.left} × {bounds.bottom - bounds.top} px</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Position</p>
                <p>({bounds.left}, {bounds.top})</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};