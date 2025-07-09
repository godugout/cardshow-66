import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeft, Upload, Crop, Settings, Eye, Save, Image as ImageIcon, X, Check, AlertCircle } from 'lucide-react';
import { CRDButton, CRDCard, CRDInput, CRDModal } from '@/components/ui/design-system';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CardFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
}

interface UploadedImage {
  file: File;
  url: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

type CreationStep = 'upload' | 'crop' | 'details' | 'preview';

export const CardCreationStudio: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CreationStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    isPublic: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cropCanvas, setCropCanvas] = useState<HTMLCanvasElement | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // File upload validation
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image."
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 10MB."
      });
      return false;
    }

    return true;
  };

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!validateFile(file)) return;

    const url = URL.createObjectURL(file);
    setUploadedImage({ file, url });
    setCurrentStep('crop');
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Generate thumbnail from canvas
  const generateThumbnail = (originalCanvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve) => {
      const thumbCanvas = document.createElement('canvas');
      const thumbCtx = thumbCanvas.getContext('2d')!;
      
      thumbCanvas.width = 300;
      thumbCanvas.height = 420; // Card aspect ratio
      
      thumbCtx.drawImage(originalCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      thumbCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
    });
  };

  // Upload to Cloudinary (placeholder - you'll need to configure)
  const uploadToCloudinary = async (file: Blob, isThumb = false): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'cards'); // You'll need to set this up
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  // Save card to database
  const saveCard = async () => {
    if (!user || !uploadedImage || !cropCanvas) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please complete all required fields."
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate main image and thumbnail
      const mainImageBlob = await new Promise<Blob>((resolve) => {
        cropCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      });
      
      const thumbnailBlob = await generateThumbnail(cropCanvas);

      // Upload images (placeholder - replace with actual Cloudinary config)
      // const imageUrl = await uploadToCloudinary(mainImageBlob);
      // const thumbnailUrl = await uploadToCloudinary(thumbnailBlob, true);
      
      // For now, create data URLs for demo
      const imageUrl = cropCanvas.toDataURL('image/jpeg', 0.9);
      const thumbnailUrl = await new Promise<string>((resolve) => {
        const thumbCanvas = document.createElement('canvas');
        const thumbCtx = thumbCanvas.getContext('2d')!;
        thumbCanvas.width = 300;
        thumbCanvas.height = 420;
        thumbCtx.drawImage(cropCanvas, 0, 0, 300, 420);
        resolve(thumbCanvas.toDataURL('image/jpeg', 0.8));
      });

      // Save to Supabase
      const { data, error } = await supabase
        .from('cards')
        .insert({
          title: formData.title,
          description: formData.description,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          category: formData.category,
          tags: formData.tags,
          is_public: formData.isPublic,
          user_id: user.id,
          creator_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          rarity: 'common'
        })
        .select()
        .single();

      if (error) throw error;

      setShowSuccessModal(true);
      toast({
        title: "Card created successfully!",
        description: "Your card has been saved and is ready to share."
      });

    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        variant: "destructive",
        title: "Failed to save card",
        description: "Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple crop tool
  const CropTool: React.FC = () => {
    const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 140 });

    const applyCrop = () => {
      if (!uploadedImage || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        canvas.width = cropData.width * 4; // Higher resolution
        canvas.height = cropData.height * 4;
        
        const scaleX = img.width / 100;
        const scaleY = img.height / 100;
        
        ctx.drawImage(
          img,
          cropData.x * scaleX,
          cropData.y * scaleY,
          cropData.width * scaleX,
          cropData.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        setCropCanvas(canvas);
        setCurrentStep('details');
      };

      img.src = uploadedImage.url;
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Crop Your Image</h2>
          <p className="text-muted-foreground">Adjust the crop area for your card</p>
        </div>

        <div className="relative bg-muted/20 rounded-lg p-6">
          <img
            src={uploadedImage?.url}
            alt="Upload preview"
            className="max-w-full max-h-96 mx-auto rounded-lg"
          />
          {/* Simple crop overlay - in a real implementation, you'd use a proper crop library */}
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CRDInput
                label="X Position"
                type="range"
                min="0"
                max="50"
                value={cropData.x}
                onChange={(e) => setCropData(prev => ({ ...prev, x: parseInt(e.target.value) }))}
              />
              <CRDInput
                label="Y Position"
                type="range"
                min="0"
                max="30"
                value={cropData.y}
                onChange={(e) => setCropData(prev => ({ ...prev, y: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          <CRDButton
            variant="outline"
            onClick={() => setCurrentStep('upload')}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </CRDButton>
          <CRDButton
            onClick={applyCrop}
            className="flex-1"
          >
            <Crop className="w-4 h-4 mr-2" />
            Apply Crop
          </CRDButton>
        </div>
      </div>
    );
  };

  // Form step
  const DetailsForm: React.FC = () => {
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
      }
    };

    const removeTag = (tag: string) => {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Card Details</h2>
          <p className="text-muted-foreground">Add information about your card</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CRDInput
              label="Title"
              placeholder="Enter card title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                className="w-full h-24 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your card..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <CRDInput
              label="Category"
              placeholder="e.g., Sports, Gaming, Art"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium text-white mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <CRDButton size="sm" onClick={addTag}>Add</CRDButton>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-md text-sm"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="isPublic" className="text-sm text-white">
                Make this card public
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            {cropCanvas && (
              <div className="bg-muted/20 rounded-lg p-4">
                <canvas
                  width={cropCanvas.width}
                  height={cropCanvas.height}
                  className="max-w-full h-auto rounded-lg"
                  ref={(canvas) => {
                    if (canvas && cropCanvas) {
                      const ctx = canvas.getContext('2d')!;
                      ctx.drawImage(cropCanvas, 0, 0);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <CRDButton
            variant="outline"
            onClick={() => setCurrentStep('crop')}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </CRDButton>
          <CRDButton
            onClick={() => setCurrentStep('preview')}
            disabled={!formData.title.trim()}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </CRDButton>
        </div>
      </div>
    );
  };

  // Preview step
  const PreviewStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Final Preview</h2>
        <p className="text-muted-foreground">Review your card before saving</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CRDCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Card Preview</h3>
          {cropCanvas && (
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <canvas
                width={cropCanvas.width}
                height={cropCanvas.height}
                className="max-w-full h-auto rounded-lg"
                ref={(canvas) => {
                  if (canvas && cropCanvas) {
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(cropCanvas, 0, 0);
                  }
                }}
              />
            </div>
          )}
          <div className="space-y-2">
            <h4 className="font-semibold text-white">{formData.title}</h4>
            {formData.description && (
              <p className="text-sm text-muted-foreground">{formData.description}</p>
            )}
            {formData.category && (
              <span className="inline-block px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                {formData.category}
              </span>
            )}
          </div>
        </CRDCard>

        <CRDCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 text-white">{formData.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 text-white">{formData.category || 'None'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tags:</span>
              <span className="ml-2 text-white">{formData.tags.join(', ') || 'None'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Visibility:</span>
              <span className="ml-2 text-white">{formData.isPublic ? 'Public' : 'Private'}</span>
            </div>
          </div>
        </CRDCard>
      </div>

      <div className="flex gap-3">
        <CRDButton
          variant="outline"
          onClick={() => setCurrentStep('details')}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </CRDButton>
        <CRDButton
          onClick={saveCard}
          loading={isLoading}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Card
        </CRDButton>
      </div>
    </div>
  );

  // Upload step
  const UploadStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Upload Your Image</h2>
        <p className="text-muted-foreground">
          Drag and drop an image or click to browse. Accepts JPEG, PNG, WebP up to 10MB.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-12 text-center cursor-pointer transition-colors"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">Drop your image here</p>
            <p className="text-muted-foreground">or click to browse files</p>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported formats: JPEG, PNG, WebP</p>
            <p>Maximum size: 10MB</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <UploadStep />;
      case 'crop':
        return <CropTool />;
      case 'details':
        return <DetailsForm />;
      case 'preview':
        return <PreviewStep />;
      default:
        return <UploadStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CRDButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </CRDButton>
              <div>
                <h1 className="text-xl font-bold text-white">Create Card</h1>
                <p className="text-sm text-muted-foreground">Design your trading card</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {(['upload', 'crop', 'details', 'preview'] as const).map((step, index) => {
                const stepIndex = ['upload', 'crop', 'details', 'preview'].indexOf(currentStep);
                const isActive = index === stepIndex;
                const isCompleted = index < stepIndex;
                
                return (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isCompleted ? 'bg-primary' : 
                      isActive ? 'bg-primary' : 
                      'bg-muted'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <CRDCard className="p-8">
          {renderCurrentStep()}
        </CRDCard>
      </div>

      {/* Success Modal */}
      <CRDModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Card Created Successfully!"
        description="Your card has been saved and is ready to share."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="flex gap-3">
            <CRDButton
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                // Reset form for new card
                setCurrentStep('upload');
                setUploadedImage(null);
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  tags: [],
                  isPublic: true
                });
                setCropCanvas(null);
              }}
              className="flex-1"
            >
              Create Another
            </CRDButton>
            <CRDButton
              onClick={() => navigate('/cards')}
              className="flex-1"
            >
              View My Cards
            </CRDButton>
          </div>
        </div>
      </CRDModal>
    </div>
  );
};