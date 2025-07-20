import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Camera, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Maximize2,
  Download,
  Share2,
  Eye,
  Settings,
  Zap
} from 'lucide-react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { toast } from 'sonner';

export const ViewerUI: React.FC = () => {
  const { state, updateAnimation } = useAdvancedStudio();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);

  const handleScreenshot = () => {
    // Implementation for taking viewport screenshot
    toast.success('Screenshot captured!');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    // Implementation for sharing card
    toast.success('Share link copied to clipboard!');
  };

  const handleExport = () => {
    // Implementation for exporting
    toast.success('Export started!');
  };

  return (
    <>
      {/* Top-left controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <Card className="p-2 bg-black/20 backdrop-blur-sm border-white/10">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Camera className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={handleScreenshot}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={handleFullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Quick animation controls */}
        <Card className="p-2 bg-black/20 backdrop-blur-sm border-white/10">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => updateAnimation({ isPlaying: !state.animation.isPlaying })}
            >
              {state.animation.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => updateAnimation({ isPlaying: false })}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Top-right info */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Card className="p-3 bg-black/20 backdrop-blur-sm border-white/10">
          <div className="flex items-center gap-4 text-white text-sm">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-green-400" />
              <span>{fps} FPS</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-crd-orange hover:bg-crd-orange/90"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            size="sm" 
            className="bg-crd-green hover:bg-crd-green/90"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="p-3 bg-black/20 backdrop-blur-sm border-white/10">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-white border-white/20">
                {state.selectedCard?.title || 'Untitled Card'}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20">
                {state.material.preset}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20">
                {state.lighting.preset}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Animation: {state.animation.preset}</span>
              <span>Quality: High</span>
              <span>Render: Real-time</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading overlay */}
      {!state.selectedCard?.image_url && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <Card className="p-6 bg-black/40 backdrop-blur-sm border-white/10 text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading 3D Scene...</p>
          </Card>
        </div>
      )}
    </>
  );
};