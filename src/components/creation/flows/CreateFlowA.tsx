import React, { useState } from 'react';
import { SimpleCropInterface } from '../cropping/SimpleCropInterface';
import { CRDButton, CRDCard } from '@/components/ui/design-system';
import { CRDInput } from '@/components/ui/design-system';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export type CreateFlowStep = 'upload' | 'crop' | 'details' | 'preview';

interface CreateFlowAProps {
  onComplete?: (cardData: any) => void;
}

export const CreateFlowA: React.FC<CreateFlowAProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<CreateFlowStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({
    title: '',
    description: '',
    category: 'sports'
  });

  const handleUploadComplete = (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      setUploadedImage(file.publicUrl);
      setCurrentStep('crop');
      toast.success('Image uploaded successfully!');
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setCurrentStep('details');
    toast.success('Image cropped successfully!');
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
      createdAt: new Date().toISOString()
    };
    
    onComplete?.(finalCardData);
    toast.success('Card created successfully!');
  };

  // Step 1: Upload
  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Card</h1>
            <p className="text-muted-foreground">Version A - Simple & Clean</p>
          </div>

          <CRDCard className="p-8">
            <MediaUploadZone
              bucket="card-assets"
              folder="card-images"
              maxFiles={1}
              onUploadComplete={handleUploadComplete}
              className="min-h-[300px]"
            >
              <div className="space-y-4">
                <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Upload Your Image</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a high-quality image for your trading card
                  </p>
                  <CRDButton variant="primary" size="lg">
                    Select Image
                  </CRDButton>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP • Max 10MB
                </p>
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
      <SimpleCropInterface
        imageUrl={uploadedImage}
        onCropComplete={handleCropComplete}
        onBack={() => setCurrentStep('upload')}
      />
    );
  }

  // Step 3: Details
  if (currentStep === 'details') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Card Details</h1>
            <p className="text-muted-foreground">Add information about your card</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview */}
            <CRDCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden">
                <img 
                  src={croppedImage} 
                  alt="Card preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </CRDCard>

            {/* Form */}
            <CRDCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Information</h3>
              <div className="space-y-4">
                <CRDInput
                  label="Card Title"
                  value={cardDetails.title}
                  onChange={(e) => setCardDetails({...cardDetails, title: e.target.value})}
                  placeholder="Enter card title..."
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={cardDetails.description}
                    onChange={(e) => setCardDetails({...cardDetails, description: e.target.value})}
                    placeholder="Enter card description..."
                    className="w-full p-3 bg-background border border-border rounded-lg text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-crd-green focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={cardDetails.category}
                    onChange={(e) => setCardDetails({...cardDetails, category: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg text-white focus:ring-2 focus:ring-crd-green focus:border-transparent"
                  >
                    <option value="sports">Sports</option>
                    <option value="gaming">Gaming</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="art">Art</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </CRDCard>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <CRDButton
              variant="outline"
              onClick={() => setCurrentStep('crop')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </CRDButton>
            <CRDButton
              variant="primary"
              onClick={handleDetailsSubmit}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </CRDButton>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Preview
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Final Preview</h1>
          <p className="text-muted-foreground">Review your card before saving</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card Preview */}
          <CRDCard className="p-8">
            <div className="aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden mb-4">
              <img 
                src={croppedImage} 
                alt="Final card" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">{cardDetails.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">{cardDetails.category}</p>
            </div>
          </CRDCard>

          {/* Details Summary */}
          <CRDCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Card Summary</h3>
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
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="text-white capitalize">{cardDetails.category}</p>
              </div>
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
            variant="primary"
            onClick={handleFinalSubmit}
            size="lg"
          >
            Create Card
          </CRDButton>
        </div>
      </div>
    </div>
  );
};