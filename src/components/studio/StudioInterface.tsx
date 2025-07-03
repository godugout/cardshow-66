import React from 'react';
import { CardData } from '@/hooks/studio/useStudioState';

interface StudioInterfaceProps {
  card: CardData;
  className?: string;
}

export const StudioInterface: React.FC<StudioInterfaceProps> = ({ card, className = "" }) => {
  return (
    <div className={`flex h-full bg-crd-darkest ${className}`}>
      {/* Left Sidebar - Tools */}
      <div className="w-80 bg-crd-dark border-r border-crd-mediumGray flex flex-col">
        <div className="p-4 border-b border-crd-mediumGray">
          <h2 className="text-lg font-bold text-white">Studio Tools</h2>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          {/* Card Info */}
          <div className="bg-crd-mediumGray/20 rounded-lg p-3">
            <h3 className="text-sm font-medium text-crd-green mb-2">Current Card</h3>
            <p className="text-white font-medium">{card.title}</p>
            {card.description && (
              <p className="text-crd-lightGray text-sm mt-1">{card.description}</p>
            )}
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-crd-green/20 text-crd-green text-xs rounded">
                {card.rarity}
              </span>
            </div>
          </div>

          {/* Tools Sections */}
          <div className="space-y-3">
            <div className="bg-crd-mediumGray/10 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">Lighting</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-crd-lightGray hover:text-white transition-colors">
                  Studio Lighting
                </button>
                <button className="w-full text-left text-sm text-crd-lightGray hover:text-white transition-colors">
                  Dramatic Lighting
                </button>
                <button className="w-full text-left text-sm text-crd-lightGray hover:text-white transition-colors">
                  Soft Lighting
                </button>
              </div>
            </div>

            <div className="bg-crd-mediumGray/10 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">Effects</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-crd-lightGray hover:text-white transition-colors">
                  Holographic
                </button>
                <button className="w-full text-left text-sm text-crd-lightGray hover:text-white transition-colors">
                  Metallic
                </button>
                <button className="w-full text-left text-sm text-crd-lightGray hover:text-white transition-colors">
                  Foil Spray
                </button>
              </div>
            </div>

            <div className="bg-crd-mediumGray/10 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">Materials</h4>
              <div className="space-y-2">
                <label className="block text-sm text-crd-lightGray">
                  Metalness
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="50"
                    className="w-full mt-1 accent-crd-green"
                  />
                </label>
                <label className="block text-sm text-crd-lightGray">
                  Roughness
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="50"
                    className="w-full mt-1 accent-crd-green"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center - 3D Viewport */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 bg-crd-dark border-b border-crd-mediumGray flex items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-crd-mediumGray/20 rounded text-crd-lightGray hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="w-px h-6 bg-crd-mediumGray" />
            <button className="px-3 py-1 bg-crd-green/20 text-crd-green text-sm rounded hover:bg-crd-green/30 transition-colors">
              View
            </button>
            <button className="px-3 py-1 text-crd-lightGray text-sm rounded hover:bg-crd-mediumGray/20 transition-colors">
              Edit
            </button>
            <button className="px-3 py-1 text-crd-lightGray text-sm rounded hover:bg-crd-mediumGray/20 transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-crd-darkest to-crd-dark">
          <div className="w-96 h-96 bg-gradient-to-br from-crd-purple/20 to-crd-green/20 rounded-xl flex items-center justify-center border border-crd-mediumGray/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-crd-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-crd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-crd-lightGray text-lg font-medium">{card.title}</p>
              <p className="text-crd-lightGray/60 text-sm mt-1">3D Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-80 bg-crd-dark border-l border-crd-mediumGray flex flex-col">
        <div className="p-4 border-b border-crd-mediumGray">
          <h2 className="text-lg font-bold text-white">Properties</h2>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <div className="bg-crd-mediumGray/10 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-3">Card Details</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-crd-lightGray mb-1">Title</label>
                <input 
                  type="text" 
                  value={card.title}
                  className="w-full bg-crd-mediumGray/20 border border-crd-mediumGray rounded px-2 py-1 text-white text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-crd-lightGray mb-1">Rarity</label>
                <select className="w-full bg-crd-mediumGray/20 border border-crd-mediumGray rounded px-2 py-1 text-white text-sm">
                  <option value={card.rarity}>{card.rarity}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-crd-lightGray mb-1">Tags</label>
                <input 
                  type="text" 
                  value={card.tags?.join(', ') || ''}
                  className="w-full bg-crd-mediumGray/20 border border-crd-mediumGray rounded px-2 py-1 text-white text-sm"
                  placeholder="Enter tags..."
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="bg-crd-mediumGray/10 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-3">Export Options</h4>
            <div className="space-y-2">
              <button className="w-full bg-crd-green hover:bg-crd-green/90 text-black py-2 px-3 rounded text-sm font-medium transition-colors">
                Export as PNG
              </button>
              <button className="w-full bg-crd-mediumGray/20 hover:bg-crd-mediumGray/30 text-white py-2 px-3 rounded text-sm transition-colors">
                Export as 3D Model
              </button>
              <button className="w-full bg-crd-mediumGray/20 hover:bg-crd-mediumGray/30 text-white py-2 px-3 rounded text-sm transition-colors">
                Save to Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};