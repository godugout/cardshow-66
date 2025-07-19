import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  OrthographicCamera,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewport,
  TransformControls,
  Stats,
  CameraControls,
  Text,
  useHelper
} from '@react-three/drei';
import { 
  EffectComposer,
  DepthOfField,
  Bloom,
  ToneMapping,
  SSAO
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { 
  Vector3, 
  Euler, 
  DirectionalLightHelper, 
  SpotLightHelper,
  PerspectiveCamera as ThreePerspectiveCamera,
  OrthographicCamera as ThreeOrthographicCamera,
  MathUtils
} from 'three';
import { useGesture } from '@use-gesture/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  Monitor, 
  Grid3X3, 
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Focus,
  Aperture,
  Timer,
  Maximize2,
  Move3D,
  RotateCcw as Rotate,
  Square,
  Smartphone,
  Instagram,
  Film,
  Orbit
} from 'lucide-react';
import { useStudioState } from '@/hooks/useStudioState';

export type CameraPreset = 'hero-shot' | 'product-view' | 'cinematic' | 'social-media' | '360-showcase';
export type ShadingMode = 'wireframe' | 'material-preview' | 'final-render' | 'normals' | 'depth';
export type NavigationStyle = 'maya' | 'blender' | 'cinema4d' | 'touch';

interface ViewportSettings {
  shadingMode: ShadingMode;
  showGrid: boolean;
  showGizmos: boolean;
  showStats: boolean;
  enablePhysics: boolean;
  enableMotionBlur: boolean;
  enableDepthOfField: boolean;
  focalLength: number;
  aperture: number;
  focusDistance: number;
  filmGrain: number;
  exposure: number;
}

interface CameraState {
  preset: CameraPreset;
  position: Vector3;
  target: Vector3;
  fov: number;
  near: number;
  far: number;
  orthographic: boolean;
}

interface PerformanceMetrics {
  fps: number;
  triangles: number;
  drawCalls: number;
  memoryUsage: number;
}

// Camera preset configurations
const CAMERA_PRESETS: Record<CameraPreset, Partial<CameraState>> = {
  'hero-shot': {
    position: new Vector3(3, 2, 4),
    target: new Vector3(0, 0, 0),
    fov: 35,
    orthographic: false
  },
  'product-view': {
    position: new Vector3(0, 0, 5),
    target: new Vector3(0, 0, 0),
    fov: 50,
    orthographic: true
  },
  'cinematic': {
    position: new Vector3(-2, 1, 3),
    target: new Vector3(0, 0, 0),
    fov: 24,
    orthographic: false
  },
  'social-media': {
    position: new Vector3(0, 1, 3),
    target: new Vector3(0, 0, 0),
    fov: 60,
    orthographic: false
  },
  '360-showcase': {
    position: new Vector3(4, 2, 0),
    target: new Vector3(0, 0, 0),
    fov: 45,
    orthographic: false
  }
};

// Professional lighting setup
const ProfessionalLighting: React.FC = () => {
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  
  // useHelper(directionalRef, DirectionalLightHelper, 1);
  // useHelper(spotRef, SpotLightHelper, 'cyan');

  return (
    <>
      {/* Key Light */}
      <directionalLight
        ref={directionalRef}
        position={[5, 5, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill Light */}
      <directionalLight
        position={[-3, 2, 3]}
        intensity={0.5}
        color="#87CEEB"
      />
      
      {/* Rim Light */}
      <spotLight
        ref={spotRef}
        position={[0, 5, -5]}
        intensity={1}
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow
      />
      
      {/* Ambient */}
      <ambientLight intensity={0.3} />
    </>
  );
};

// Animated camera system
const AnimatedCamera: React.FC<{ 
  cameraState: CameraState; 
  onCameraUpdate: (position: Vector3, target: Vector3) => void;
}> = ({ cameraState, onCameraUpdate }) => {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const animationProgress = useRef(0);

  useEffect(() => {
    if (cameraState.preset === '360-showcase') {
      setIsAnimating(true);
      animationProgress.current = 0;
    } else {
      setIsAnimating(false);
      targetPosition.current.copy(cameraState.position);
      targetLookAt.current.copy(cameraState.target);
    }
  }, [cameraState.preset]);

  useFrame((state, delta) => {
    if (cameraState.preset === '360-showcase' && isAnimating) {
      // 360 orbital animation
      const radius = 4;
      const speed = 0.5;
      animationProgress.current += delta * speed;
      
      const x = Math.cos(animationProgress.current) * radius;
      const z = Math.sin(animationProgress.current) * radius;
      const y = 2 + Math.sin(animationProgress.current * 2) * 0.5;
      
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
      onCameraUpdate(camera.position.clone(), new Vector3(0, 0, 0));
    } else if (!isAnimating) {
      // Smooth transition to preset
      camera.position.lerp(targetPosition.current, delta * 2);
      
      const lookAtTarget = new Vector3();
      lookAtTarget.copy(camera.position).add(
        targetLookAt.current.clone().sub(camera.position).normalize()
      );
      camera.lookAt(targetLookAt.current);
    }
  });

  return null;
};

// Performance monitor
const PerformanceMonitor: React.FC<{ onMetricsUpdate: (metrics: PerformanceMetrics) => void }> = ({ onMetricsUpdate }) => {
  const { gl, scene } = useThree();
  
  useFrame(() => {
    const info = gl.info;
    const metrics: PerformanceMetrics = {
      fps: Math.round(1 / (performance.now() / 1000 - (performance.now() / 1000))),
      triangles: info.render.triangles,
      drawCalls: info.render.calls,
      memoryUsage: (info.memory.geometries + info.memory.textures) * 0.001 // Convert to MB
    };
    onMetricsUpdate(metrics);
  });

  return null;
};

// Main card display component
const StudioCard: React.FC<{ shadingMode: ShadingMode }> = ({ shadingMode }) => {
  const { currentCard } = useStudioState();
  
  if (!currentCard) {
    return (
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        No card loaded
      </Text>
    );
  }

  return (
    <group>
      {/* Card mesh would go here */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.5, 0.05]} />
        {shadingMode === 'wireframe' ? (
          <meshBasicMaterial color="white" {...{ wireframe: true }} />
        ) : (
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={shadingMode === 'material-preview' ? 0.8 : 0.1}
            roughness={shadingMode === 'material-preview' ? 0.2 : 0.8}
            clearcoat={shadingMode === 'final-render' ? 1 : 0}
            clearcoatRoughness={0.1}
          />
        )}
      </mesh>
      
      {/* Card texture/image would be mapped here */}
      {currentCard.image_url && (
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[2.4, 3.4]} />
          <meshBasicMaterial 
            transparent
            opacity={shadingMode === 'wireframe' ? 0.3 : 1}
          />
        </mesh>
      )}
    </group>
  );
};

// Main viewport component
export const ProfessionalViewport: React.FC = () => {
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    shadingMode: 'final-render',
    showGrid: true,
    showGizmos: true,
    showStats: false,
    enablePhysics: false,
    enableMotionBlur: false,
    enableDepthOfField: true,
    focalLength: 50,
    aperture: 0.8,
    focusDistance: 5,
    filmGrain: 0,
    exposure: 1
  });

  const [cameraState, setCameraState] = useState<CameraState>({
    preset: 'hero-shot',
    position: new Vector3(3, 2, 4),
    target: new Vector3(0, 0, 0),
    fov: 35,
    near: 0.1,
    far: 1000,
    orthographic: false
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    triangles: 0,
    drawCalls: 0,
    memoryUsage: 0
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [navigationStyle, setNavigationStyle] = useState<NavigationStyle>('maya');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera preset handler
  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    const presetConfig = CAMERA_PRESETS[preset];
    setCameraState(prev => ({
      ...prev,
      preset,
      ...presetConfig
    }));
  }, []);

  // Settings update handlers
  const updateViewportSetting = useCallback(<K extends keyof ViewportSettings>(
    key: K, 
    value: ViewportSettings[K]
  ) => {
    setViewportSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Performance color coding
  const getPerformanceColor = (value: number, good: number, warning: number) => {
    if (value >= good) return 'text-crd-green';
    if (value >= warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Touch gesture handling
  const bind = useGesture({
    onPinch: ({ offset: [scale] }) => {
      // Handle pinch zoom
    },
    onDrag: ({ offset: [x, y], ctrlKey, shiftKey }) => {
      // Handle pan/rotate based on modifiers
    }
  });

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Viewport Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Camera Presets */}
          <Card className="bg-black/60 backdrop-blur-sm border-white/10 p-2">
            <div className="flex items-center gap-1">
              {Object.keys(CAMERA_PRESETS).map((preset) => (
                <Button
                  key={preset}
                  variant={cameraState.preset === preset ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleCameraPreset(preset as CameraPreset)}
                >
                  {preset === 'hero-shot' && <Camera className="w-3 h-3" />}
                  {preset === 'product-view' && <Monitor className="w-3 h-3" />}
                  {preset === 'cinematic' && <Film className="w-3 h-3" />}
                  {preset === 'social-media' && <Smartphone className="w-3 h-3" />}
                  {preset === '360-showcase' && <Orbit className="w-3 h-3" />}
                </Button>
              ))}
            </div>
          </Card>

          {/* Shading Modes */}
          <Card className="bg-black/60 backdrop-blur-sm border-white/10 p-2">
            <Select 
              value={viewportSettings.shadingMode} 
              onValueChange={(value: ShadingMode) => updateViewportSetting('shadingMode', value)}
            >
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wireframe">Wireframe</SelectItem>
                <SelectItem value="material-preview">Material</SelectItem>
                <SelectItem value="final-render">Final Render</SelectItem>
                <SelectItem value="normals">Normals</SelectItem>
                <SelectItem value="depth">Depth</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <Card className="bg-black/60 backdrop-blur-sm border-white/10 p-2">
            <div className="flex items-center gap-1">
              <Button
                variant={viewportSettings.showGrid ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => updateViewportSetting('showGrid', !viewportSettings.showGrid)}
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
              <Button
                variant={viewportSettings.showGizmos ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => updateViewportSetting('showGizmos', !viewportSettings.showGizmos)}
              >
                <Move3D className="w-3 h-3" />
              </Button>
              <Button
                variant={viewportSettings.showStats ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => updateViewportSetting('showStats', !viewportSettings.showStats)}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </Card>

          {/* Animation Controls */}
          <Card className="bg-black/60 backdrop-blur-sm border-white/10 p-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Overlay */}
      {viewportSettings.showStats && (
        <div className="absolute top-20 left-4 z-10">
          <Card className="bg-black/80 backdrop-blur-sm border-white/10 p-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span>FPS:</span>
                <span className={getPerformanceColor(performanceMetrics.fps, 55, 30)}>
                  {performanceMetrics.fps}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Triangles:</span>
                <span>{performanceMetrics.triangles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Draw Calls:</span>
                <span>{performanceMetrics.drawCalls}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Memory:</span>
                <span>{performanceMetrics.memoryUsage.toFixed(1)} MB</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Camera Settings Panel */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-black/80 backdrop-blur-sm border-white/10 p-4 w-64">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/70 mb-1 block">Focal Length</label>
              <Slider
                value={[viewportSettings.focalLength]}
                onValueChange={([value]) => updateViewportSetting('focalLength', value)}
                min={14}
                max={200}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-white/50">{viewportSettings.focalLength}mm</span>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1 block">Aperture</label>
              <Slider
                value={[viewportSettings.aperture]}
                onValueChange={([value]) => updateViewportSetting('aperture', value)}
                min={0.1}
                max={5.6}
                step={0.1}
                className="w-full"
              />
              <span className="text-xs text-white/50">f/{viewportSettings.aperture}</span>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1 block">Focus Distance</label>
              <Slider
                value={[viewportSettings.focusDistance]}
                onValueChange={([value]) => updateViewportSetting('focusDistance', value)}
                min={0.1}
                max={50}
                step={0.1}
                className="w-full"
              />
              <span className="text-xs text-white/50">{viewportSettings.focusDistance}m</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main 3D Canvas */}
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ position: [3, 2, 4], fov: 35 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        {/* Environment */}
        <Environment preset="studio" backgroundIntensity={0.5} />
        
        {/* Lighting */}
        <ProfessionalLighting />
        
        {/* Grid */}
        {viewportSettings.showGrid && (
          <Grid 
            args={[10, 10]} 
            cellSize={0.5} 
            cellThickness={0.5} 
            cellColor="white" 
            sectionSize={5} 
            sectionThickness={1} 
            sectionColor="white" 
            fadeDistance={25} 
            fadeStrength={1} 
            followCamera={false} 
            infiniteGrid={true} 
          />
        )}

        {/* Main card */}
        <StudioCard shadingMode={viewportSettings.shadingMode} />

        {/* Camera system */}
        <AnimatedCamera 
          cameraState={cameraState}
          onCameraUpdate={(pos, target) => {
            setCameraState(prev => ({ ...prev, position: pos, target }));
          }}
        />

        {/* Controls */}
        {navigationStyle === 'maya' && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.05}
            enableDamping={true}
            panSpeed={0.8}
            rotateSpeed={0.4}
            zoomSpeed={0.6}
            minDistance={1}
            maxDistance={20}
          />
        )}

        {/* Post-processing effects */}
        <EffectComposer>
          {viewportSettings.enableDepthOfField && (
            <DepthOfField
              focusDistance={viewportSettings.focusDistance}
              focalLength={viewportSettings.focalLength / 1000}
              bokehScale={2}
              height={480}
            />
          )}
          <Bloom intensity={0.1} luminanceThreshold={0.9} />
          <ToneMapping exposure={viewportSettings.exposure} />
          {viewportSettings.shadingMode === 'final-render' && (
            <SSAO 
              intensity={0.1} 
              radius={0.1} 
              luminanceInfluence={0.1} 
              color={new THREE.Color('black')}
            />
          )}
        </EffectComposer>

        {/* Gizmos */}
        {viewportSettings.showGizmos && (
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport 
              axisColors={['#ff4757', '#2ed573', '#3742fa']} 
              labelColor="white" 
            />
          </GizmoHelper>
        )}

        {/* Performance monitoring */}
        <PerformanceMonitor onMetricsUpdate={setPerformanceMetrics} />

        {/* Stats (optional Three.js stats) */}
        {viewportSettings.showStats && <Stats />}
      </Canvas>
    </div>
  );
};