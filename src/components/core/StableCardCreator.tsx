// Stable Card Creator - Core User Journey Component
import React, { useState, useRef } from 'react';
import { useCRDData } from '@/services/crdDataService';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { CRDInput } from '@/components/ui/design-system/atoms/CRDInput';
import { AIAnalysisSummary } from '@/components/ai/AIAnalysisSummary';
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Eye, 
  Star,
  Tag,
  Type,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StableCardCreatorProps {
  onCardSaved?: (card: any) => void;
}

export const StableCardCreator: React.FC<StableCardCreatorProps> = ({ onCardSaved }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'>('common');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { saveCard, profile } = useCRDData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      const filename = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('card-images')
        .upload(filename, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    if (!image || !title.trim()) {
      toast.error('Please provide an image and title');
      return;
    }

    if (!profile) {
      toast.error('Please sign in to save cards');
      return;
    }

    setIsSaving(true);

    try {
      // Upload image to storage
      const imageUrl = await uploadImageToStorage(image);
      
      // Prepare card data
      const cardData = {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl,
        thumbnailUrl: imageUrl, // Use same URL for now
        rarity,
        category: category.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        frameId: undefined,
        effectsData: undefined,
        metadata: {
          createdWith: 'StableCardCreator',
          version: '1.0'
        },
        isPublic,
        forSale: false,
        price: undefined
      };

      // Save card using unified data service
      const savedCard = await saveCard(cardData);
      
      if (savedCard) {
        toast.success('Card saved successfully!');
        onCardSaved?.(savedCard);
        
        // Reset form
        setImage(null);
        setImagePreview(null);
        setTitle('');
        setDescription('');
        setRarity('common');
        setTags('');
        setCategory('');
        setIsPublic(false);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-400 text-gray-400',
      uncommon: 'border-green-400 text-green-400',
      rare: 'border-blue-400 text-blue-400',
      epic: 'border-purple-400 text-purple-400',
      legendary: 'border-yellow-400 text-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-crd-text mb-2">Create New Card</h1>
        <p className="text-crd-text-dim">Upload an image and add details to create your digital trading card</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Image Upload & Preview */}
        <div className="space-y-6">
          <CRDCard className="p-6">
            <h3 className="text-lg font-semibold text-crd-text mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Card Image
            </h3>
            
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-crd-border rounded-lg p-8 text-center cursor-pointer hover:border-crd-orange transition-colors"
              >
                <Upload className="w-12 h-12 text-crd-text-muted mx-auto mb-4" />
                <p className="text-crd-text mb-2">Click to upload image</p>
                <p className="text-sm text-crd-text-muted">Supports PNG, JPG, WEBP (max 10MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-[2.5/3.5] bg-crd-surface rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Card preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CRDButton
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Change Image
                </CRDButton>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CRDCard>

          {/* Card Preview */}
          {imagePreview && title && (
            <CRDCard className="p-4">
              <h4 className="text-sm font-medium text-crd-text mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </h4>
              <div className={`aspect-[2.5/3.5] border-2 rounded-lg overflow-hidden ${getRarityColor(rarity)}`}>
                <div className="relative h-full">
                  <img 
                    src={imagePreview} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h5 className="text-white font-bold text-sm truncate">{title}</h5>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs font-medium ${getRarityColor(rarity).split(' ')[1]}`}>
                        {rarity.toUpperCase()}
                      </span>
                      <Star className="w-3 h-3 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CRDCard>
          )}

          {/* AI Analysis Section */}
          {imagePreview && (
            <AIAnalysisSummary
              imageFile={image}
              imageUrl={imagePreview}
              onAcceptTitle={(title) => setTitle(title)}
              onAcceptDescription={(description) => setDescription(description)}
              onAcceptCategory={(category) => setCategory(category)}
              onAcceptTags={(tags) => setTags(tags)}
              onAcceptRarity={(rarity) => setRarity(rarity as any)}
              onAcceptAll={(analysis) => {
                if (analysis.title) setTitle(analysis.title);
                if (analysis.description) setDescription(analysis.description);
                if (analysis.category) setCategory(analysis.category);
                if (analysis.tags) setTags(Array.isArray(analysis.tags) ? analysis.tags.join(', ') : analysis.tags);
                if (analysis.rarity) setRarity(analysis.rarity);
              }}
            />
          )}
        </div>

        {/* Right Column - Card Details */}
        <div className="space-y-6">
          <CRDCard className="p-6">
            <h3 className="text-lg font-semibold text-crd-text mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Card Details
            </h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Title *
                </label>
                <CRDInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter card title"
                  maxLength={100}
                  disabled={isSaving}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  maxLength={500}
                  rows={3}
                  disabled={isSaving}
                  className="w-full px-3 py-2 bg-crd-surface border border-crd-border rounded-lg text-crd-text placeholder-crd-text-muted focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent resize-none"
                />
              </div>

              {/* Rarity */}
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Rarity
                </label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as any)}
                  disabled={isSaving}
                  className="w-full px-3 py-2 bg-crd-surface border border-crd-border rounded-lg text-crd-text focus:outline-none focus:ring-2 focus:ring-crd-orange"
                >
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Category
                </label>
                <CRDInput
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Sports, Art, Gaming"
                  disabled={isSaving}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Tags
                </label>
                <CRDInput
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  disabled={isSaving}
                />
                <p className="text-xs text-crd-text-muted mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          </CRDCard>

          {/* Settings */}
          <CRDCard className="p-6">
            <h3 className="text-lg font-semibold text-crd-text mb-4">Settings</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isSaving}
                  className="w-4 h-4 text-crd-orange bg-crd-surface border-crd-border rounded focus:ring-crd-orange focus:ring-2"
                />
                <div>
                  <span className="text-sm font-medium text-crd-text">Make Public</span>
                  <p className="text-xs text-crd-text-muted">Allow others to view this card</p>
                </div>
              </label>
            </div>
          </CRDCard>

          {/* Save Button */}
          <CRDButton
            onClick={handleSave}
            variant="orange"
            className="w-full"
            disabled={!image || !title.trim() || isSaving}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-crd-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Card
              </>
            )}
          </CRDButton>
        </div>
      </div>
    </div>
  );
};