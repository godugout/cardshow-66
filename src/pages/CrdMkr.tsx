import React, { useState, useRef, useCallback } from 'react';
import { Camera, RotateCcw, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface CardMakerState {
  imageUrl: string | null;
  material: string;
  effects: {
    metallic: number;
    holographic: number;
    chrome: number;
    vintage: number;
  };
  mousePosition: { x: number; y: number };
}

export default function CrdMkr() {
  const [state, setState] = useState<CardMakerState>({
    imageUrl: null,
    material: 'standard',
    effects: {
      metallic: 20,
      holographic: 10,
      chrome: 0,
      vintage: 10
    },
    mousePosition: { x: 0.5, y: 0.5 }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          imageUrl: e.target?.result as string
        }));
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    setState(prev => ({
      ...prev,
      mousePosition: { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
    }));
  }, []);

  const updateEffect = useCallback((effect: keyof typeof state.effects, value: number) => {
    setState(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effect]: value
      }
    }));
  }, []);

  const getCardStyles = (): React.CSSProperties => {
    const { effects, mousePosition } = state;
    const filters: string[] = [];

    if (effects.metallic > 0) {
      filters.push(`brightness(${1 + effects.metallic * 0.002})`);
      filters.push(`contrast(${1 + effects.metallic * 0.003})`);
    }

    if (effects.holographic > 0) {
      const hueShift = mousePosition.x * effects.holographic * 0.6;
      filters.push(`hue-rotate(${hueShift}deg)`);
      filters.push(`saturate(${1 + effects.holographic * 0.003})`);
    }

    if (effects.chrome > 0) {
      filters.push(`brightness(${1 + effects.chrome * 0.002})`);
      filters.push(`contrast(${1 + effects.chrome * 0.004})`);
      filters.push(`saturate(${0.7 + effects.chrome * 0.003})`);
    }

    if (effects.vintage > 0) {
      filters.push(`sepia(${effects.vintage * 0.006})`);
      filters.push(`brightness(${0.9 + effects.vintage * 0.001})`);
    }

    return {
      filter: filters.length > 0 ? filters.join(' ') : 'none',
      transition: 'filter 0.3s ease',
      transform: `perspective(1000px) rotateX(${(mousePosition.y - 0.5) * 10}deg) rotateY(${(mousePosition.x - 0.5) * -10}deg)`,
      transformStyle: 'preserve-3d'
    };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Card Maker</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Save
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Card Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
          <div className="relative">
            {/* Card Container */}
            <div
              ref={cardRef}
              className="relative w-80 h-112 bg-white rounded-xl shadow-2xl overflow-hidden cursor-pointer"
              style={getCardStyles()}
              onMouseMove={handleMouseMove}
            >
              {/* Debug Info */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
                <div>Frame: Default Card</div>
                <div>Material: {state.material}</div>
                <div>Image: {state.imageUrl ? 'loaded' : 'none'}</div>
                <div>Mouse: {state.mousePosition.x.toFixed(2)}, {state.mousePosition.y.toFixed(2)}</div>
              </div>

              {/* Camera Icon */}
              <button
                onClick={handleImageUpload}
                className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                title="Upload image"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Card Content */}
              {state.imageUrl ? (
                <img
                  src={state.imageUrl}
                  alt="Card content"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setState(prev => ({ ...prev, imageUrl: null }));
                    toast.error('Failed to load image - Check the image URL');
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-destructive text-4xl mb-2">!</div>
                  <div className="text-destructive font-medium">Failed to load image</div>
                  <div className="text-destructive/70 text-sm mt-1">Check the image URL</div>
                  <Button
                    onClick={handleImageUpload}
                    className="mt-4"
                    variant="outline"
                  >
                    Upload Image
                  </Button>
                </div>
              )}

              {/* Material overlay effects */}
              {state.effects.holographic > 0 && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(${45 + state.mousePosition.x * 90}deg, 
                      rgba(255,255,255,${state.effects.holographic * 0.001}) 0%, 
                      rgba(0,255,255,${state.effects.holographic * 0.002}) 50%, 
                      rgba(255,0,255,${state.effects.holographic * 0.001}) 100%)`,
                    mixBlendMode: 'overlay'
                  }}
                />
              )}
            </div>

            {/* Card Controls */}
            <div className="mt-6 flex items-center justify-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCw className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">Card Effects</h2>
          
          <div className="space-y-6">
            {/* Material Effects */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Material Effects</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Metallic ({state.effects.metallic}%)</Label>
                    <Slider
                      value={[state.effects.metallic]}
                      onValueChange={(value) => updateEffect('metallic', value[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Holographic ({state.effects.holographic}%)</Label>
                    <Slider
                      value={[state.effects.holographic]}
                      onValueChange={(value) => updateEffect('holographic', value[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Chrome ({state.effects.chrome}%)</Label>
                    <Slider
                      value={[state.effects.chrome]}
                      onValueChange={(value) => updateEffect('chrome', value[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Vintage ({state.effects.vintage}%)</Label>
                    <Slider
                      value={[state.effects.vintage]}
                      onValueChange={(value) => updateEffect('vintage', value[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Upload Image</h3>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">Upload Card Image</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PNG, JPG, WebP up to 10MB
                  </p>
                  <Button onClick={handleImageUpload} className="w-full">
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}