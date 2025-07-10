import React, { useState } from 'react';
import { CRDRenderer } from './CRDRenderer';
import { CRDCard, CRD_MATERIAL_PRESETS, CRD_LIGHTING_PRESETS } from '@/types/crd';

interface CRDTestCardProps {
  imageUrl?: string;
  title?: string;
  description?: string;
}

export const CRDTestCard: React.FC<CRDTestCardProps> = ({
  imageUrl,
  title = "Test Card",
  description = "Testing the CRD framework"
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState<keyof typeof CRD_MATERIAL_PRESETS>('standard');
  const [selectedLighting, setSelectedLighting] = useState<keyof typeof CRD_LIGHTING_PRESETS>('studio');
  const [selectedFrame, setSelectedFrame] = useState('crd-default');
  
  // Create test card data
  const testCard: CRDCard = {
    id: 'test-card-1',
    title,
    description,
    imageUrl,
    frameId: selectedFrame,
    material: {
      ...CRD_MATERIAL_PRESETS[selectedMaterial],
      type: selectedMaterial as any,
      intensity: 70,
      surface: { roughness: 30, reflectivity: 60, transparency: 0 },
      animation: { enabled: true, speed: 1.5, pattern: 'wave' }
    },
    effects: {
      metallic: selectedMaterial === 'metallic' ? 70 : 20,
      holographic: selectedMaterial === 'holographic' ? 80 : 10,
      chrome: selectedMaterial === 'chrome' ? 90 : 0,
      crystal: selectedMaterial === 'crystal' ? 85 : 0,
      vintage: selectedMaterial === 'vintage' ? 60 : 10,
      prismatic: selectedMaterial === 'prismatic' ? 95 : 0,
      interference: 20,
      rainbow: 10,
      particles: selectedMaterial === 'prismatic' || selectedMaterial === 'holographic',
      glow: {
        enabled: selectedMaterial !== 'standard' && selectedMaterial !== 'vintage',
        color: selectedMaterial === 'holographic' ? '#00ffff' : '#ffffff',
        intensity: 40,
        radius: 20
      },
      distortion: {
        enabled: false,
        type: 'wave',
        intensity: 0
      }
    },
    lighting: {
      ...CRD_LIGHTING_PRESETS[selectedLighting],
      environment: selectedLighting as any,
      intensity: 85,
      color: {
        primary: '#ffffff',
        secondary: '#cccccc',
        ambient: '#666666'
      },
      shadows: { enabled: true, softness: 60, intensity: 40 },
      highlights: { enabled: true, sharpness: 70, intensity: 60 }
    },
    metadata: {
      rarity: 'rare',
      edition: 'CRD Test Edition',
      artist: 'CRD Framework'
    }
  };

  const materialOptions = Object.keys(CRD_MATERIAL_PRESETS) as (keyof typeof CRD_MATERIAL_PRESETS)[];
  const lightingOptions = Object.keys(CRD_LIGHTING_PRESETS) as (keyof typeof CRD_LIGHTING_PRESETS)[];
  const frameOptions = ['crd-default', 'crd-sports', 'crd-holographic'];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold cardshow-text-gradient mb-2">CRD Framework Test</h2>
        <p className="text-cs-neutral-10">Test the new Card Renderer & Display system</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Card Preview */}
        <div className="flex justify-center">
          <div className="relative">
            <CRDRenderer
              card={testCard}
              width={400}
              height={560}
              className="shadow-2xl"
              interactive={true}
              performance="high"
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="space-y-6">
          {/* Material Selection */}
          <div className="cardshow-surface p-4">
            <h3 className="text-lg font-semibold text-cs-neutral-12 mb-3">Material Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {materialOptions.map((material) => (
                <button
                  key={material}
                  onClick={() => setSelectedMaterial(material)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedMaterial === material
                      ? 'cardshow-btn-primary text-white'
                      : 'cardshow-btn-secondary'
                  }`}
                >
                  {material.charAt(0).toUpperCase() + material.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Lighting Selection */}
          <div className="cardshow-surface p-4">
            <h3 className="text-lg font-semibold text-cs-neutral-12 mb-3">Lighting Environment</h3>
            <div className="grid grid-cols-1 gap-2">
              {lightingOptions.map((lighting) => (
                <button
                  key={lighting}
                  onClick={() => setSelectedLighting(lighting)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedLighting === lighting
                      ? 'cardshow-btn-primary text-white'
                      : 'cardshow-btn-secondary'
                  }`}
                >
                  {lighting.charAt(0).toUpperCase() + lighting.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Frame Selection */}
          <div className="cardshow-surface p-4">
            <h3 className="text-lg font-semibold text-cs-neutral-12 mb-3">Frame Style</h3>
            <div className="grid grid-cols-1 gap-2">
              {frameOptions.map((frame) => (
                <button
                  key={frame}
                  onClick={() => setSelectedFrame(frame)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedFrame === frame
                      ? 'cardshow-btn-primary text-white'
                      : 'cardshow-btn-secondary'
                  }`}
                >
                  {frame.replace('crd-', '').charAt(0).toUpperCase() + frame.replace('crd-', '').slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Information */}
          <div className="cardshow-surface p-4">
            <h3 className="text-lg font-semibold text-cs-neutral-12 mb-3">Current Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cs-neutral-10">Material:</span>
                <span className="text-cs-neutral-12 font-medium">{selectedMaterial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cs-neutral-10">Lighting:</span>
                <span className="text-cs-neutral-12 font-medium">{selectedLighting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cs-neutral-10">Frame:</span>
                <span className="text-cs-neutral-12 font-medium">{selectedFrame}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cs-neutral-10">Image:</span>
                <span className="text-cs-neutral-12 font-medium">{imageUrl ? 'Loaded' : 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};