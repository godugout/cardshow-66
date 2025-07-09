import React, { useState } from 'react';
import { AdvancedCropInterface } from '../cropping/AdvancedCropInterface';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
import { CRDInput } from '@/components/ui/design-system';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Palette, 
  Settings,
  Sparkles,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export type CreateFlowStepB = 'upload' | 'crop' | 'enhance' | 'details' | 'preview';

interface CreateFlowBProps {
  onComplete?: (cardData: any) => void;
}

export const CreateFlowB: React.FC<CreateFlowBProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<CreateFlowStepB>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [enhancements, setEnhancements] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: 'none'
  });
  const [cardDetails, setCardDetails] = useState({
    title: '',
    description: '',
    category: 'sports',
    rarity: 'common',
    tags: [] as string[]
  });

  const handleUploadComplete = (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      setUploadedImage(file.publicUrl);
      setCurrentStep('crop');
      toast.success('Professional image uploaded successfully!');
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setCurrentStep('enhance');
    toast.success('Advanced cropping completed!');
  };

  const handleEnhanceComplete = () => {
    setCurrentStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!cardDetails.title.trim()) {
      toast.error('Please enter a card title');
      return;
    }
    setCurrentStep('preview');
  };

  const handleFinalSubmit = () => {
    const finalCardData = {
      ...cardDetails,
      imageUrl: croppedImage,
      originalImageUrl: uploadedImage,
      enhancements,
      createdAt: new Date().toISOString()
    };
    
    onComplete?.(finalCardData);
    toast.success('Professional card created successfully!');
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !cardDetails.tags.includes(tag.trim())) {
      setCardDetails({
        ...cardDetails,
        tags: [...cardDetails.tags, tag.trim()]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCardDetails({
      ...cardDetails,
      tags: cardDetails.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Step 1: Upload
  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-crd-blue" />
              <h1 className="text-3xl font-bold text-white">Professional Studio</h1>
            </div>
            <p className="text-muted-foreground">Version B - Advanced Tools & Multi-Area Cropping</p>
            <Badge variant="outline" className="mt-2">PRO</Badge>
          </div>

          <CRDCard className="p-8">
            <MediaUploadZone
              bucket="card-assets"
              folder="card-images"
              maxFiles={1}
              onUploadComplete={handleUploadComplete}
              className="min-h-[350px]"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 bg-crd-blue/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-crd-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Upload High-Quality Image</h3>
                  <p className="text-muted-foreground mb-4">
                    Professional creation tools with advanced cropping and enhancement
                  </p>
                  <CRDButton variant="gradient" size="lg">
                    <Target className="w-4 h-4 mr-2" />
                    Select Professional Image
                  </CRDButton>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Multi-area cropping
                  </div>
                  <div className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    Advanced filters
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Pro enhancements
                  </div>
                </div>
              </div>
            </MediaUploadZone>
          </CRDCard>
        </div>
      </div>
    );
  }

  // Step 2: Crop
  if (currentStep === 'crop') {
    return (
      <AdvancedCropInterface
        imageUrl={uploadedImage}
        onCropComplete={handleCropComplete}
        onBack={() => setCurrentStep('upload')}
      />
    );
  }

  // Step 3: Enhance
  if (currentStep === 'enhance') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Enhance Your Card</h1>
            <p className="text-muted-foreground">Professional filters and adjustments</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview */}
            <CRDCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
              <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden">
                <img 
                  src={croppedImage} 
                  alt="Enhanced preview" 
                  className="w-full h-full object-cover"
                  style={{
                    filter: `brightness(${100 + enhancements.brightness}%) contrast(${100 + enhancements.contrast}%) saturate(${100 + enhancements.saturation}%)`
                  }}
                />
              </div>
            </CRDCard>

            {/* Enhancement Controls */}
            <CRDCard className="p-6">
              <Tabs defaultValue="adjustments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="adjustments" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Brightness: {enhancements.brightness}%
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={enhancements.brightness}
                      onChange={(e) => setEnhancements({...enhancements, brightness: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Contrast: {enhancements.contrast}%
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={enhancements.contrast}
                      onChange={(e) => setEnhancements({...enhancements, contrast: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Saturation: {enhancements.saturation}%
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={enhancements.saturation}
                      onChange={(e) => setEnhancements({...enhancements, saturation: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="filters" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', name: 'Original' },
                      { id: 'vintage', name: 'Vintage' },
                      { id: 'dramatic', name: 'Dramatic' },
                      { id: 'cool', name: 'Cool Tone' }
                    ].map((filter) => (
                      <CRDButton
                        key={filter.id}
                        variant={enhancements.filter === filter.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setEnhancements({...enhancements, filter: filter.id})}
                      >
                        {filter.name}
                      </CRDButton>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CRDCard>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <CRDButton
              variant="outline"
              onClick={() => setCurrentStep('crop')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Crop
            </CRDButton>
            <CRDButton
              variant="primary"
              onClick={handleEnhanceComplete}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </CRDButton>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Details (Enhanced)
  if (currentStep === 'details') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Professional Card Details</h1>
            <p className="text-muted-foreground">Complete your card information</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview */}
            <CRDCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Final Preview</h3>
              <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden mb-4">
                <img 
                  src={croppedImage} 
                  alt="Card preview" 
                  className="w-full h-full object-cover"
                  style={{
                    filter: `brightness(${100 + enhancements.brightness}%) contrast(${100 + enhancements.contrast}%) saturate(${100 + enhancements.saturation}%)`
                  }}
                />
              </div>
              {cardDetails.rarity !== 'common' && (
                <Badge variant="outline" className="capitalize">
                  {cardDetails.rarity}
                </Badge>
              )}
            </CRDCard>

            {/* Enhanced Form */}
            <CRDCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Card Information</h3>
              <div className="space-y-4">
                <CRDInput
                  label="Card Title"
                  value={cardDetails.title}
                  onChange={(e) => setCardDetails({...cardDetails, title: e.target.value})}
                  placeholder="Enter professional card title..."
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={cardDetails.description}
                    onChange={(e) => setCardDetails({...cardDetails, description: e.target.value})}
                    placeholder="Detailed card description..."
                    className="w-full p-3 bg-background border border-border rounded-lg text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-crd-blue focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category
                    </label>
                    <select
                      value={cardDetails.category}
                      onChange={(e) => setCardDetails({...cardDetails, category: e.target.value})}
                      className="w-full p-3 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-crd-blue focus:border-transparent"
                    >
                      <option value="sports">Sports</option>
                      <option value="gaming">Gaming</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="art">Art</option>
                      <option value="collectibles">Collectibles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Rarity
                    </label>
                    <select
                      value={cardDetails.rarity}
                      onChange={(e) => setCardDetails({...cardDetails, rarity: e.target.value})}
                      className="w-full p-3 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-crd-blue focus:border-transparent"
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cardDetails.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag and press Enter..."
                    className="w-full p-3 bg-background border border-border rounded-lg text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-crd-blue focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </CRDCard>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <CRDButton
              variant="outline"
              onClick={() => setCurrentStep('enhance')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Enhance
            </CRDButton>
            <CRDButton
              variant="primary"
              onClick={handleDetailsSubmit}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Preview Card
            </CRDButton>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Preview
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Professional Card Complete</h1>
          <p className="text-muted-foreground">Review your professionally crafted card</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Card Preview */}
          <CRDCard className="p-8">
            <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden mb-4 relative">
              <img 
                src={croppedImage} 
                alt="Final card" 
                className="w-full h-full object-cover"
                style={{
                  filter: `brightness(${100 + enhancements.brightness}%) contrast(${100 + enhancements.contrast}%) saturate(${100 + enhancements.saturation}%)`
                }}
              />
              {cardDetails.rarity !== 'common' && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="capitalize bg-background/80">
                    {cardDetails.rarity}
                  </Badge>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">{cardDetails.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">{cardDetails.category}</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {cardDetails.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CRDCard>

          {/* Enhanced Summary */}
          <CRDCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Professional Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-white">{cardDetails.title}</p>
              </div>
              
              {cardDetails.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-white">{cardDetails.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-white capitalize">{cardDetails.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rarity</label>
                  <p className="text-white capitalize">{cardDetails.rarity}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Enhancements Applied</label>
                <div className="text-xs text-muted-foreground mt-1">
                  Brightness: {enhancements.brightness}% • Contrast: {enhancements.contrast}% • Saturation: {enhancements.saturation}%
                </div>
              </div>

              {cardDetails.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cardDetails.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CRDCard>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <CRDButton
            variant="outline"
            onClick={() => setCurrentStep('details')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Edit Details
          </CRDButton>
          <CRDButton
            variant="gradient"
            onClick={handleFinalSubmit}
            size="lg"
            icon={<Sparkles className="w-4 h-4" />}
          >
            Create Professional Card
          </CRDButton>
        </div>
      </div>
    </div>
  );
};