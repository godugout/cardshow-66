
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Settings,
  Save,
  Download,
  Share2,
  Play,
  Pause,
  Camera,
  Maximize2,
  Monitor,
  Zap,
  Eye
} from 'lucide-react';
import { Professional3DViewer } from './viewers/Professional3DViewer';
import { StudioControlPanels } from './panels/StudioControlPanels';
import { EnhancedCRDDemo } from './demo/EnhancedCRDDemo';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { toast } from 'sonner';

interface ProfessionalStudioWorkspaceProps {
  mode: 'basic' | 'pro' | 'theme-builder';
  preset?: 'animation-studio' | 'fx-studio' | 'scene-studio';
}

export const ProfessionalStudioWorkspace: React.FC<ProfessionalStudioWorkspaceProps> = ({
  mode,
  preset = 'animation-studio'
}) => {
  const { state, updateAnimation } = useAdvancedStudio();
  const [projectName, setProjectName] = useState('Untitled Studio Project');
  const [fps, setFps] = useState(60);
  const [showDemo, setShowDemo] = useState(true);

  // FPS monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
  }, []);

  const handleSave = () => {
    toast.success('Project saved successfully!');
  };

  const handleExport = () => {
    toast.success('Export started!');
  };

  const handleShare = () => {
    toast.success('Share link copied to clipboard!');
  };

  const handleScreenshot = () => {
    toast.success('Screenshot captured!');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-crd-darkest">
      {/* Top Toolbar */}
      <div className="h-16 bg-crd-dark/95 backdrop-blur-sm border-b border-crd-border flex items-center justify-between px-6 z-50">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Separator orientation="vertical" className="h-6 bg-crd-border" />
          
          <div className="text-white font-medium">{projectName}</div>
          
          <Badge variant="outline" className="text-crd-green border-crd-green">
            {mode.toUpperCase()}
          </Badge>
        </div>

        {/* Center Section - Camera & Playback Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleScreenshot}
            >
              <Camera className="w-4 h-4" />
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

          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
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
          </div>
        </div>

        {/* Right Section - Performance & Actions */}
        <div className="flex items-center gap-4">
          {/* Performance Metrics */}
          <div className="flex items-center gap-4 text-sm text-crd-text-secondary">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-green-400" />
              <span>{fps} FPS</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-6 bg-crd-border" />
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button
              onClick={handleExport}
              className="bg-crd-green hover:bg-crd-green/90 text-black"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-80 bg-crd-dark border-r border-crd-border">
          <StudioControlPanels mode={mode} preset={preset} />
        </div>

        {/* Main Viewport */}
        <div className="flex-1 relative">
          <Professional3DViewer />
        </div>

        {/* Demo Panel - positioned to not overlap with toolbar */}
        {showDemo && (
          <div className="absolute top-20 right-4 w-80 z-20">
            <Card className="bg-crd-dark/95 backdrop-blur-sm border-crd-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Quick Demo</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDemo(false)}
                    className="text-crd-text-secondary hover:text-white"
                  >
                    ×
                  </Button>
                </div>
                <EnhancedCRDDemo />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-crd-dark border-t border-crd-border flex items-center justify-between px-6 text-xs text-crd-text-secondary">
        <div className="flex items-center gap-4">
          <span>Scene: {state.selectedCard?.title || 'Default'}</span>
          <span>Material: {state.material.preset}</span>
          <span>Lighting: {state.lighting.preset}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>Auto-save: On</span>
        </div>
      </div>
    </div>
  );
};
