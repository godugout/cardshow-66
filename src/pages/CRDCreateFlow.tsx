import React, { useState, useCallback } from 'react';
import { ArrowLeft, Upload, Edit3, Palette, Sparkles, Eye, Save, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useCardComposition } from '@/hooks/useCardComposition';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { SimpleCropper } from '@/components/editor/crop/SimpleCropper';
import { toast } from 'sonner';

type FlowStep = 'setup' | 'upload' | 'crop' | 'design' | 'effects' | 'preview' | 'publish';

interface CardData {
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  tags: string[];
  category: string;
  playerStats?: {
    attack?: number;
    defense?: number;
    speed?: number;
    special?: number;
  };
}

interface DesignSettings {
  frameStyle: string;
  backgroundColor: string;
  borderStyle: string;
  textColor: string;
  titleFont: string;
}

interface EffectSettings {
  holographic: number;
  metallic: number;
  chrome: number;
  glow: number;
  particles: boolean;
  rainbow: boolean;
}

export const CRDCreateFlow: React.FC = () => {
  const navigate = useNavigate();
  const { generateCard, isGenerating, generatedCard } = useCardComposition();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('setup');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const [cardData, setCardData] = useState<CardData>({
    title: '',
    description: '',
    rarity: 'common',
    tags: [],
    category: 'character',
    playerStats: {
      attack: 50,
      defense: 50,
      speed: 50,
      special: 50
    }
  });
  
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    frameStyle: 'classic',
    backgroundColor: '#1a1a1a',
    borderStyle: 'standard',
    textColor: '#ffffff',
    titleFont: 'dm-sans'
  });
  
  const [effectSettings, setEffectSettings] = useState<EffectSettings>({
    holographic: 0.3,
    metallic: 0.2,
    chrome: 0.1,
    glow: 0.2,
    particles: false,
    rainbow: false
  });

  const steps = [
    { key: 'setup', label: 'Setup', icon: Plus, description: 'Choose card type and category' },
    { key: 'upload', label: 'Upload', icon: Upload, description: 'Add your image' },
    { key: 'crop', label: 'Crop', icon: Edit3, description: 'Perfect your composition' },
    { key: 'design', label: 'Design', icon: Palette, description: 'Customize appearance' },
    { key: 'effects', label: 'Effects', icon: Sparkles, description: 'Add special effects' },
    { key: 'preview', label: 'Preview', icon: Eye, description: 'Review your card' },
    { key: 'publish', label: 'Publish', icon: Save, description: 'Save and share' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key as FlowStep);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key as FlowStep);
    }
  };

  const handleUploadComplete = useCallback((files: any[]) => {
    console.log('CRDCreateFlow: Upload complete called with:', files);
    if (files.length > 0) {
      const file = files[0];
      const publicUrl = file.publicUrl || file.metadata?.publicUrl;
      console.log('CRDCreateFlow: Setting uploaded image URL to:', publicUrl);
      setUploadedImageUrl(publicUrl);
      
      // Auto-advance to crop step
      setCurrentStep('crop');
      toast.success('Image uploaded successfully!');
    }
  }, []);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    setCroppedImageUrl(croppedUrl);
    setCurrentStep('design');
    toast.success('Image cropped successfully!');
  }, []);

  const handleSkipCrop = useCallback(() => {
    setCroppedImageUrl(uploadedImageUrl);
    setCurrentStep('design');
    toast.success('Using original image');
  }, [uploadedImageUrl]);

  const addTag = (tag: string) => {
    if (tag && !cardData.tags.includes(tag)) {
      setCardData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCardData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublishCard = async () => {
    if (!croppedImageUrl || !cardData.title) {
      toast.error('Missing required information');
      return;
    }

    const result = await generateCard({
      imageUrl: croppedImageUrl,
      frameId: designSettings.frameStyle,
      effects: {
        holographic: effectSettings.holographic,
        metallic: effectSettings.metallic,
        chrome: effectSettings.chrome,
        particles: effectSettings.particles
      },
      cardData: {
        title: cardData.title,
        description: cardData.description,
        rarity: cardData.rarity,
        tags: cardData.tags
      }
    });

    if (result) {
      toast.success('Card published successfully!');
      navigate('/cards');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Create Your CRD Card</h2>
              <p className="text-crd-lightGray text-lg">Let's start by setting up your card basics</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Card Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Card Title *</label>
                    <Input
                      value={cardData.title}
                      onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your card title..."
                      className="bg-crd-darkest border-crd-mediumGray text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Category</label>
                    <Select 
                      value={cardData.category} 
                      onValueChange={(value) => setCardData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-crd-darkest border-crd-mediumGray text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="character">Character</SelectItem>
                        <SelectItem value="creature">Creature</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Rarity</label>
                    <Select 
                      value={cardData.rarity} 
                      onValueChange={(value: any) => setCardData(prev => ({ ...prev, rarity: value }))}
                    >
                      <SelectTrigger className="bg-crd-darkest border-crd-mediumGray text-white">
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

              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Description & Tags</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <Textarea
                      value={cardData.description}
                      onChange={(e) => setCardData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your card..."
                      className="bg-crd-darkest border-crd-mediumGray text-white"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cardData.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-crd-green/20 text-crd-green border-crd-green/30 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        className="bg-crd-darkest border-crd-mediumGray text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add tag..."]') as HTMLInputElement;
                          if (input?.value) {
                            addTag(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Upload Your Image</h2>
              <p className="text-crd-lightGray text-lg">Choose a high-quality image for your trading card</p>
            </div>
            
            <Card className="p-8 max-w-2xl mx-auto bg-crd-surface border-crd-border">
              <MediaUploadZone
                bucket="card-assets"
                folder="card-images"
                maxFiles={1}
                onUploadComplete={handleUploadComplete}
                className="min-h-[400px]"
              >
                <div className="space-y-6 text-center">
                  <Upload className="w-20 h-20 text-crd-green mx-auto" />
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3">Upload Your Image</h3>
                    <p className="text-crd-lightGray mb-4 text-lg">
                      Drag & drop or click to select your image
                    </p>
                    <div className="text-sm text-crd-mediumGray space-y-1">
                      <p>• Supports JPG, PNG, WebP formats</p>
                      <p>• Maximum file size: 10MB</p>
                      <p>• Recommended resolution: 1500x2100px or higher</p>
                    </div>
                  </div>
                </div>
              </MediaUploadZone>
            </Card>
          </div>
        );

      case 'crop':
        return (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-crd-green to-crd-blue bg-clip-text text-transparent">
                Perfect Your Composition
              </h2>
              <p className="text-crd-lightGray text-lg">
                Crop and adjust your image to fit the card perfectly using our professional editing tools
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center justify-center mt-6 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-crd-green rounded-full"></div>
                  <div className="w-8 h-0.5 bg-crd-green"></div>
                  <div className="w-3 h-3 bg-crd-green rounded-full animate-pulse"></div>
                  <div className="w-8 h-0.5 bg-crd-border"></div>
                  <div className="w-3 h-3 bg-crd-border rounded-full"></div>
                  <div className="w-8 h-0.5 bg-crd-border"></div>
                  <div className="w-3 h-3 bg-crd-border rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              {uploadedImageUrl && (
                <SimpleCropper
                  imageUrl={uploadedImageUrl}
                  onCropComplete={handleCropComplete}
                  aspectRatio={2.5 / 3.5}
                  className="bg-gradient-to-br from-crd-darkest/50 to-crd-surface/50 border border-crd-border rounded-2xl p-8 backdrop-blur-sm"
                />
              )}
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Design Your Card</h2>
              <p className="text-crd-lightGray text-lg">Customize the visual style and layout</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Frame & Style</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Frame Style</label>
                    <Select 
                      value={designSettings.frameStyle} 
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, frameStyle: value }))}
                    >
                      <SelectTrigger className="bg-crd-darkest border-crd-mediumGray text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="ornate">Ornate</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="futuristic">Futuristic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Border Style</label>
                    <Select 
                      value={designSettings.borderStyle} 
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, borderStyle: value }))}
                    >
                      <SelectTrigger className="bg-crd-darkest border-crd-mediumGray text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="thick">Thick</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Title Font</label>
                    <Select 
                      value={designSettings.titleFont} 
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, titleFont: value }))}
                    >
                      <SelectTrigger className="bg-crd-darkest border-crd-mediumGray text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dm-sans">DM Sans</SelectItem>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="playfair">Playfair Display</SelectItem>
                        <SelectItem value="cinzel">Cinzel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Live Preview</h3>
                <div className="aspect-[2.5/3.5] bg-crd-darkest rounded-lg overflow-hidden mx-auto max-w-xs border border-crd-mediumGray">
                  {croppedImageUrl ? (
                    <img 
                      src={croppedImageUrl} 
                      alt="Card preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-crd-mediumGray">
                      <Upload className="w-12 h-12" />
                    </div>
                  )}
                </div>
                {cardData.title && (
                  <div className="mt-4 text-center">
                    <h4 className="text-white font-semibold text-lg">{cardData.title}</h4>
                    <p className="text-crd-green capitalize">{cardData.rarity}</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      case 'effects':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Add Special Effects</h2>
              <p className="text-crd-lightGray text-lg">Make your card shine with premium effects</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Effect Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Holographic ({Math.round(effectSettings.holographic * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={effectSettings.holographic}
                      onChange={(e) => setEffectSettings(prev => ({ ...prev, holographic: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Metallic ({Math.round(effectSettings.metallic * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={effectSettings.metallic}
                      onChange={(e) => setEffectSettings(prev => ({ ...prev, metallic: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Chrome ({Math.round(effectSettings.chrome * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={effectSettings.chrome}
                      onChange={(e) => setEffectSettings(prev => ({ ...prev, chrome: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Glow ({Math.round(effectSettings.glow * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={effectSettings.glow}
                      onChange={(e) => setEffectSettings(prev => ({ ...prev, glow: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={effectSettings.particles}
                        onChange={(e) => setEffectSettings(prev => ({ ...prev, particles: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-white">Particle Effects</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={effectSettings.rainbow}
                        onChange={(e) => setEffectSettings(prev => ({ ...prev, rainbow: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-white">Rainbow Shimmer</span>
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Effect Preview</h3>
                <div className="aspect-[2.5/3.5] bg-crd-darkest rounded-lg overflow-hidden mx-auto max-w-xs border border-crd-mediumGray relative">
                  {croppedImageUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={croppedImageUrl} 
                        alt="Card with effects" 
                        className="w-full h-full object-cover"
                        style={{
                          filter: `
                            brightness(${1 + effectSettings.glow * 0.3})
                            contrast(${1 + effectSettings.metallic * 0.2})
                            saturate(${1 + effectSettings.holographic * 0.5})
                          `
                        }}
                      />
                      {effectSettings.particles && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" />
                      )}
                      {effectSettings.rainbow && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-crd-mediumGray">
                      <Sparkles className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Final Preview</h2>
              <p className="text-crd-lightGray text-lg">Review your card before publishing</p>
            </div>
            
            <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-crd-surface border-crd-border">
                <div className="aspect-[2.5/3.5] bg-crd-darkest rounded-lg overflow-hidden mx-auto max-w-sm border border-crd-mediumGray">
                  {croppedImageUrl && (
                    <img 
                      src={croppedImageUrl} 
                      alt="Final card preview" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-crd-surface border-crd-border">
                <h3 className="text-xl font-semibold text-white mb-4">Card Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-white">{cardData.title}</h4>
                    <p className="text-crd-green capitalize text-lg">{cardData.rarity}</p>
                  </div>
                  
                  {cardData.description && (
                    <div>
                      <label className="text-sm font-medium text-crd-mediumGray">Description</label>
                      <p className="text-white">{cardData.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-crd-mediumGray">Category</label>
                    <p className="text-white capitalize">{cardData.category}</p>
                  </div>

                  {cardData.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-crd-mediumGray">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {cardData.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-crd-green/20 text-crd-green border-crd-green/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <h5 className="text-sm font-medium text-crd-mediumGray mb-2">Applied Effects</h5>
                    <div className="space-y-1 text-sm text-white">
                      <p>• Holographic: {Math.round(effectSettings.holographic * 100)}%</p>
                      <p>• Metallic: {Math.round(effectSettings.metallic * 100)}%</p>
                      <p>• Chrome: {Math.round(effectSettings.chrome * 100)}%</p>
                      <p>• Glow: {Math.round(effectSettings.glow * 100)}%</p>
                      {effectSettings.particles && <p>• Particle Effects: Enabled</p>}
                      {effectSettings.rainbow && <p>• Rainbow Shimmer: Enabled</p>}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'publish':
        return (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Publish Your Card</h2>
              <p className="text-crd-lightGray text-lg">Ready to save your masterpiece?</p>
            </div>
            
            <Card className="p-8 max-w-md mx-auto bg-crd-surface border-crd-border">
              <div className="aspect-[2.5/3.5] bg-crd-darkest rounded-lg overflow-hidden mb-6 border border-crd-mediumGray">
                {croppedImageUrl && (
                  <img 
                    src={croppedImageUrl} 
                    alt="Final card" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                <h3 className="text-xl font-semibold text-white">{cardData.title}</h3>
                <p className="text-crd-green capitalize">{cardData.rarity}</p>
                {cardData.description && (
                  <p className="text-sm text-crd-lightGray">{cardData.description}</p>
                )}
              </div>
              
              <Button 
                onClick={handlePublishCard}
                disabled={isGenerating}
                className="w-full bg-crd-green text-black hover:bg-crd-green/90 font-semibold py-3"
              >
                {isGenerating ? 'Publishing...' : 'Publish Card'}
              </Button>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'setup':
        return !!cardData.title.trim();
      case 'upload':
        return !!uploadedImageUrl;
      case 'crop':
        return !!croppedImageUrl;
      case 'design':
      case 'effects':
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crd-darkest via-[#0a0a0b] to-[#131316]">
      {/* Header */}
      <div className="border-b border-crd-border bg-crd-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-crd-lightGray hover:text-white border border-crd-mediumGray"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">CRD Creator Studio</h1>
                <p className="text-sm text-crd-lightGray">Professional card creation flow</p>
              </div>
            </div>
            
            {/* Step Progress */}
            <div className="hidden lg:flex items-center gap-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? 'bg-crd-green border-crd-green text-black' 
                          : isActive 
                            ? 'border-crd-green text-crd-green bg-crd-green/10' 
                            : 'border-crd-mediumGray text-crd-mediumGray'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="hidden xl:block">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-crd-lightGray'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-crd-mediumGray">
                        {step.description}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? 'bg-crd-green' : 'bg-crd-mediumGray'
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        {renderStepContent()}
        
        {/* Navigation */}
        {currentStep !== 'publish' && (
          <div className="flex justify-center gap-4 mt-12">
            {currentStepIndex > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="border-crd-mediumGray text-white hover:bg-crd-surface"
              >
                Back
              </Button>
            )}
            
            {currentStep !== 'preview' && (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-crd-green text-black hover:bg-crd-green/90 px-8"
              >
                {currentStep === 'setup' ? 'Start Creating' : 'Continue'}
              </Button>
            )}
            
            {currentStep === 'preview' && (
              <Button 
                onClick={() => setCurrentStep('publish')}
                className="bg-crd-green text-black hover:bg-crd-green/90 px-8"
              >
                Ready to Publish
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};