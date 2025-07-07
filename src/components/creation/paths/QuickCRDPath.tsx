import React, { useState } from 'react';
import { ArrowLeft, Upload, Zap, Download, Settings, Box, Sparkles } from 'lucide-react';
import { UniversalButton, UniversalCard, UniversalBadge } from '@/components/ui/design-system';
import { Enhanced3DCardViewer } from '@/components/3d/enhanced/Enhanced3DCardViewer';
import { Mobile3DCardViewer } from '@/components/viewer/Mobile3DCardViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { NinePresetEffectsPhase } from '@/components/studio/enhanced/components/NinePresetEffectsPhase';
import { toast } from 'sonner';

interface QuickCRDPathProps {
  onBack: () => void;
}

export const QuickCRDPath: React.FC<QuickCRDPathProps> = ({ onBack }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [effectValues, setEffectValues] = useState<Record<string, Record<string, any>>>({
    holographic: { intensity: 0, enabled: false },
    metallic: { intensity: 0, enabled: false },
    chrome: { intensity: 0, enabled: false },
    foil: { intensity: 0, enabled: false },
    particles: { enabled: false }
  });

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setStep('processing');
    
    // Simulate processing
    setTimeout(() => setStep('complete'), 2000);
  };

  const handleEffectChange = (effectId: string, parameterId: string, value: number | boolean | string) => {
    setEffectValues(prev => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        [parameterId]: value
      }
    }));

    // Auto-enable 3D view when effects are applied
    if ((typeof value === 'number' && value > 0) || value === true) {
      setShow3DPreview(true);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    toast.success(`Applied ${presetId} preset to all cards!`);
  };

  const has3DEffects = Object.values(effectValues).some(effect => 
    effect.enabled || (typeof effect.intensity === 'number' && effect.intensity > 0)
  );

  const getCardPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <UniversalButton 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Paths
          </UniversalButton>
          <div>
            <h1 className="text-3xl font-bold text-white">Quick CRD</h1>
            <p className="text-muted-foreground">Create cards in 30 seconds</p>
          </div>
        </div>

        {step === 'upload' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <UniversalCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Upload Your Images
              </h2>
              
              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFileUpload(files);
                  };
                  input.click();
                }}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop images here or click to browse
                </h3>
                <p className="text-muted-foreground">
                  Supports bulk upload • Auto-detection • Instant processing
                </p>
              </div>

              {/* Format Options */}
              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-white">Format Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-lg border border-border hover:border-primary/50 text-left">
                    <div className="font-medium text-white">Trading Card</div>
                    <div className="text-sm text-muted-foreground">2.5" × 3.5"</div>
                  </button>
                  <button className="p-3 rounded-lg border border-border hover:border-primary/50 text-left">
                    <div className="font-medium text-white">Square</div>
                    <div className="text-sm text-muted-foreground">1:1 ratio</div>
                  </button>
                </div>
              </div>
            </UniversalCard>

            {/* Features */}
            <UniversalCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                AI-Powered Features
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    icon: <Zap className="w-5 h-5" />,
                    title: 'Smart Auto-Detection',
                    description: 'Automatically detects single vs bulk uploads'
                  },
                  {
                    icon: <Settings className="w-5 h-5" />,
                    title: 'Instant Processing',
                    description: 'Auto-crop, auto-enhance, auto-size your images'
                  },
                  {
                    icon: <Download className="w-5 h-5" />,
                    title: 'Bulk Operations',
                    description: 'Process multiple images with consistent settings'
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-3 p-4 rounded-lg bg-muted/20">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </UniversalCard>
          </div>
        )}

        {step === 'processing' && (
          <UniversalCard className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Processing Your Images
            </h2>
            <p className="text-muted-foreground">
              AI is working its magic on {uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''}...
            </p>
          </UniversalCard>
        )}

        {step === 'complete' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Card Preview & Selection */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Cards Created Successfully!
                </h2>
                <div className="flex items-center gap-2">
                  <UniversalButton
                    variant={show3DPreview ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setShow3DPreview(!show3DPreview)}
                    disabled={!has3DEffects}
                  >
                    <Box className="w-4 h-4 mr-2" />
                    {show3DPreview ? "3D View" : "2D View"}
                  </UniversalButton>
                  {has3DEffects && (
                    <UniversalBadge className="bg-gradient-to-r from-yellow-500 to-purple-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Effects Applied
                    </UniversalBadge>
                  )}
                </div>
              </div>

              {/* Main Card Display */}
              <div className="mb-6">
                {uploadedFiles.length > 0 && (
                  <UniversalCard className="p-6">
                    <div className="flex justify-center">
                      {show3DPreview && has3DEffects ? (
                        <div className="w-80 h-[480px]">
                          <Enhanced3DCardViewer
                            card={{
                              id: 'quick-crd-preview',
                              title: `Quick Card ${selectedCardIndex + 1}`,
                              description: 'Quick CRD creation with effects',
                              image_url: getCardPreviewUrl(uploadedFiles[selectedCardIndex]),
                              rarity: 'rare',
                              tags: ['quick-crd'],
                              creator_id: 'preview-user',
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString(),
                              user_id: 'preview-user',
                              template_id: 'modern',
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
                        <div className="w-80 aspect-[3/4] bg-muted/20 rounded-lg overflow-hidden">
                          <img 
                            src={getCardPreviewUrl(uploadedFiles[selectedCardIndex])} 
                            alt={`Card ${selectedCardIndex + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </UniversalCard>
                )}
              </div>

              {/* Card Thumbnails */}
              {uploadedFiles.length > 1 && (
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {uploadedFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCardIndex(index)}
                      className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedCardIndex === index 
                          ? 'border-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={getCardPreviewUrl(file)} 
                        alt={`Card ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <UniversalButton>
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({uploadedFiles.length})
                </UniversalButton>
                <UniversalButton variant="outline">
                  Continue to CRDMKR Studio
                </UniversalButton>
              </div>
            </div>

            {/* Effects Panel */}
            <div className="lg:col-span-1">
              <UniversalCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Effects
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Apply effects to all cards instantly with our 9-preset system.
                </p>
                
                <NinePresetEffectsPhase
                  onPresetSelect={handlePresetSelect}
                  onEffectChange={handleEffectChange}
                  effectValues={effectValues}
                />
              </UniversalCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};