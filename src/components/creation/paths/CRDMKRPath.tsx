import React, { useState } from 'react';
import { ArrowLeft, Layers, Eye, Settings, Palette, Upload, Box } from 'lucide-react';
import { UniversalButton, UniversalCard, UniversalBadge } from '@/components/ui/design-system';
import { Enhanced3DCardViewer } from '@/components/3d/enhanced/Enhanced3DCardViewer';
import { Mobile3DCardViewer } from '@/components/viewer/Mobile3DCardViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { EffectsPhase } from '@/components/studio/enhanced/components/EffectsPhase';
import { EnhancedFrameSelector } from '@/components/studio/enhanced/EnhancedFrameSelector';
import { toast } from 'sonner';

interface CRDMKRPathProps {
  onBack: () => void;
}

export const CRDMKRPath: React.FC<CRDMKRPathProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'layers' | 'preview' | '3d'>('preview');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [selectedFrame, setSelectedFrame] = useState<string>('');
  const [effectValues, setEffectValues] = useState<Record<string, Record<string, any>>>({
    holographic: { intensity: 0, enabled: false },
    metallic: { intensity: 0, enabled: false },
    chrome: { intensity: 0, enabled: false },
    foil: { intensity: 0, enabled: false },
    particles: { enabled: false }
  });

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setUploadedImage(url);
        toast.success('Image uploaded successfully!');
      }
    };
    input.click();
  };

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrame(frameId);
    toast.success('Frame applied!');
  };

  const handleEffectChange = (effectId: string, parameterId: string, value: number | boolean | string) => {
    setEffectValues(prev => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        [parameterId]: value
      }
    }));

    // Auto-switch to 3D view when effects are applied
    if ((typeof value === 'number' && value > 0) || value === true) {
      setActiveView('3d');
    }
  };

  const has3DEffects = Object.values(effectValues).some(effect => 
    effect.enabled || (typeof effect.intensity === 'number' && effect.intensity > 0)
  );

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
              <p className="text-muted-foreground">Professional card creation with live 3D preview</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <UniversalBadge variant="outline">
              2-5 minutes
            </UniversalBadge>
            {has3DEffects && (
              <UniversalBadge className="bg-gradient-to-r from-yellow-500 to-purple-500 text-white">
                3D Effects Active
              </UniversalBadge>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Frame Library */}
        <div className="w-80 border-r border-border p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Frame Library</h2>
            <UniversalButton size="sm" onClick={handleImageUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </UniversalButton>
          </div>
          
          <EnhancedFrameSelector
            onFrameSelect={handleFrameSelect}
            selectedFrame={selectedFrame}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* View Mode Toggle */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'layers', label: 'Layers', icon: <Layers className="w-4 h-4" /> },
                { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
                { id: '3d', label: '3D View', icon: <Box className="w-4 h-4" /> }
              ].map((view) => (
                <UniversalButton
                  key={view.id}
                  variant={activeView === view.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView(view.id as any)}
                  disabled={view.id === '3d' && !uploadedImage}
                >
                  {view.icon}
                  {view.label}
                </UniversalButton>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-8 flex items-center justify-center">
            {!uploadedImage ? (
              <UniversalCard 
                className="aspect-[3/4] w-80 p-8 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={handleImageUpload}
              >
                <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Upload an image to start</p>
                    <p className="text-xs text-muted-foreground">Click here or use the upload button</p>
                  </div>
                </div>
              </UniversalCard>
            ) : activeView === '3d' ? (
              <div className="w-80 h-[480px]">
                <Enhanced3DCardViewer
                  card={{
                    id: 'crdmkr-preview',
                    title: 'CRDMKR Card',
                    description: 'Live preview',
                    image_url: uploadedImage,
                    rarity: 'epic',
                    tags: ['preview'],
                    creator_id: 'preview-user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user_id: 'preview-user',
                    template_id: selectedFrame || 'modern',
                    design_metadata: {
                      effects: effectValues
                    },
                    visibility: 'private',
                    creator_attribution: {
                      collaboration_type: 'solo'
                    },
                    publishing_options: {
                      marketplace_listing: false,
                      crd_catalog_inclusion: false,
                      print_available: false,
                      pricing: { currency: 'USD' },
                      distribution: { limited_edition: false }
                    }
                  }}
                  className="w-full h-full"
                  autoEnable={true}
                  effects={effectValues}
                  selectedFrame={selectedFrame}
                  onModeChange={() => {}}
                  fallbackComponent={
                    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Loading 3D Preview...</p>
                      </div>
                    </div>
                  }
                />
              </div>
            ) : (
              <UniversalCard className="aspect-[3/4] w-80 overflow-hidden">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </UniversalCard>
            )}
          </div>
        </div>

        {/* Right Sidebar - Effects & Properties */}
        <div className="w-80 border-l border-border p-6 overflow-y-auto">
          <EffectsPhase
            selectedFrame={selectedFrame}
            onEffectChange={handleEffectChange}
            effectValues={effectValues}
          />
        </div>
      </div>
    </div>
  );
};