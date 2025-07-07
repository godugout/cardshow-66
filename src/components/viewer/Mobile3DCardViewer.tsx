import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { useIsMobile } from '@/hooks/use-mobile';
import { Responsive3DCardMesh } from './components/Responsive3DCardMesh';
import { EffectProvider } from './contexts/EffectContext';
import type { Card } from '@/types/card';

interface Mobile3DCardViewerProps {
  card: Card;
  className?: string;
  effects?: Record<string, any>;
  frameConfig?: any;
  selectedFrame?: string;
  onPerformanceChange?: (isLowPerformance: boolean) => void;
  fallbackComponent?: React.ReactElement;
}

const Mobile3DScene: React.FC<{
  card: Card;
  effects?: Record<string, any>;
  frameConfig?: any;
  selectedFrame?: string;
  isMobile: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}> = ({ card, effects, frameConfig, selectedFrame, isMobile, performanceMode }) => {
  // Adjust settings based on performance mode
  const getSceneSettings = () => {
    switch (performanceMode) {
      case 'low':
        return {
          shadows: false,
          environmentIntensity: 0.3,
          lightIntensity: 0.5,
          pixelRatio: 0.8
        };
      case 'medium':
        return {
          shadows: false,
          environmentIntensity: 0.5,
          lightIntensity: 0.7,
          pixelRatio: 1
        };
      default:
        return {
          shadows: true,
          environmentIntensity: 0.8,
          lightIntensity: 0.8,
          pixelRatio: Math.min(2, window.devicePixelRatio)
        };
    }
  };

  const settings = getSceneSettings();

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={isMobile ? [0, 0, 6] : [0, 0, 8]} 
        fov={isMobile ? 65 : 75}
      />
      <OrbitControls 
        enablePan={false}
        enableZoom={isMobile}
        enableRotate={true}
        maxDistance={isMobile ? 10 : 12}
        minDistance={isMobile ? 3 : 4}
        autoRotate={false}
        // Touch-friendly settings
        touches={{
          ONE: isMobile ? 2 : 2, // TOUCH.ROTATE
          TWO: isMobile ? 1 : 1  // TOUCH.DOLLY_PAN
        }}
        rotateSpeed={isMobile ? 0.8 : 1}
        zoomSpeed={isMobile ? 0.6 : 1}
      />
      
      <ambientLight intensity={settings.lightIntensity * 0.7} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={settings.lightIntensity}
        castShadow={settings.shadows}
      />
      
      {performanceMode !== 'low' && (
        <Environment preset="studio" environmentIntensity={settings.environmentIntensity} />
      )}
      
      <Responsive3DCardMesh
        card={card}
        rotation={{ x: 0, y: 0 }}
        zoom={isMobile ? 0.8 : 1}
        materialSettings={{
          metalness: performanceMode === 'low' ? 0.2 : 0.3,
          roughness: performanceMode === 'low' ? 0.6 : 0.4,
          clearcoat: performanceMode === 'low' ? 0 : 0.1,
          transmission: 0.0,
          reflectivity: performanceMode === 'low' ? 30 : 60
        }}
      />
    </>
  );
};

// Simple 2D fallback for very low performance
const Fallback2DCard: React.FC<{ card: Card; className?: string }> = ({ card, className }) => (
  <div className={`w-full h-full flex items-center justify-center bg-editor-darker rounded-lg ${className}`}>
    <div className="relative w-64 h-80 bg-editor-dark rounded-lg border border-editor-border shadow-lg">
      {card?.image_url && (
        <img 
          src={card.image_url} 
          alt={card.title || 'Card'} 
          className="w-full h-full object-cover rounded-lg"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg">
        <p className="text-xs text-center">2D Mode - Better Performance</p>
      </div>
    </div>
  </div>
);

export const Mobile3DCardViewer: React.FC<Mobile3DCardViewerProps> = ({
  card,
  className = "",
  effects = {},
  frameConfig,
  selectedFrame,
  onPerformanceChange,
  fallbackComponent
}) => {
  const isMobile = useIsMobile();
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
  const [showFallback, setShowFallback] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Performance monitoring
  useEffect(() => {
    if (!isMobile) return;

    const monitorPerformance = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime > 0) {
        frameCountRef.current++;
        
        // Check FPS every 60 frames
        if (frameCountRef.current >= 60) {
          const fps = (frameCountRef.current * 1000) / deltaTime;
          
          // Adjust performance mode based on FPS
          if (fps < 20) {
            if (performanceMode !== 'low') {
              setPerformanceMode('low');
              onPerformanceChange?.(true);
            }
            // If still poor performance, fallback to 2D
            if (fps < 10) {
              setShowFallback(true);
            }
          } else if (fps < 40 && performanceMode === 'high') {
            setPerformanceMode('medium');
          }
          
          frameCountRef.current = 0;
          lastTimeRef.current = currentTime;
        }
      }
      
      requestAnimationFrame(monitorPerformance);
    };

    const rafId = requestAnimationFrame(monitorPerformance);
    return () => cancelAnimationFrame(rafId);
  }, [isMobile, performanceMode, onPerformanceChange]);

  // Show 2D fallback for very poor performance
  if (showFallback) {
    return <Fallback2DCard card={card} className={className} />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
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
          frameloop="demand" // Only render when needed for better performance
        >
          <Suspense fallback={fallbackComponent || null}>
            <Mobile3DScene 
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
      
      {/* Performance indicator for mobile */}
      {isMobile && performanceMode !== 'high' && (
        <div className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
          {performanceMode === 'low' ? '⚡ Low Quality' : '📱 Mobile Optimized'}
        </div>
      )}
    </div>
  );
};