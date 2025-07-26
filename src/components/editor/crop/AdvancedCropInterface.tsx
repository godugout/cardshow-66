import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  RotateCcw, 
  RotateCw, 
  Undo, 
  Redo, 
  RotateCcwSquare,
  Trash2,
  Download,
  Scissors,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground, loadImage } from '@/services/backgroundRemoval';
import 'react-image-crop/dist/ReactCrop.css';

interface CropResult {
  id: string;
  imageUrl: string;
  cropData: PixelCrop;
  timestamp: number;
}

interface AdvancedCropInterfaceProps {
  imageUrl: string;
  onCropComplete?: (croppedImageUrl: string) => void;
  onMultipleCropsComplete?: (crops: CropResult[]) => void;
  aspectRatio?: number;
  className?: string;
}

export const AdvancedCropInterface: React.FC<AdvancedCropInterfaceProps> = ({
  imageUrl,
  onCropComplete,
  onMultipleCropsComplete,
  aspectRatio = 2.5 / 3.5,
  className = ""
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processedImageUrl, setProcessedImageUrl] = useState(imageUrl);
  const [backgroundRemoving, setBackgroundRemoving] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [cropResults, setCropResults] = useState<CropResult[]>([]);
  const [cropHistory, setCropHistory] = useState<PixelCrop[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Center the crop when image loads
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 50,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ));
    }
  }

  // Handle crop completion
  function onCropCompleteCallback(crop: PixelCrop) {
    setCompletedCrop(crop);
    // Add to history
    setCropHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(crop);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }

  // Background removal
  const handleRemoveBackground = async () => {
    if (!processedImageUrl) return;
    
    try {
      setBackgroundRemoving(true);
      toast.info('Removing background...');
      
      const imageElement = await loadImage(await fetch(processedImageUrl).then(r => r.blob()));
      const resultBlob = await removeBackground(imageElement);
      const resultUrl = URL.createObjectURL(resultBlob);
      
      setProcessedImageUrl(resultUrl);
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error('Failed to remove background');
    } finally {
      setBackgroundRemoving(false);
    }
  };

  // Create cropped image
  const getCroppedImg = useCallback(async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
    rotation = 0
  ): Promise<string | null> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const cardWidth = 500;
    const cardHeight = Math.round(cardWidth / aspectRatio);
    
    canvas.width = cardWidth;
    canvas.height = cardHeight;

    ctx.translate(cardWidth / 2, cardHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cardWidth / 2, -cardHeight / 2);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      cardWidth,
      cardHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, 'image/png', 1);
    });
  }, [aspectRatio]);

  // Save current crop
  const handleSaveCrop = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('No crop to save');
      return;
    }

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop, rotation);
      if (!croppedImageUrl) {
        toast.error('Failed to generate crop');
        return;
      }

      const newCrop: CropResult = {
        id: `crop-${Date.now()}`,
        imageUrl: croppedImageUrl,
        cropData: completedCrop,
        timestamp: Date.now()
      };

      setCropResults(prev => [...prev, newCrop]);
      toast.success('Crop saved! You can create more or finalize.');
    } catch (error) {
      console.error('Failed to save crop:', error);
      toast.error('Failed to save crop');
    }
  };

  // Apply single crop
  const handleCompleteSingle = async () => {
    if (!imgRef.current || !completedCrop || !onCropComplete) {
      toast.error('No crop to apply');
      return;
    }

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop, rotation);
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
        toast.success('Crop applied successfully!');
      }
    } catch (error) {
      console.error('Failed to apply crop:', error);
      toast.error('Failed to apply crop');
    }
  };

  // Complete multiple crops
  const handleCompleteMultiple = () => {
    if (cropResults.length === 0) {
      toast.error('No crops to finalize');
      return;
    }
    
    if (onMultipleCropsComplete) {
      onMultipleCropsComplete(cropResults);
      toast.success(`Finalized ${cropResults.length} crops!`);
    }
  };

  // History functions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCompletedCrop(cropHistory[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < cropHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCompletedCrop(cropHistory[nextIndex]);
    }
  };

  const handleReset = () => {
    if (imgRef.current && aspectRatio) {
      const { width, height } = imgRef.current;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 50,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ));
      setRotation(0);
    }
  };

  const handleClearHistory = () => {
    setCropResults([]);
    setCropHistory([]);
    setHistoryIndex(-1);
    toast.success('History cleared');
  };

  const handleDeleteCrop = (cropId: string) => {
    setCropResults(prev => prev.filter(c => c.id !== cropId));
    toast.success('Crop deleted');
  };

  const handleDownloadCrop = (crop: CropResult) => {
    const link = document.createElement('a');
    link.href = crop.imageUrl;
    link.download = `crop-${crop.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Loading overlay */}
      {backgroundRemoving && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-crd-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-white font-semibold text-lg">Removing Background...</h3>
              <p className="text-crd-lightGray">Processing with AI</p>
            </div>
          </div>
        </div>
      )}

      {/* Crop Interface */}
      <Card className="p-6 bg-crd-surface border-crd-border">
        <div className="space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => onCropCompleteCallback(c)}
            aspect={aspectRatio}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={processedImageUrl}
              style={{ transform: `rotate(${rotation}deg)` }}
              onLoad={(e) => {
                console.log('AdvancedCropInterface: Image loaded successfully:', processedImageUrl);
                onImageLoad(e);
              }}
              onError={(e) => {
                console.error('AdvancedCropInterface: Image failed to load:', {
                  src: processedImageUrl,
                  error: e,
                  target: e.currentTarget
                });
                // Try to fetch the URL directly to see what the actual error is
                fetch(processedImageUrl)
                  .then(response => {
                    console.error('Fetch test result:', {
                      status: response.status,
                      statusText: response.statusText,
                      ok: response.ok,
                      url: response.url
                    });
                  })
                  .catch(fetchError => {
                    console.error('Fetch test failed:', fetchError);
                  });
              }}
              className="max-w-full max-h-[500px] object-contain"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          onClick={handleRemoveBackground} 
          disabled={backgroundRemoving}
          variant="outline" 
          className="border-crd-border text-white hover:bg-purple-500 hover:text-white"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Remove Background
        </Button>

        <Button onClick={() => setRotation(prev => prev - 90)} variant="outline" className="border-crd-border text-white hover:bg-crd-green hover:text-black">
          <RotateCcw className="w-4 h-4 mr-2" />
          Rotate Left
        </Button>

        <Button onClick={() => setRotation(prev => prev + 90)} variant="outline" className="border-crd-border text-white hover:bg-crd-green hover:text-black">
          <RotateCw className="w-4 h-4 mr-2" />
          Rotate Right
        </Button>

        <Button onClick={handleUndo} disabled={historyIndex <= 0} variant="outline" className="border-crd-border text-white hover:bg-crd-blue hover:text-black disabled:opacity-50">
          <Undo className="w-4 h-4 mr-2" />
          Undo
        </Button>

        <Button onClick={handleRedo} disabled={historyIndex >= cropHistory.length - 1} variant="outline" className="border-crd-border text-white hover:bg-crd-blue hover:text-black disabled:opacity-50">
          <Redo className="w-4 h-4 mr-2" />
          Redo
        </Button>

        <Button onClick={handleReset} variant="outline" className="border-crd-border text-white hover:bg-crd-orange hover:text-black">
          <RotateCcwSquare className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <Button onClick={handleSaveCrop} className="bg-crd-green text-black hover:bg-crd-green/80">
          <Scissors className="w-4 h-4 mr-2" />
          Save Crop
        </Button>
        
        {onCropComplete && (
          <Button onClick={handleCompleteSingle} className="bg-crd-blue text-white hover:bg-crd-blue/80">
            Apply & Continue
          </Button>
        )}

        {cropResults.length > 0 && (
          <>
            <Button onClick={handleClearHistory} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History ({cropResults.length})
            </Button>
            
            {onMultipleCropsComplete && (
              <Button onClick={handleCompleteMultiple} className="bg-crd-orange text-black hover:bg-crd-orange/80">
                Finalize All Crops ({cropResults.length})
              </Button>
            )}
          </>
        )}
      </div>

      {/* Saved Crops Preview */}
      {cropResults.length > 0 && (
        <Card className="p-4 bg-crd-surface border-crd-border">
          <h3 className="text-white font-semibold mb-3">Saved Crops ({cropResults.length})</h3>
          <div className="flex gap-2 flex-wrap">
            {cropResults.map((crop) => (
              <div key={crop.id} className="relative group">
                <img src={crop.imageUrl} alt="Crop preview" className="w-16 h-20 object-cover rounded border border-crd-border" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
                  <div className="flex gap-1">
                    <Button onClick={() => handleDownloadCrop(crop)} size="sm" variant="ghost" className="w-6 h-6 p-0 text-white hover:bg-white/20">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button onClick={() => handleDeleteCrop(crop.id)} size="sm" variant="ghost" className="w-6 h-6 p-0 text-red-400 hover:bg-red-500/20">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};