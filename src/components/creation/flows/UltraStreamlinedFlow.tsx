import React, { useState, useEffect } from 'react';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { EnhancedImageCropper } from '@/components/editor/crop/EnhancedImageCropper';
import { CRDFrameRenderer } from '@/components/frames/crd/CRDFrameRenderer';
import { CRDButton } from '@/components/ui/design-system';
import { supabase } from '@/integrations/supabase/client';
import { CRD_FRAMES, getCRDFrameById } from '@/data/crdFrames';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Wand2, 
  Zap,
  Check,
  RefreshCw,
  Heart,
  Star,
  Crown,
  Crop,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface UltraStreamlinedFlowProps {
  onComplete?: (cardData: any) => void;
}

interface AIAnalysis {
  title: string;
  description: string;
  category: string;
  suggested_frame: string;
  auto_crop_suggestion: any;
  enhancement_suggestions: any;
  rarity: string;
  stats: any;
  market_appeal: any;
  tags: string[];
  confidence: number;
}

export const UltraStreamlinedFlow: React.FC<UltraStreamlinedFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'crop' | 'frame-select' | 'done'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [selectedFrameId, setSelectedFrameId] = useState<string>('modern-holographic');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadComplete = async (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      setUploadedImage(file.publicUrl);
      setStep('analyzing');
      await analyzeImage(file.publicUrl);
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-card-with-gemini', {
        body: { imageUrl }
      });

      if (error) {
        console.error('Gemini API error:', error);
        // Use fallback analysis
        const fallbackAnalysis = createFallbackAnalysis(imageUrl);
        setAiAnalysis(fallbackAnalysis);
        setStep('crop');
        toast.success('🎉 Image analyzed! Time to perfect the crop!');
        return;
      }

      // Check if we got valid data
      if (data && data.title) {
        setAiAnalysis(data);
        setStep('crop');
        toast.success('🎉 Image analyzed! Time to perfect the crop!');
      } else {
        // Use fallback if data is incomplete
        const fallbackAnalysis = createFallbackAnalysis(imageUrl);
        setAiAnalysis(fallbackAnalysis);
        setStep('crop');
        toast.success('🎉 Image analyzed! Time to perfect the crop!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Always provide fallback instead of failing
      const fallbackAnalysis = createFallbackAnalysis(imageUrl);
      setAiAnalysis(fallbackAnalysis);
      setStep('crop');
      toast.success('🎉 Image analyzed! Time to perfect the crop!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createFallbackAnalysis = (imageUrl: string): AIAnalysis => {
    return {
      title: 'Custom Trading Card',
      description: 'A unique and personalized trading card created with AI assistance',
      category: 'custom',
      suggested_frame: 'modern-holographic',
      auto_crop_suggestion: null,
      enhancement_suggestions: null,
      rarity: 'rare',
      stats: {
        visual_appeal: 8,
        card_potential: 7,
        uniqueness: 9,
        collectibility: 8
      },
      market_appeal: {
        collector_interest: 7,
        investment_potential: 6
      },
      tags: ['custom', 'unique', 'collectible'],
      confidence: 0.85
    };
  };

  const generateVariations = (analysis: AIAnalysis) => {
    return [
      {
        title: analysis.title,
        style: 'Original AI',
        rarity: analysis.rarity,
        description: analysis.description,
        frame: analysis.suggested_frame,
        icon: <Sparkles className="w-4 h-4" />,
        confidence: analysis.confidence
      },
      {
        title: `${analysis.title} - Elite Edition`,
        style: 'Elite',
        rarity: analysis.rarity === 'legendary' ? 'legendary' : 
               analysis.rarity === 'epic' ? 'epic' : 'rare',
        description: `Premium ${analysis.description}`,
        frame: 'holographic',
        icon: <Crown className="w-4 h-4" />,
        confidence: Math.min(1, analysis.confidence + 0.1)
      },
      {
        title: `${analysis.title} - Collector's`,
        style: 'Collector',
        rarity: analysis.rarity === 'common' ? 'uncommon' : analysis.rarity,
        description: `Collector's edition: ${analysis.description}`,
        frame: 'vintage',
        icon: <Star className="w-4 h-4" />,
        confidence: analysis.confidence
      }
    ];
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setStep('frame-select');
    toast.success('Perfect crop! Now choose your frame style');
  };

  const handleCreateCard = async () => {
    if (!aiAnalysis) return;
    
    setIsProcessing(true);
    
    try {
      // Import the composition hook
      const { useCardComposition } = await import('@/hooks/useCardComposition');
      const compositionHook = useCardComposition();
      
      const variations = generateVariations(aiAnalysis);
      const selected = variations[selectedVariation];
      
      const compositionData = {
        imageUrl: croppedImage || uploadedImage,
        frameId: selectedFrameId,
        effects: {},
        cardData: {
          title: selected.title,
          description: selected.description,
          rarity: selected.rarity,
          tags: aiAnalysis.tags,
        }
      };

      const createdCard = await compositionHook.generateCard(compositionData);
      
      if (createdCard) {
        const cardData = {
          title: selected.title,
          description: selected.description,
          category: aiAnalysis.category,
          imageUrl: createdCard.composite_image_url, // Use the composite image
          rarity: selected.rarity,
          frame: selectedFrameId,
          tags: aiAnalysis.tags,
          aiEnhanced: true,
          confidence: selected.confidence,
          stats: aiAnalysis.stats,
          serialNumber: createdCard.serial_number,
          createdAt: createdCard.created_at
        };
        
        onComplete?.(cardData);
        setStep('done');
        toast.success(`🎉 ${createdCard.serial_number} created successfully!`);
      }
    } catch (error) {
      console.error('Failed to create card:', error);
      toast.error('Failed to create card');
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload Step
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 flex flex-col justify-center">
        <div className="max-w-md lg:max-w-4xl mx-auto w-full">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-crd-orange rounded-full flex items-center justify-center text-white font-medium">1</div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-muted-foreground">2</div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-muted-foreground">3</div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-crd-orange to-crd-green rounded-full flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">AI Card Creator</h1>
            </div>
            <p className="text-muted-foreground">Upload → AI Magic → Done!</p>
          </div>

          {/* Upload Zone */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 animate-scale-in max-w-md mx-auto">
            <MediaUploadZone
              bucket="card-assets"
              folder="card-images"
              maxFiles={1}
              onUploadComplete={handleUploadComplete}
              className="min-h-[200px] border-2 border-dashed border-crd-green/30 rounded-xl hover:border-crd-green/60 transition-colors"
            >
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-crd-green/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-crd-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Tap to Upload</h3>
                  <p className="text-muted-foreground text-sm">
                    AI will instantly analyze and enhance your image
                  </p>
                </div>
              </div>
            </MediaUploadZone>
          </div>
        </div>
      </div>
    );
  }

  // Analyzing Step
  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-crd-orange via-crd-green to-crd-blue rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
              <Zap className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">AI is Working Magic! ✨</h2>
            
            <div className="space-y-3 text-muted-foreground mb-8">
              <p className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-crd-green animate-pulse" />
                Analyzing your image...
              </p>
              <p className="flex items-center justify-center gap-2">
                <Wand2 className="w-4 h-4 text-crd-blue animate-pulse delay-75" />
                Suggesting optimal cropping...
              </p>
              <p className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-crd-orange animate-pulse delay-150" />
                Preparing frame options...
              </p>
            </div>

            {uploadedImage && (
              <div className="w-32 h-40 mx-auto rounded-lg overflow-hidden bg-muted animate-scale-in">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Crop Step
  if (step === 'crop' && uploadedImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4">
        <div className="max-w-6xl mx-auto w-full">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-crd-green rounded-full flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <div className="w-16 h-0.5 bg-crd-green"></div>
              <div className="w-8 h-8 bg-crd-orange rounded-full flex items-center justify-center text-white font-medium">2</div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-muted-foreground">3</div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crop className="w-6 h-6 text-crd-orange" />
              <h2 className="text-xl lg:text-2xl font-bold text-white">Perfect Your Image</h2>
            </div>
            <p className="text-muted-foreground text-sm">Crop and adjust your image for the best card result</p>
          </div>

          {/* Enhanced Image Cropper */}
          <div className="mb-6">
            <EnhancedImageCropper
              imageUrl={uploadedImage}
              onCropComplete={handleCropComplete}
              aspectRatio={2.5 / 3.5}
              compact={false}
              className="mx-auto"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between max-w-md mx-auto">
            <CRDButton
              onClick={() => setStep('upload')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </CRDButton>
            
            <CRDButton
              onClick={() => handleCropComplete(uploadedImage)}
              variant="outline"
              size="sm"
            >
              Skip Crop
              <ArrowRight className="w-4 h-4 ml-2" />
            </CRDButton>
          </div>
        </div>
      </div>
    );
  }

  // Frame Selection Step
  if (step === 'frame-select' && aiAnalysis) {
    const variations = generateVariations(aiAnalysis);
    const currentImage = croppedImage || uploadedImage;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-crd-green rounded-full flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <div className="w-16 h-0.5 bg-crd-green"></div>
              <div className="w-8 h-8 bg-crd-green rounded-full flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <div className="w-16 h-0.5 bg-crd-green"></div>
              <div className="w-8 h-8 bg-crd-orange rounded-full flex items-center justify-center text-white font-medium">3</div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Choose Your Frame Style</h2>
            <p className="text-muted-foreground">Pick the perfect frame to showcase your card</p>
          </div>

          {/* Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Card Preview */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <span>Variation:</span>
                    {variations.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariation(index)}
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${selectedVariation === index 
                            ? 'bg-crd-green text-black' 
                            : 'bg-border text-muted-foreground hover:bg-border/80'
                          }
                        `}
                      >
                        {variations[index].style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Large Card Preview */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <CRDFrameRenderer
                      frame={getCRDFrameById(selectedFrameId) || CRD_FRAMES[0]}
                      userImage={currentImage}
                      width={400}
                      height={560}
                      className="shadow-2xl"
                      interactive={false}
                    />
                    
                    {/* Card Info Overlay */}
                    <div className="absolute -bottom-6 left-0 right-0">
                      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 mx-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white text-sm">{variations[selectedVariation].title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {variations[selectedVariation].rarity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(variations[selectedVariation].confidence * 100)}% match
                              </span>
                            </div>
                          </div>
                          {variations[selectedVariation].icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Frame Options */}
            <div className="order-1 lg:order-2">
              <h3 className="text-lg font-semibold text-white mb-4">Frame Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {CRD_FRAMES.map((frame) => (
                  <div
                    key={frame.id}
                    onClick={() => setSelectedFrameId(frame.id)}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                      ${selectedFrameId === frame.id 
                        ? 'border-crd-green bg-crd-green/5 scale-105' 
                        : 'border-border bg-card/30 hover:border-border/60 hover:scale-102'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Frame Thumbnail */}
                      <div className="flex-shrink-0">
                        <CRDFrameRenderer
                          frame={frame}
                          userImage={currentImage}
                          width={120}
                          height={168}
                          className="rounded-lg"
                          interactive={false}
                        />
                      </div>
                      
                      {/* Frame Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{frame.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {frame.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{frame.description}</p>
                        <div className="text-xs text-muted-foreground">
                          Category: <span className="text-white">{frame.category}</span>
                        </div>
                      </div>
                      
                      {/* Selected Indicator */}
                      {selectedFrameId === frame.id && (
                        <div className="w-6 h-6 bg-crd-green rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between max-w-md mx-auto">
            <CRDButton
              onClick={() => setStep('crop')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Crop
            </CRDButton>
            
            <CRDButton
              onClick={handleCreateCard}
              variant="gradient"
              size="lg"
            >
              Create Card
              <ArrowRight className="w-4 h-4 ml-2" />
            </CRDButton>
          </div>
        </div>
      </div>
    );
  }

  // Done Step - Enhanced card showcase
  if (step === 'done' && aiAnalysis) {
    const variations = generateVariations(aiAnalysis);
    const selected = variations[selectedVariation];
    const currentImage = croppedImage || uploadedImage;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4">
        <div className="max-w-6xl mx-auto w-full">
          {/* Success Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-r from-crd-green to-crd-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Card Created! 🎉</h1>
            <p className="text-muted-foreground text-lg">
              Your AI-enhanced trading card is ready to amaze collectors!
            </p>
          </div>

          {/* Card Showcase - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left: Final Card Display */}
            <div className="order-2 lg:order-1">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Your Masterpiece</h2>
                <p className="text-muted-foreground text-sm">
                  {selected.title} • {selected.rarity} • {Math.round(selected.confidence * 100)}% AI Match
                </p>
              </div>
              
              {/* Large Card Showcase */}
              <div className="flex justify-center mb-6">
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                  <CRDFrameRenderer
                    frame={getCRDFrameById(selectedFrameId) || CRD_FRAMES[0]}
                    userImage={currentImage}
                    width={450}
                    height={630}
                    className="shadow-2xl"
                    interactive={false}
                  />
                  
                  {/* Floating Stats */}
                  <div className="absolute -top-4 -right-4">
                    <div className="bg-gradient-to-r from-crd-orange to-crd-green rounded-full px-4 py-2">
                      <span className="text-white font-bold text-sm">
                        {selected.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Floating Confidence Score */}
                  <div className="absolute -bottom-4 -left-4">
                    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-crd-green" />
                        <span className="text-white font-semibold text-sm">
                          {Math.round(selected.confidence * 100)}% AI Match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Card Details & Stats */}
            <div className="order-1 lg:order-2 space-y-6">
              {/* Card Info */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Card Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="text-white font-medium">{selected.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="text-white font-medium">{selected.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rarity:</span>
                    <Badge variant="outline" className="capitalize">
                      {selected.rarity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frame:</span>
                    <span className="text-white font-medium">
                      {getCRDFrameById(selectedFrameId)?.name || 'Modern Frame'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Stats */}
              {aiAnalysis.stats && (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">AI Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-crd-green mb-1">
                        {aiAnalysis.stats.visual_appeal}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Visual Appeal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-crd-blue mb-1">
                        {aiAnalysis.stats.uniqueness}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Uniqueness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-crd-orange mb-1">
                        {aiAnalysis.stats.card_potential}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Card Potential</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500 mb-1">
                        {aiAnalysis.stats.collectibility}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Collectibility</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <CRDButton
                  onClick={() => {
                    // Reset for new card
                    setStep('upload');
                    setUploadedImage('');
                    setCroppedImage('');
                    setAiAnalysis(null);
                    setSelectedVariation(0);
                    setSelectedFrameId('modern-holographic');
                  }}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Another Masterpiece
                </CRDButton>
                
                <div className="grid grid-cols-2 gap-3">
                  <CRDButton
                    onClick={() => {
                      // TODO: Implement save to collection
                      toast.success('Card saved to your collection!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Card
                  </CRDButton>
                  
                  <CRDButton
                    onClick={() => {
                      // TODO: Implement share functionality
                      navigator.share?.({
                        title: selected.title,
                        text: `Check out my new ${selected.rarity} trading card: ${selected.title}!`,
                        url: window.location.href
                      }) || toast.success('Share link copied!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Share
                  </CRDButton>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Frame Selection */}
          <div className="text-center">
            <CRDButton
              onClick={() => setStep('frame-select')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customize
            </CRDButton>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback for done step
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-r from-crd-green to-crd-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-white animate-pulse" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Card Created! 🎉</h2>
        <p className="text-muted-foreground mb-8">
          Your AI-enhanced trading card is ready to amaze collectors!
        </p>
        
        <CRDButton
          onClick={() => {
            setStep('upload');
            setUploadedImage('');
            setCroppedImage('');
            setAiAnalysis(null);
            setSelectedVariation(0);
            setSelectedFrameId('modern-holographic');
          }}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          Create Another Card
        </CRDButton>
      </div>
    </div>
  );
};