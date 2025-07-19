
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ViewerScene } from './components/ViewerScene';
import { ViewerUI } from './components/ViewerUI';
import { ViewerErrorBoundary } from './components/ViewerErrorBoundary';

const LoadingFallback = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-white text-center">
      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
      <p>Loading 3D Viewer...</p>
    </div>
  </div>
);

export const Professional3DViewer: React.FC = () => {
  return (
    <ViewerErrorBoundary>
      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            shadows
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: "high-performance"
            }}
            onCreated={(state) => {
              // Ensure canvas is properly initialized
              state.gl.setClearColor('#1a1a1a', 1);
            }}
          >
            <Environment preset="studio" backgroundIntensity={0.5} />
            
            <ViewerScene />
            
            {/* Camera controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={10}
              target={[0, 0, 0]}
              dampingFactor={0.05}
              enableDamping={true}
            />
          </Canvas>
        </Suspense>
        
        <ViewerUI />
      </div>
    </ViewerErrorBoundary>
  );
};
