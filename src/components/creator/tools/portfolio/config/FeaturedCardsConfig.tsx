import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface FeaturedCardsConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const FeaturedCardsConfig: React.FC<FeaturedCardsConfigProps> = ({ config, onChange }) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const cardIds = config.cardIds || [];

  const addCardId = () => {
    const newCardIds = [...cardIds, ''];
    updateConfig('cardIds', newCardIds);
  };

  const removeCardId = (index: number) => {
    const newCardIds = cardIds.filter((_: any, i: number) => i !== index);
    updateConfig('cardIds', newCardIds);
  };

  const updateCardId = (index: number, value: string) => {
    const newCardIds = [...cardIds];
    newCardIds[index] = value;
    updateConfig('cardIds', newCardIds);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-crd-foreground">Section Title</Label>
        <Input
          id="title"
          value={config.title || 'Featured Cards'}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="Featured Cards"
          className="bg-crd-surface/50 border-crd-border text-crd-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayStyle" className="text-crd-foreground">Display Style</Label>
        <Select value={config.displayStyle || 'grid'} onValueChange={(value) => updateConfig('displayStyle', value)}>
          <SelectTrigger className="bg-crd-surface/50 border-crd-border text-crd-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-crd-surface border-crd-border">
            <SelectItem value="grid">Grid Layout</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="featured">Featured Layout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-crd-foreground">Featured Card IDs</Label>
          <Button
            type="button"
            size="sm"
            onClick={addCardId}
            className="bg-crd-green hover:bg-crd-green/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Card
          </Button>
        </div>
        
        <div className="space-y-2">
          {cardIds.map((cardId: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cardId}
                onChange={(e) => updateCardId(index, e.target.value)}
                placeholder="Card ID"
                className="bg-crd-surface/50 border-crd-border text-crd-foreground"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeCardId(index)}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {cardIds.length === 0 && (
            <p className="text-sm text-crd-muted p-3 bg-crd-surface/30 rounded border border-crd-border/50">
              No cards selected. Click "Add Card" to feature your cards.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};