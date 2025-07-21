// 3D Studio Main Page - Advanced Card Visualization Engine
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { PlatformHeader } from '@/components/ui/design-system/organisms/PlatformHeader';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { 
  Palette, 
  Camera, 
  Download,
  Settings,
  Layers,
  Sparkles,
  Chrome,
  Zap,
  RotateCcw,
  Maximize2,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Card3DStudioProps {
  className?: string;
}

interface EffectPreset {
  id: string;
  name: string;
  type: 'holographic' | 'chrome' | 'foil' | 'crystal' | 'matte';
  icon: React.ReactNode;
  description: string;
  settings: {
    metalness: number;
    roughness: number;
    emissive: string;
    intensity: number;
  };
}

const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: 'holographic',
    name: 'Holographic',
    type: 'holographic',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Rainbow iridescence effect',
    settings: { metalness: 0.1, roughness: 0.1, emissive: '#4a9eff', intensity: 0.8 }
  },
  {
    id: 'chrome',
    name: 'Chrome',
    type: 'chrome',
    icon: <Chrome className="w-4 h-4" />,
    description: 'Metallic chrome finish',
    settings: { metalness: 1.0, roughness: 0.1, emissive: '#000000', intensity: 0.2 }
  },
  {
    id: 'foil',
    name: 'Foil',
    type: 'foil',
    icon: <Zap className="w-4 h-4" />,
    description: 'Shimmering foil texture',
    settings: { metalness: 0.8, roughness: 0.3, emissive: '#ffd700', intensity: 0.5 }
  }
];

// Simple 3D Card Component
const Card3D: React.FC<{ 
  textureUrl?: string; 
  effectPreset: EffectPreset;
  autoRotate: boolean;
}> = ({ textureUrl, effectPreset, autoRotate }) => {
  return (
    <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
      {/* Standard trading card proportions: 2.5 x 3.5 x 0.1 */}
      <boxGeometry args={[2.5, 3.5, 0.1]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={effectPreset.settings.metalness}
        roughness={effectPreset.settings.roughness}
        emissive={effectPreset.settings.emissive}
        emissiveIntensity={effectPreset.settings.intensity}
        envMapIntensity={1.5}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
};

export const Card3DStudio: React.FC<Card3DStudioProps> = ({ className }) => {
  const [selectedEffect, setSelectedEffect] = useState<EffectPreset>(EFFECT_PRESETS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const handleExport = useCallback(() => {
    // TODO: Implement high-resolution rendering export
    console.log('Exporting 3D render...');
  }, []);

  return (
    <div className={cn("min-h-screen bg-crd-black", className)}>
      <PlatformHeader 
        title="3D Studio"
        subtitle="Professional card visualization and effects"
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Effects Library */}
        <div className="w-80 bg-crd-surface border-r border-crd-border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-crd-text mb-2">Effects Library</h3>
            <p className="text-sm text-crd-text-dim">Choose a visual effect for your card</p>
          </div>

          <div className="space-y-3 mb-8">
            {EFFECT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedEffect(preset)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                  selectedEffect.id === preset.id
                    ? "border-crd-orange bg-crd-orange/10"
                    : "border-crd-border bg-crd-black hover:border-crd-orange/50"
                )}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-crd-surface rounded-lg flex items-center justify-center">
                    {preset.icon}
                  </div>
                  <span className="font-medium text-crd-text">{preset.name}</span>
                </div>
                <p className="text-xs text-crd-text-dim">{preset.description}</p>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-crd-text">Auto Rotate</span>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={cn(
                  "w-12 h-6 rounded-full border transition-colors",
                  autoRotate 
                    ? "bg-crd-orange border-crd-orange" 
                    : "bg-crd-black border-crd-border"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-transform",
                  autoRotate ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>

            <CRDButton
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </CRDButton>
          </div>
        </div>

        {/* Center Panel - 3D Viewport */}
        <div className="flex-1 relative">
          {/* Viewport Header */}
          <div className="h-16 bg-crd-surface/50 border-b border-crd-border flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-crd-text-dim">3D Viewport</span>
              <div className="text-xs text-crd-text-muted">
                {selectedEffect.name} Effect
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CRDButton variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4" />
              </CRDButton>
              <CRDButton variant="ghost" size="sm">
                <Maximize2 className="w-4 h-4" />
              </CRDButton>
              <CRDButton variant="blue" size="sm" onClick={handleExport}>
                <Camera className="w-4 h-4 mr-2" />
                Export
              </CRDButton>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="h-[calc(100%-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
              {/* Camera */}
              <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
              
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[-5, -5, 2]} intensity={0.5} color="#4a9eff" />
              
              {/* Environment */}
              <Environment preset="studio" backgroundIntensity={0.5} />
              
              {/* 3D Card */}
              <Card3D 
                effectPreset={selectedEffect}
                autoRotate={autoRotate}
              />
              
              {/* Controls */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={10}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                dampingFactor={0.05}
                enableDamping={true}
              />
            </Canvas>
          </div>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4">
            <CRDCard className="p-3 bg-crd-black/80 backdrop-blur-md border-crd-border">
              <div className="text-xs text-crd-text-dim space-y-1">
                <div>Click & drag to rotate</div>
                <div>Scroll to zoom</div>
                <div>Effect: {selectedEffect.name}</div>
              </div>
            </CRDCard>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 bg-crd-surface border-l border-crd-border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-crd-text mb-2">Material Properties</h3>
            <p className="text-sm text-crd-text-dim">Fine-tune the visual effects</p>
          </div>

          <div className="space-y-6">
            {/* Material Settings */}
            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">
                Metalness
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue={selectedEffect.settings.metalness}
                className="w-full h-2 bg-crd-black rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-crd-text-muted mt-1">
                {selectedEffect.settings.metalness}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">
                Roughness
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue={selectedEffect.settings.roughness}
                className="w-full h-2 bg-crd-black rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-crd-text-muted mt-1">
                {selectedEffect.settings.roughness}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-crd-text mb-2">
                Emission Intensity
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue={selectedEffect.settings.intensity}
                className="w-full h-2 bg-crd-black rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-crd-text-muted mt-1">
                {selectedEffect.settings.intensity}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="mt-8 pt-6 border-t border-crd-border">
            <h4 className="text-sm font-medium text-crd-text mb-4">Export Options</h4>
            <div className="space-y-3">
              <CRDButton variant="blue" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                High-Res PNG
              </CRDButton>
              <CRDButton variant="ghost" size="sm" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                360° Video
              </CRDButton>
              <CRDButton variant="ghost" size="sm" className="w-full">
                <Layers className="w-4 h-4 mr-2" />
                Interactive Embed
              </CRDButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};