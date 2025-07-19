import React, { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  Camera, 
  Layers, 
  Settings, 
  Clock, 
  FolderOpen, 
  Download,
  Monitor,
  Gauge,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Grid3X3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ProfessionalViewport } from './viewers/ProfessionalViewport';
import { useStudioState } from '@/hooks/useStudioState';

export type StudioMode = 'beginner' | 'pro' | 'director';
export type WorkspacePreset = 'quick-edit' | 'animation-studio' | 'cinematic-mode';

interface ProfessionalStudioWorkspaceProps {
  mode?: StudioMode;
  preset?: WorkspacePreset;
}

export const ProfessionalStudioWorkspace: React.FC<ProfessionalStudioWorkspaceProps> = ({
  mode = 'pro',
  preset = 'animation-studio'
}) => {
  const { studioState, currentCard, updateLighting, updateDesign, updateLayer, selectLayer } = useStudioState();
  
  // UI State
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('assets');
  const [activeRightTab, setActiveRightTab] = useState('properties');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames] = useState(120);
  
  // Performance monitoring
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(16.7);
  
  // Viewport controls
  const [cameraPreset, setCameraPreset] = useState('perspective');
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  
  // Simulate performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(Math.random() * 10) + 55);
      setRenderTime(Math.random() * 5 + 14);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cameraPresets = [
    { id: 'perspective', name: 'Perspective', icon: Camera },
    { id: 'orthographic', name: 'Orthographic', icon: Grid3X3 },
    { id: 'cinematic', name: 'Cinematic', icon: Monitor },
  ];

  const workspacePresets = [
    { id: 'quick-edit', name: 'Quick Edit', description: 'Streamlined for fast edits' },
    { id: 'animation-studio', name: 'Animation Studio', description: 'Full animation timeline' },
    { id: 'cinematic-mode', name: 'Cinematic Mode', description: 'Movie-grade rendering' },
  ];

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const getPerformanceColor = (value: number, good: number, warning: number) => {
    if (value >= good) return 'text-crd-green';
    if (value >= warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-screen w-full bg-crd-darkest text-crd-text-primary overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 bg-crd-dark border-b border-crd-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-crd-gradient rounded-sm"></div>
            <span className="font-bold text-white">CRD Studio</span>
            <Badge variant="outline" className="text-xs">{mode.toUpperCase()}</Badge>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Workspace Presets */}
          <div className="flex items-center gap-1">
            {workspacePresets.map((p) => (
              <Button
                key={p.id}
                variant={preset === p.id ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Performance Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              <span className={getPerformanceColor(fps, 55, 30)}>{fps} FPS</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className={getPerformanceColor(20 - renderTime, 15, 10)}>{renderTime.toFixed(1)}ms</span>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Camera Controls */}
          <div className="flex items-center gap-1">
            {cameraPresets.map((camera) => (
              <Button
                key={camera.id}
                variant={cameraPreset === camera.id ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCameraPreset(camera.id)}
              >
                <camera.icon className="w-3 h-3" />
              </Button>
            ))}
          </div>
          
          {/* View Options */}
          <div className="flex items-center gap-1">
            <Button
              variant={showGrid ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3X3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="h-[calc(100vh-3rem)]">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Asset Library & Scene Hierarchy */}
          {!leftPanelCollapsed && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full bg-crd-dark border-r border-crd-border flex flex-col">
                  <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2 bg-crd-darkest">
                      <TabsTrigger value="assets" className="text-xs">
                        <FolderOpen className="w-3 h-3 mr-1" />
                        Assets
                      </TabsTrigger>
                      <TabsTrigger value="hierarchy" className="text-xs">
                        <Layers className="w-3 h-3 mr-1" />
                        Scene
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="flex-1 p-3 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Templates</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="aspect-[3/4] bg-crd-darkest border-crd-border hover:border-crd-accent cursor-pointer">
                              <div className="w-full h-full rounded-sm bg-gradient-to-br from-crd-accent/20 to-crd-accent/5"></div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Materials</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {['Metallic', 'Glossy', 'Matte', 'Holographic', 'Carbon', 'Glass'].map(material => (
                            <div key={material} className="aspect-square bg-crd-darkest border border-crd-border rounded-sm flex items-center justify-center text-xs cursor-pointer hover:border-crd-accent">
                              {material}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Effects</h3>
                        <div className="space-y-1">
                          {['Glow', 'Particle System', 'Lightning', 'Smoke', 'Fire'].map(effect => (
                            <div key={effect} className="p-2 bg-crd-darkest border border-crd-border rounded-sm text-xs hover:border-crd-accent cursor-pointer">
                              {effect}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="hierarchy" className="flex-1 p-3">
                      <div className="space-y-1">
                        {studioState.layers.map((layer, index) => (
                          <div
                            key={layer.id}
                            className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer ${
                              studioState.selectedLayerId === layer.id 
                                ? 'bg-crd-accent/20 border border-crd-accent' 
                                : 'hover:bg-crd-darkest'
                            }`}
                            onClick={() => selectLayer(layer.id)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLayer(layer.id, { visible: !layer.visible });
                              }}
                            >
                              {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLayer(layer.id, { locked: !layer.locked });
                              }}
                            >
                              {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </Button>
                            <span className="text-xs flex-1">{layer.name}</span>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {layer.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-crd-border hover:bg-crd-accent transition-colors" />
            </>
          )}

          {/* Center Panel - 3D Viewport */}
          <Panel defaultSize={leftPanelCollapsed ? 80 : 60} minSize={40}>
            <div className="h-full relative">
              {/* Viewport Toolbar */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                >
                  {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </div>

              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                >
                  {rightPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>

              {/* 3D Viewport */}
              <ProfessionalViewport />
            </div>
          </Panel>

          {/* Right Panel - Properties */}
          {!rightPanelCollapsed && (
            <>
              <PanelResizeHandle className="w-1 bg-crd-border hover:bg-crd-accent transition-colors" />
              <Panel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full bg-crd-dark border-l border-crd-border flex flex-col">
                  <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2 bg-crd-darkest">
                      <TabsTrigger value="properties" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Properties
                      </TabsTrigger>
                      <TabsTrigger value="export" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="properties" className="flex-1 p-3 space-y-4">
                      {/* Transform */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Transform</h3>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-crd-text-secondary">Position X</label>
                            <Slider defaultValue={[0]} max={100} min={-100} step={1} className="mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-crd-text-secondary">Position Y</label>
                            <Slider defaultValue={[0]} max={100} min={-100} step={1} className="mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-crd-text-secondary">Rotation</label>
                            <Slider defaultValue={[0]} max={360} min={0} step={1} className="mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-crd-text-secondary">Scale</label>
                            <Slider defaultValue={[100]} max={200} min={10} step={1} className="mt-1" />
                          </div>
                        </div>
                      </div>

                      {/* Lighting */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Lighting</h3>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-crd-text-secondary">Ambient Intensity</label>
                            <Slider 
                              value={[studioState.lighting.ambientIntensity]} 
                              onValueChange={([value]) => updateLighting({ ambientIntensity: value })}
                              max={100} 
                              min={0} 
                              step={1} 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <label className="text-xs text-crd-text-secondary">Shadow Intensity</label>
                            <Slider 
                              value={[studioState.lighting.shadowIntensity]} 
                              onValueChange={([value]) => updateLighting({ shadowIntensity: value })}
                              max={100} 
                              min={0} 
                              step={1} 
                              className="mt-1" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Materials */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Material</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['Default', 'Metallic', 'Glossy', 'Matte'].map(material => (
                            <Button key={material} variant="outline" size="sm" className="text-xs">
                              {material}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="export" className="flex-1 p-3 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Export Options</h3>
                        <div className="space-y-2">
                          <Button className="w-full" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            High-Res PNG
                          </Button>
                          <Button variant="outline" className="w-full" size="sm">
                            Export 3D Model
                          </Button>
                          <Button variant="outline" className="w-full" size="sm">
                            Share to Marketplace
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Format Settings</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Resolution:</span>
                            <span>4K (3840×2160)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span>PNG (Alpha)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality:</span>
                            <span>Ultra</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Bottom Panel - Simple Timeline Placeholder */}
      {!bottomPanelCollapsed && (
        <div className="h-64 bg-crd-dark border-t border-crd-border flex items-center justify-center">
          <p className="text-crd-text-secondary text-sm">Timeline (Coming Soon)</p>
        </div>
      )}

      {/* Bottom Panel Collapsed State */}
      {bottomPanelCollapsed && (
        <div className="h-8 bg-crd-dark border-t border-crd-border flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBottomPanelCollapsed(false)}
          >
            <ChevronRight className="w-4 h-4 rotate-90" />
          </Button>
        </div>
      )}
    </div>
  );
};