import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntegratedCardEditor } from '@/hooks/useIntegratedCardEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Eye, Sparkles, Image, Type, Layers, Palette, FileImage } from 'lucide-react';
import { StudioPreviewButton } from './StudioPreviewButton';
import { EnhancedCardPreview } from './EnhancedCardPreview';
import { ImageUploader } from './ImageUploader';
import { AIAnalysisSummary } from '@/components/ai/AIAnalysisSummary';
import { FrameSelector } from './FrameSelector';
import { EffectsPanel } from './EffectsPanel';
import { PSDUploadZone } from './PSDUploadZone';
import { PSDToFrameConverter } from './PSDToFrameConverter';
import { MaterialLibrary } from '@/components/studio/assets/MaterialLibrary';
import { EffectsLibrary } from '@/components/studio/assets/EffectsLibrary';
import { TextEditingPanel } from './TextEditingPanel';
import type { CardRarity } from '@/types/card';
import type { PSDToCardData } from '@/utils/psdToCardConverter';
import type { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';

const rarityOptions: { value: CardRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Common', color: 'bg-gray-500' },
  { value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-500' },
  { value: 'epic', label: 'Epic', color: 'bg-purple-500' },
  { value: 'legendary', label: 'Legendary', color: 'bg-yellow-500' },
  { value: 'mythic', label: 'Mythic', color: 'bg-red-500' },
];

export const CardCreationInterface: React.FC = () => {
  const location = useLocation();
  const {
    cardData,
    updateField,
    selectedFrame,
    selectFrame,
    handleImageUpload,
    saveCard,
    publishCard,
    isSaving,
    layers,
    addLayer,
    updateLayer,
    initializeFromPSD
  } = useIntegratedCardEditor();

  const [activePanel, setActivePanel] = useState<'psd' | 'image' | 'frame' | 'materials' | 'effects' | 'text' | 'ai'>('psd');
  const [tags, setTags] = useState<string>('');
  const [isFromPSD, setIsFromPSD] = useState(false);
  const [processedPSD, setProcessedPSD] = useState<EnhancedProcessedPSD | null>(null);
  const [showPSDConverter, setShowPSDConverter] = useState(false);
  const [textElements, setTextElements] = useState<any[]>([]);
  const [selectedTextElement, setSelectedTextElement] = useState<string>('');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);

  // Handle PSD data initialization
  useEffect(() => {
    const state = location.state as { fromPSD?: boolean; psdCardData?: PSDToCardData } | null;
    
    if (state?.fromPSD && state?.psdCardData && initializeFromPSD) {
      setIsFromPSD(true);
      initializeFromPSD(state.psdCardData);
      setTags(state.psdCardData.tags.join(', '));
      // Start with frame panel if coming from PSD
      setActivePanel('frame');
    }
  }, [location.state, initializeFromPSD]);

  const handleTagsChange = useCallback((value: string) => {
    setTags(value);
    const tagArray = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    updateField('tags', tagArray);
  }, [updateField]);

  const handleImageUploadWithAI = useCallback(async (file: File) => {
    await handleImageUpload(file);
    setUploadedImageFile(file);
    // Switch to AI panel for automatic analysis
    setActivePanel('ai');
  }, [handleImageUpload]);

  const handleSave = useCallback(async () => {
    await saveCard(false);
  }, [saveCard]);

  const handlePublish = useCallback(async () => {
    await publishCard();
  }, [publishCard]);

  const handlePSDProcessed = useCallback((psd: EnhancedProcessedPSD) => {
    setProcessedPSD(psd);
    setShowPSDConverter(true);
  }, []);

  const handlePSDFrameConverted = useCallback((frameData: any) => {
    // Convert PSD frame data to card initialization
    if (initializeFromPSD) {
      const cardData: PSDToCardData = {
        title: frameData.name,
        description: `Created from ${frameData.originalPSD}`,
        image_url: frameData.extractedImages?.flattenedImageUrl || '',
        thumbnail_url: frameData.extractedImages?.thumbnailUrl || '',
        tags: ['psd-import', 'custom-frame'],
        suggested_category: 'imported',
        rarity: 'common' as CardRarity,
        quality_score: 85,
        psd_metadata: {
          original_filename: frameData.originalPSD || 'unknown.psd',
          dimensions: frameData.dimensions,
          layer_count: frameData.layers.length,
          has_character_layers: frameData.layers.some((l: any) => l.type === 'foreground'),
          has_background_layers: frameData.layers.some((l: any) => l.type === 'background'),
          has_text_layers: frameData.layers.some((l: any) => l.type === 'text'),
          has_effect_layers: frameData.layers.some((l: any) => l.type === 'effect'),
          extracted_images: frameData.extractedImages?.layerImages?.map((img: any) => img.imageUrl) || []
        },
        design_metadata: {
          source: 'psd-import',
          psd_data: frameData.extractedImages,
          ai_analysis: null
        }
      };
      
      initializeFromPSD(cardData);
      setIsFromPSD(true);
      setTags(cardData.tags.join(', '));
    }
    
    // Switch to frame panel for final adjustments
    setActivePanel('frame');
    setShowPSDConverter(false);
    setProcessedPSD(null);
  }, [initializeFromPSD]);

  const handleBackToPSDUpload = useCallback(() => {
    setShowPSDConverter(false);
    setProcessedPSD(null);
    setActivePanel('psd');
  }, []);

  // Text element handlers
  const handleAddTextElement = useCallback((element: any) => {
    const newElement = { ...element, id: `text-${Date.now()}` };
    setTextElements(prev => [...prev, newElement]);
    setSelectedTextElement(newElement.id);
  }, []);

  const handleUpdateTextElement = useCallback((id: string, updates: any) => {
    setTextElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const handleDeleteTextElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedTextElement === id) {
      setSelectedTextElement('');
    }
  }, [selectedTextElement]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel - Creation Tools */}
      <div className="space-y-6">
        {/* Card Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Card Information
              {isFromPSD && (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-crd-orange/10 to-crd-green/10">
                  From PSD
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={cardData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter card title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={cardData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Enter card description..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rarity">Rarity</Label>
              <Select value={cardData.rarity} onValueChange={(value: CardRarity) => updateField('rarity', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  {rarityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="sports, baseball, vintage..."
                className="mt-1"
              />
              {cardData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {cardData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Creation Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Design Tools
            </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-6 gap-2 mb-4">
               <Button
                 variant={activePanel === 'psd' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('psd')}
                 className="flex flex-col items-center gap-1 h-auto py-2"
               >
                 <FileImage className="w-4 h-4" />
                 <span className="text-xs">PSD</span>
               </Button>
               <Button
                 variant={activePanel === 'image' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('image')}
                 className="flex flex-col items-center gap-1 h-auto py-2"
               >
                 <Image className="w-4 h-4" />
                 <span className="text-xs">Image</span>
               </Button>
               <Button
                 variant={activePanel === 'frame' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('frame')}
                 className="flex flex-col items-center gap-1 h-auto py-2"
               >
                 <Layers className="w-4 h-4" />
                 <span className="text-xs">Frame</span>
               </Button>
               <Button
                 variant={activePanel === 'materials' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('materials')}
                 className="flex flex-col items-center gap-1 h-auto py-2"
               >
                 <Palette className="w-4 h-4" />
                 <span className="text-xs">Materials</span>
               </Button>
               <Button
                 variant={activePanel === 'effects' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('effects')}
                 className="flex flex-col items-center gap-1 h-auto py-2"
               >
                 <Sparkles className="w-4 h-4" />
                 <span className="text-xs">Effects</span>
               </Button>
               <Button
                 variant={activePanel === 'text' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('text')}
                 className="flex flex-col items-center gap-1 h-auto py-2"
               >
                 <Type className="w-4 h-4" />
                 <span className="text-xs">Text</span>
               </Button>
             </div>
             
             {/* AI Panel - Separate row for better visibility */}
             <div className="mb-4">
               <Button
                 variant={activePanel === 'ai' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setActivePanel('ai')}
                 className="w-full flex items-center justify-center gap-2 h-auto py-3"
                 disabled={!cardData.image_url}
               >
                 <Sparkles className="w-4 h-4" />
                 <span>AI-Powered Analysis {cardData.image_url ? '✨' : '(Upload image first)'}</span>
               </Button>
             </div>

            <Separator className="my-4" />

            {/* Panel Content */}
            {activePanel === 'psd' && (
              showPSDConverter && processedPSD ? (
                <PSDToFrameConverter
                  processedPSD={processedPSD}
                  onConvertToCard={handlePSDFrameConverted}
                  onBack={handleBackToPSDUpload}
                />
              ) : (
                <PSDUploadZone onPSDProcessed={handlePSDProcessed} />
              )
            )}

             {activePanel === 'image' && (
               <ImageUploader onImageUpload={handleImageUploadWithAI} currentImage={cardData.image_url} />
             )}

            {activePanel === 'frame' && (
              <FrameSelector selectedFrame={selectedFrame} onFrameSelect={selectFrame} />
            )}

            {activePanel === 'materials' && (
              <MaterialLibrary />
            )}

            {activePanel === 'effects' && (
              <div className="space-y-4">
                <EffectsLibrary />
                <Separator />
                <EffectsPanel 
                  layers={layers}
                  onAddLayer={addLayer}
                  onUpdateLayer={updateLayer}
                />
              </div>
            )}

            {activePanel === 'text' && (
              <TextEditingPanel
                elements={textElements}
                selectedElement={selectedTextElement}
                onAddElement={handleAddTextElement}
                onUpdateElement={handleUpdateTextElement}
                onDeleteElement={handleDeleteTextElement}
                onSelectElement={setSelectedTextElement}
              />
             )}

             {activePanel === 'ai' && (
               <AIAnalysisSummary
                 imageUrl={cardData.image_url}
                 imageFile={uploadedImageFile}
                 onAcceptTitle={(title) => updateField('title', title)}
                 onAcceptDescription={(description) => updateField('description', description)}
                 onAcceptCategory={(category) => {
                   // Add category as a tag if not already present
                   const currentTags = cardData.tags || [];
                   if (!currentTags.includes(category)) {
                     const newTags = [...currentTags, category];
                     updateField('tags', newTags);
                     setTags(newTags.join(', '));
                   }
                 }}
                 onAcceptTags={(tags) => {
                   setTags(tags);
                   const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                   updateField('tags', tagArray);
                 }}
                 onAcceptRarity={(rarity) => updateField('rarity', rarity as CardRarity)}
                 onAcceptAll={(analysis) => {
                   if (analysis.title) updateField('title', analysis.title);
                   if (analysis.description) updateField('description', analysis.description);
                   if (analysis.rarity) updateField('rarity', analysis.rarity);
                   
                   // Handle tags and category
                   let allTags = [...(cardData.tags || [])];
                   if (analysis.category && !allTags.includes(analysis.category)) {
                     allTags.push(analysis.category);
                   }
                   if (analysis.tags) {
                     const aiTags = Array.isArray(analysis.tags) ? analysis.tags : [analysis.tags];
                     aiTags.forEach(tag => {
                       if (!allTags.includes(tag)) {
                         allTags.push(tag);
                       }
                     });
                   }
                   
                   updateField('tags', allTags);
                   setTags(allTags.join(', '));
                 }}
               />
             )}
           </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || !cardData.title.trim()}
            className="flex-1"
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <StudioPreviewButton
            cardData={cardData}
            selectedFrame={selectedFrame}
            layers={[...layers, ...textElements]}
            disabled={isSaving || !cardData.title.trim()}
          />
          <Button
            onClick={handlePublish}
            disabled={isSaving || !cardData.title.trim() || !cardData.image_url}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish Card
          </Button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedCardPreview
              card={cardData}
              selectedFrame={selectedFrame}
              layers={[...layers, ...textElements.map(el => ({
                id: el.id,
                name: el.content || 'Text',
                type: 'text' as const,
                visible: el.visible,
                locked: false,
                opacity: el.opacity,
                data: el
              }))]}
              showControls={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};