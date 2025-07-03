import React, { useState } from 'react';
import { ArrowLeft, Upload, Zap, Download, Settings } from 'lucide-react';
import { UniversalButton, UniversalCard } from '@/components/ui/design-system';

interface QuickCRDPathProps {
  onBack: () => void;
}

export const QuickCRDPath: React.FC<QuickCRDPathProps> = ({ onBack }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setStep('processing');
    
    // Simulate processing
    setTimeout(() => setStep('complete'), 2000);
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
          <UniversalCard className="p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Cards Created Successfully!
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="aspect-[3/4] bg-muted/20 rounded-lg p-4">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">Card {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <UniversalButton>
                <Download className="w-4 h-4 mr-2" />
                Download All
              </UniversalButton>
              <UniversalButton variant="outline">
                Continue to Studio
              </UniversalButton>
            </div>
          </UniversalCard>
        )}
      </div>
    </div>
  );
};