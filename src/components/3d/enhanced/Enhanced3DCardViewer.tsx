
import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Enhanced3DCardMesh } from '@/components/viewer/components/Enhanced3DCardMesh';
import { EffectProvider } from '@/components/viewer/contexts/EffectContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/types/card';

interface Enhanced3DCardViewerProps {
  card: Card;
  className?: string;
  autoEnable?: boolean;
  effects?: Record<string, any>;
  frameConfig?: any;
  selectedFrame?: string;
  onModeChange?: (enabled: boolean) => void;
  fallbackComponent?: React.ReactElement;
}

const CardScene: React.FC<{
  card: Card;
  effects?: Record<string, any>;
  frameConfig?: any;
  selectedFrame?: string;
  isMobile: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}> = ({ card, effects, frameConfig, selectedFrame, isMobile, performanceMode }) => {
  // Adjust settings based on device and performance
  const getSceneSettings = () => {
    if (isMobile) {
      switch (performanceMode) {
        case 'low':
          return {
            shadows: false,
            environmentIntensity: 0.2,
            lightIntensity: 0.4,
            cameraDistance: 5,
            fov: 70
          };
        case 'medium':
          return {
            shadows: false,
            environmentIntensity: 0.4,
            lightIntensity: 0.6,
            cameraDistance: 6,
            fov: 65
          };
        default:
          return {
            shadows: true,
            environmentIntensity: 0.6,
            lightIntensity: 0.7,
            cameraDistance: 6,
            fov: 65
          };
      }
    }
    
    // Desktop settings
    return {
      shadows: true,
      environmentIntensity: 0.8,
      lightIntensity: 0.8,
      cameraDistance: 8,
      fov: 75
    };
  };

  const settings = getSceneSettings();

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 0, settings.cameraDistance]} 
        fov={settings.fov}
      />
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxDistance={isMobile ? 10 : 12}
        minDistance={isMobile ? 3 : 4}
        autoRotate={false}
        autoRotateSpeed={0.5}
        // Mobile touch optimization
        touches={isMobile ? {
          ONE: 2, // TOUCH.ROTATE
          TWO: 1  // TOUCH.DOLLY_PAN
        } : undefined}
        rotateSpeed={isMobile ? 0.8 : 1}
        zoomSpeed={isMobile ? 0.6 : 1}
      />
      
      <ambientLight intensity={settings.lightIntensity * 0.75} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={settings.lightIntensity}
        castShadow={settings.shadows}
      />
      
      <Environment 
        preset="studio" 
        environmentIntensity={settings.environmentIntensity}
      />
      
      <Enhanced3DCardMesh
        card={card}
        rotation={{ x: 0, y: 0 }}
        zoom={isMobile ? 0.85 : 1}
        selectedFrame={selectedFrame}
        frameConfig={frameConfig}
        materialSettings={{
          metalness: performanceMode === 'low' ? 0.2 : 0.3,
          roughness: performanceMode === 'low' ? 0.6 : 0.4,
          clearcoat: performanceMode === 'low' ? 0 : 0.1,
          transmission: 0.0,
          reflectivity: performanceMode === 'low' ? 40 : 60
        }}
      />
    </>
  );
};

export const Enhanced3DCardViewer: React.FC<Enhanced3DCardViewerProps> = ({
  card,
  className = "",
  autoEnable = true,
  effects = {},
  frameConfig,
  selectedFrame,
  onModeChange,
  fallbackComponent
}) => {
  const isMobile = useIsMobile();
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');

  // Auto-adjust performance for mobile
  useEffect(() => {
    if (isMobile) {
      // Start with medium performance on mobile
      setPerformanceMode('medium');
      
      // Further reduce if low-end device detected
      const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                      (navigator as any).deviceMemory <= 2;
      
      if (isLowEnd) {
        setPerformanceMode('low');
      }
    } else {
      setPerformanceMode('high');
    }
  }, [isMobile]);

  return (
    <div className={`w-full h-full relative ${className}`}>
      <EffectProvider 
        initialEffects={effects}
        initialValues={{
          effectValues: effects,
          showEffects: true,
          effectIntensity: Object.values(effects).map((effect: any) => 
            typeof effect?.intensity === 'number' ? effect.intensity : 0
          )
        }}
      >
        <Canvas 
          shadows={performanceMode === 'high'} 
          className="w-full h-full"
          dpr={performanceMode === 'low' ? 0.8 : Math.min(2, window.devicePixelRatio)}
          performance={{ min: 0.5 }}
          frameloop={isMobile ? "demand" : "always"}
        >
          <Suspense fallback={fallbackComponent || null}>
            <CardScene 
              card={card}
              effects={effects}
              frameConfig={frameConfig}
              selectedFrame={selectedFrame}
              isMobile={isMobile}
              performanceMode={performanceMode}
            />
          </Suspense>
        </Canvas>
      </EffectProvider>
      
      {/* Mobile performance indicator */}
      {isMobile && performanceMode !== 'high' && (
        <div className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded z-10">
          📱 {performanceMode === 'low' ? 'Optimized' : 'Mobile'}
        </div>
      )}
    </div>
  );
};
