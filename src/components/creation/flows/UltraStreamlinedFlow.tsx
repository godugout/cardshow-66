import React, { useState, useCallback } from 'react';
import { ArrowLeft, Upload, Crop, Palette, Eye, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCardComposition } from '@/hooks/useCardComposition';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { EnhancedImageCropper } from '@/components/editor/crop/EnhancedImageCropper';
import { ImagePreloader } from '@/components/editor/crop/ImagePreloader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type FlowStep = 'upload' | 'crop' | 'customize' | 'generate' | 'complete';

export const UltraStreamlinedFlow: React.FC = () => {
  const navigate = useNavigate();
  const { generateCard, isGenerating, generatedCard } = useCardComposition();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const [cardData, setCardData] = useState({
    title: '',
    description: '',
    rarity: 'common' as const,
    tags: [] as string[]
  });

  const steps = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'crop', label: 'Crop', icon: Crop },
    { key: 'customize', label: 'Customize', icon: Palette },
    { key: 'generate', label: 'Generate', icon: Eye },
    { key: 'complete', label: 'Complete', icon: Check }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleUploadComplete = useCallback((files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      setUploadedImageUrl(file.publicUrl);
      
      // Check if image is close to standard card dimensions (2.5:3.5 = ~0.714)
      if (file.metadata?.width && file.metadata?.height) {
        const aspectRatio = file.metadata.width / file.metadata.height;
        const cardAspectRatio = 2.5 / 3.5; // ~0.714
        const tolerance = 0.1; // 10% tolerance
        
        if (Math.abs(aspectRatio - cardAspectRatio) <= tolerance) {
          // Image is already close to card dimensions, skip crop
          setCroppedImageUrl(file.publicUrl);
          setCurrentStep('customize');
          toast.success('Perfect card dimensions detected! Moving to customization.');
          return;
        }
      }
      
      // Standard flow - go to crop step
      setCurrentStep('crop');
      toast.success('Image uploaded successfully!');
    }
  }, []);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    setCroppedImageUrl(croppedUrl);
    setCurrentStep('customize');
    toast.success('Image cropped successfully!');
  }, []);

  const handleSkipCrop = useCallback(() => {
    setCroppedImageUrl(uploadedImageUrl);
    setCurrentStep('customize');
    toast.success('Using original image');
  }, [uploadedImageUrl]);

  const handleCustomizeComplete = useCallback(() => {
    if (!cardData.title.trim()) {
      toast.error('Please enter a card title');
      return;
    }
    setCurrentStep('generate');
  }, [cardData.title]);

  const handleGenerateCard = useCallback(async () => {
    if (!croppedImageUrl || !cardData.title) {
      toast.error('Missing required information');
      return;
    }

    const result = await generateCard({
      imageUrl: croppedImageUrl,
      frameId: 'default-frame',
      effects: {
        holographic: 0.5,
        metallic: 0.3,
        chrome: 0.2,
        particles: false
      },
      cardData: {
        title: cardData.title,
        description: cardData.description,
        rarity: cardData.rarity,
        tags: cardData.tags
      }
    });

    if (result) {
      setCurrentStep('complete');
    }
  }, [croppedImageUrl, cardData, generateCard]);

  const handleCreateAnother = useCallback(() => {
    setCurrentStep('upload');
    setUploadedImageUrl('');
    setCroppedImageUrl('');
    setCardData({
      title: '',
      description: '',
      rarity: 'common',
      tags: []
    });
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Your Image</h2>
              <p className="text-gray-400">Choose a high-quality image for your trading card</p>
            </div>
            <Card className="p-8">
              <MediaUploadZone
                bucket="card-assets"
                folder="card-images"
                maxFiles={1}
                onUploadComplete={handleUploadComplete}
                className="min-h-[300px]"
              >
                <div className="space-y-4 text-center">
                  <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Upload Your Image</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag & drop or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, WebP • Max 10MB
                    </p>
                  </div>
                </div>
              </MediaUploadZone>
            </Card>
          </div>
        );

      case 'crop':
        // Debug logging
        console.log('Crop step - uploadedImageUrl:', uploadedImageUrl);
        console.log('Crop step - uploadedImageUrl type:', typeof uploadedImageUrl);
        console.log('Crop step - uploadedImageUrl length:', uploadedImageUrl?.length);
        
        if (!uploadedImageUrl || uploadedImageUrl.trim() === '') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Image Upload Error</h2>
                <p className="text-gray-400 mb-4">No image URL found. Please try uploading again.</p>
                <Button onClick={() => setCurrentStep('upload')} variant="outline">
                  Back to Upload
                </Button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Crop Your Image</h2>
              <p className="text-gray-400">Adjust the crop to fit your card perfectly</p>
              <p className="text-xs text-gray-500 mt-2">Image URL: {uploadedImageUrl}</p>
            </div>
            <Card className="p-6">
              {/* Simple image display with basic crop functionality */}
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={uploadedImageUrl} 
                    alt="Card to crop" 
                    className="w-full h-auto max-h-[60vh] object-contain"
                    onLoad={(e) => {
                      console.log('Image loaded successfully in crop view');
                      const img = e.target as HTMLImageElement;
                      console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                    }}
                    onError={(e) => {
                      console.error('Image failed to load in crop view. URL:', uploadedImageUrl);
                      console.error('Error event:', e);
                      toast.error('Failed to load image for cropping');
                    }}
                    crossOrigin="anonymous"
                  />
                  {/* Overlay showing crop area */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="border-2 border-crd-green border-dashed bg-black/20"
                      style={{
                        width: '300px',
                        height: `${300 / (2.5/3.5)}px`,
                        minWidth: '200px',
                        maxWidth: '80%'
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-sm opacity-75">Card Area</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 mt-6">
                  <Button 
                    onClick={() => handleCropComplete(uploadedImageUrl)}
                    className="bg-crd-green hover:bg-crd-green/90 text-black"
                  >
                    Apply Crop
                  </Button>
                  <Button variant="ghost" onClick={handleSkipCrop}>
                    Skip Crop
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                    Back to Upload
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'customize':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Customize Your Card</h2>
              <p className="text-gray-400">Add details to make your card unique</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Card Title *
                    </label>
                    <Input
                      value={cardData.title}
                      onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter card title..."
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                    </label>
                    <Textarea
                      value={cardData.description}
                      onChange={(e) => setCardData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your card..."
                      className="bg-background border-border"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Rarity
                    </label>
                    <Select 
                      value={cardData.rarity} 
                      onValueChange={(value: any) => setCardData(prev => ({ ...prev, rarity: value }))}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden max-w-xs mx-auto">
                    <img 
                      src={croppedImageUrl} 
                      alt="Card preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {cardData.title && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold">{cardData.title}</h4>
                      <p className="text-sm text-gray-400 capitalize">{cardData.rarity}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Generate Your Card</h2>
              <p className="text-gray-400">Ready to create your professional trading card?</p>
            </div>
            <Card className="p-8 max-w-md mx-auto">
              <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden mb-6">
                <img 
                  src={croppedImageUrl} 
                  alt="Final card preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-semibold text-white">{cardData.title}</h3>
                {cardData.description && (
                  <p className="text-sm text-gray-400">{cardData.description}</p>
                )}
                <p className="text-sm text-green-400 capitalize">{cardData.rarity}</p>
              </div>
              <Button 
                onClick={handleGenerateCard}
                disabled={isGenerating}
                className="w-full bg-crd-green text-black hover:bg-crd-green/90"
              >
                {isGenerating ? 'Generating...' : 'Generate Card'}
              </Button>
            </Card>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Card Created Successfully!</h2>
              <p className="text-gray-400">Your trading card has been generated and saved</p>
            </div>
            {generatedCard && (
              <Card className="p-8 max-w-md mx-auto">
                <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden mb-6">
                  <img 
                    src={generatedCard.composite_image_url} 
                    alt="Generated card" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 mb-6">
                  <h3 className="text-lg font-semibold text-white">{generatedCard.title}</h3>
                  <p className="text-sm text-crd-green font-medium">{generatedCard.serial_number}</p>
                  <p className="text-sm text-gray-400 capitalize">{generatedCard.rarity}</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCreateAnother}
                    variant="outline"
                    className="flex-1"
                  >
                    Create Another
                  </Button>
                  <Button 
                    onClick={() => navigate('/cards')}
                    className="flex-1 bg-crd-green text-black hover:bg-crd-green/90"
                  >
                    View Gallery
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return !!uploadedImageUrl;
      case 'crop':
        return !!croppedImageUrl;
      case 'customize':
        return !!cardData.title.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 'customize') {
      handleCustomizeComplete();
    } else if (currentStep === 'generate') {
      handleGenerateCard();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key as FlowStep);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crd-darkest via-[#0a0a0b] to-[#131316]">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Create Your Card</h1>
                <p className="text-sm text-gray-400">Ultra Streamlined Creation Flow</p>
              </div>
            </div>
            
            {/* Step Progress */}
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-crd-green border-crd-green text-black' 
                        : isActive 
                          ? 'border-crd-green text-crd-green' 
                          : 'border-gray-600 text-gray-600'
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        isCompleted ? 'bg-crd-green' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderStepContent()}
        
        {/* Navigation */}
        {currentStep !== 'complete' && (
          <div className="flex justify-center gap-4 mt-8">
            {currentStepIndex > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="px-6"
              >
                Back
              </Button>
            )}
            {currentStep === 'customize' && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 bg-crd-green text-black hover:bg-crd-green/90"
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};