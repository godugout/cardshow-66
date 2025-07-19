import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Move3D,
  Eye,
  Settings,
  Maximize,
  Minimize,
  Camera,
  Grid3X3,
  Sun,
  Orbit
} from 'lucide-react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { toast } from 'sonner';

interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

interface ViewerSettings {
  showGrid: boolean;
  showAxes: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  fullscreen: boolean;
  fov: number;
  zoom: number;
}

export const ViewerUI: React.FC = () => {
  const { state, updateAnimation } = useAdvancedStudio();
  const [showControls, setShowControls] = useState(true);
  const [viewerSettings, setViewerSettings] = useState<ViewerSettings>({
    showGrid: false,
    showAxes: false,
    wireframe: false,
    autoRotate: false,
    fullscreen: false,
    fov: 50,
    zoom: 100
  });
  
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    x: 0,
    y: 0,
    z: 5
  });

  const controlsRef = useRef<HTMLDivElement>(null);

  const cameraPresets = [
    { name: 'Front', position: { x: 0, y: 0, z: 5 } },
    { name: 'Back', position: { x: 0, y: 0, z: -5 } },
    { name: 'Left', position: { x: -5, y: 0, z: 0 } },
    { name: 'Right', position: { x: 5, y: 0, z: 0 } },
    { name: 'Top', position: { x: 0, y: 5, z: 0 } },
    { name: 'Bottom', position: { x: 0, y: -5, z: 0 } },
    { name: 'Isometric', position: { x: 3, y: 3, z: 3 } }
  ];

  const handlePlayPause = () => {
    updateAnimation({ isPlaying: !state.animation.isPlaying });
    toast.success(state.animation.isPlaying ? 'Animation paused' : 'Animation playing');
  };

  const handleReset = () => {
    setCameraPosition({ x: 0, y: 0, z: 5 });
    setViewerSettings(prev => ({ 
      ...prev, 
      zoom: 100, 
      fov: 50, 
      autoRotate: false 
    }));
    updateAnimation({ isPlaying: false, speed: 50, amplitude: 50 });
    toast.success('View reset');
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' 
      ? Math.min(viewerSettings.zoom + 20, 300)
      : Math.max(viewerSettings.zoom - 20, 25);
    
    setViewerSettings(prev => ({ ...prev, zoom: newZoom }));
    
    // Update camera position based on zoom
    const zoomFactor = newZoom / 100;
    setCameraPosition(prev => ({
      ...prev,
      z: 5 / zoomFactor
    }));
  };

  const handleCameraPreset = (preset: { position: CameraPosition }) => {
    setCameraPosition(preset.position);
    toast.success(`Camera moved to ${preset.position.x}, ${preset.position.y}, ${preset.position.z}`);
  };

  const toggleFullscreen = () => {
    setViewerSettings(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
    toast.success(viewerSettings.fullscreen ? 'Exited fullscreen' : 'Entered fullscreen');
  };

  const updateSetting = (key: keyof ViewerSettings, value: any) => {
    setViewerSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Main Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Playback Controls */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 p-2">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={handlePlayPause}
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
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Zoom Controls */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 p-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => handleZoom('in')}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => handleZoom('out')}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="w-20">
              <Slider
                value={[viewerSettings.zoom]}
                onValueChange={([value]) => updateSetting('zoom', value)}
                max={300}
                min={25}
                step={5}
                className="w-full"
                orientation="vertical"
              />
            </div>
            
            <div className="text-xs text-white/70 text-center">
              {viewerSettings.zoom}%
            </div>
          </div>
        </Card>

        {/* Fullscreen Toggle */}
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-white hover:bg-white/20 bg-black/20 backdrop-blur-sm border border-white/10"
          onClick={toggleFullscreen}
        >
          {viewerSettings.fullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Camera Preset Buttons */}
      <div className="absolute top-4 left-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 p-2">
          <div className="grid grid-cols-2 gap-1">
            {cameraPresets.slice(0, 6).map(preset => (
              <Button
                key={preset.name}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 text-xs px-2 py-1"
                onClick={() => handleCameraPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Extended Controls Panel */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Camera Controls */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                </Label>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-white/70 text-xs">Field of View: {viewerSettings.fov}°</Label>
                    <Slider
                      value={[viewerSettings.fov]}
                      onValueChange={([value]) => updateSetting('fov', value)}
                      max={120}
                      min={20}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-xs">Auto Rotate</Label>
                    <Switch
                      checked={viewerSettings.autoRotate}
                      onCheckedChange={(checked) => updateSetting('autoRotate', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Display
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-xs">Show Grid</Label>
                    <Switch
                      checked={viewerSettings.showGrid}
                      onCheckedChange={(checked) => updateSetting('showGrid', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-xs">Show Axes</Label>
                    <Switch
                      checked={viewerSettings.showAxes}
                      onCheckedChange={(checked) => updateSetting('showAxes', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-xs">Wireframe</Label>
                    <Switch
                      checked={viewerSettings.wireframe}
                      onCheckedChange={(checked) => updateSetting('wireframe', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Animation Controls */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium flex items-center gap-2">
                  <Orbit className="w-4 h-4" />
                  Animation
                </Label>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-white/70 text-xs">Speed: {state.animation.speed}%</Label>
                    <Slider
                      value={[state.animation.speed]}
                      onValueChange={([value]) => updateAnimation({ speed: value })}
                      max={200}
                      min={10}
                      step={10}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white/70 text-xs">Amplitude: {state.animation.amplitude}%</Label>
                    <Slider
                      value={[state.animation.amplitude]}
                      onValueChange={([value]) => updateAnimation({ amplitude: value })}
                      max={100}
                      min={0}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Camera Position Display */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-white/70">
                <span>Position:</span>
                <span>
                  X: {cameraPosition.x.toFixed(1)} 
                  Y: {cameraPosition.y.toFixed(1)} 
                  Z: {cameraPosition.z.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => handleCameraPreset(cameraPresets[6])} // Isometric
              >
                <Move3D className="w-4 h-4 mr-1" />
                Isometric
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => updateSetting('autoRotate', !viewerSettings.autoRotate)}
              >
                <Orbit className="w-4 h-4 mr-1" />
                {viewerSettings.autoRotate ? 'Stop' : 'Auto'} Rotate
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Position Indicator */}
      <div className="absolute bottom-4 right-4">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-2">
          <div className="text-xs text-white/70">
            Camera: {cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)}
          </div>
        </Card>
      </div>
    </>
  );
};