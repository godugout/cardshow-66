import React, { useState } from 'react';
import { ArrowLeft, Layers, Eye, Settings, Palette } from 'lucide-react';
import { UniversalButton, UniversalCard, UniversalBadge } from '@/components/ui/design-system';

interface CRDMKRPathProps {
  onBack: () => void;
}

export const CRDMKRPath: React.FC<CRDMKRPathProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'layers' | 'preview' | '3d'>('preview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UniversalButton 
              variant="outline" 
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Paths
            </UniversalButton>
            <div>
              <h1 className="text-2xl font-bold text-white">CRDMKR Studio</h1>
              <p className="text-muted-foreground">Professional card creation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <UniversalBadge variant="outline">
              2-5 minutes
            </UniversalBadge>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Frame Library */}
        <div className="w-80 border-r border-border p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Frame Library</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <UniversalCard key={i} className="aspect-[3/4] p-2 cursor-pointer hover:border-primary/50">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center">
                  <span className="text-xs text-white">Frame {i + 1}</span>
                </div>
              </UniversalCard>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-white mb-3">Frame Categories</h3>
            <div className="space-y-2">
              {['Sports', 'Fantasy', 'Vintage', 'Modern', 'Holographic'].map((category) => (
                <button
                  key={category}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/20 text-muted-foreground hover:text-white transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* View Mode Toggle */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'layers', label: 'Layers', icon: <Layers className="w-4 h-4" /> },
                { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
                { id: '3d', label: '3D View', icon: <Settings className="w-4 h-4" /> }
              ].map((view) => (
                <UniversalButton
                  key={view.id}
                  variant={activeView === view.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView(view.id as any)}
                >
                  {view.icon}
                  {view.label}
                </UniversalButton>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <UniversalCard className="aspect-[3/4] w-80 p-8">
              <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {activeView === 'layers' && 'Layer view active'}
                    {activeView === 'preview' && 'Upload an image to start'}
                    {activeView === '3d' && '3D preview mode'}
                  </p>
                </div>
              </div>
            </UniversalCard>
          </div>
        </div>

        {/* Right Sidebar - Effects & Properties */}
        <div className="w-80 border-l border-border p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Effects Panel</h2>
          
          <div className="space-y-4">
            {[
              'Lighting Effects',
              'Material Properties',
              'Color Adjustments',
              'Special Effects'
            ].map((section) => (
              <UniversalCard key={section} className="p-4">
                <h3 className="font-medium text-white mb-3">{section}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Intensity</span>
                    <span className="text-sm text-white">50%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/20 rounded-full">
                    <div className="w-1/2 h-full bg-primary rounded-full"></div>
                  </div>
                </div>
              </UniversalCard>
            ))}
          </div>

          <div className="mt-6">
            <UniversalButton className="w-full">
              Apply Effects
            </UniversalButton>
          </div>
        </div>
      </div>
    </div>
  );
};