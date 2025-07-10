import React, { useState, useCallback } from 'react';
import { useIntegratedCardEditor } from '@/hooks/useIntegratedCardEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Eye, Sparkles, Image, Type, Layers, Palette } from 'lucide-react';
import { CardPreview } from './CardPreview';
import { ImageUploader } from './ImageUploader';
import { FrameSelector } from './FrameSelector';
import { EffectsPanel } from './EffectsPanel';
import type { CardRarity } from '@/types/card';

const rarityOptions: { value: CardRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Common', color: 'bg-gray-500' },
  { value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-500' },
  { value: 'epic', label: 'Epic', color: 'bg-purple-500' },
  { value: 'legendary', label: 'Legendary', color: 'bg-yellow-500' },
  { value: 'mythic', label: 'Mythic', color: 'bg-red-500' },
];

export const CardCreationInterface: React.FC = () => {
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
    updateLayer
  } = useIntegratedCardEditor();

  const [activePanel, setActivePanel] = useState<'image' | 'frame' | 'effects' | 'text'>('image');
  const [tags, setTags] = useState<string>('');

  const handleTagsChange = useCallback((value: string) => {
    setTags(value);
    const tagArray = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    updateField('tags', tagArray);
  }, [updateField]);

  const handleSave = useCallback(async () => {
    await saveCard(false);
  }, [saveCard]);

  const handlePublish = useCallback(async () => {
    await publishCard();
  }, [publishCard]);

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
            <div className="grid grid-cols-4 gap-2 mb-4">
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

            <Separator className="my-4" />

            {/* Panel Content */}
            {activePanel === 'image' && (
              <ImageUploader onImageUpload={handleImageUpload} currentImage={cardData.image_url} />
            )}

            {activePanel === 'frame' && (
              <FrameSelector selectedFrame={selectedFrame} onFrameSelect={selectFrame} />
            )}

            {activePanel === 'effects' && (
              <EffectsPanel 
                layers={layers}
                onAddLayer={addLayer}
                onUpdateLayer={updateLayer}
              />
            )}

            {activePanel === 'text' && (
              <div className="text-center py-8 text-muted-foreground">
                <Type className="w-12 h-12 mx-auto mb-2" />
                <p>Text editing tools coming soon...</p>
              </div>
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
            <CardPreview
              card={cardData}
              selectedFrame={selectedFrame}
              layers={layers}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};