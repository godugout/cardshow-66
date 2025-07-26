import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

interface CardCollectionsConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CardCollectionsConfig: React.FC<CardCollectionsConfigProps> = ({ config, onChange }) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const collectionIds = config.collectionIds || [];

  const addCollectionId = () => {
    const newCollectionIds = [...collectionIds, ''];
    updateConfig('collectionIds', newCollectionIds);
  };

  const removeCollectionId = (index: number) => {
    const newCollectionIds = collectionIds.filter((_: any, i: number) => i !== index);
    updateConfig('collectionIds', newCollectionIds);
  };

  const updateCollectionId = (index: number, value: string) => {
    const newCollectionIds = [...collectionIds];
    newCollectionIds[index] = value;
    updateConfig('collectionIds', newCollectionIds);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayStyle" className="text-crd-foreground">Display Style</Label>
        <Select value={config.displayStyle || 'grid'} onValueChange={(value) => updateConfig('displayStyle', value)}>
          <SelectTrigger className="bg-crd-surface/50 border-crd-border text-crd-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-crd-surface border-crd-border">
            <SelectItem value="grid">Grid Layout</SelectItem>
            <SelectItem value="list">List Layout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showPrivate"
          checked={config.showPrivate ?? false}
          onCheckedChange={(checked) => updateConfig('showPrivate', checked)}
        />
        <Label htmlFor="showPrivate" className="text-crd-foreground">Show Private Collections</Label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-crd-foreground">Collection IDs</Label>
          <Button
            type="button"
            size="sm"
            onClick={addCollectionId}
            className="bg-crd-green hover:bg-crd-green/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Collection
          </Button>
        </div>
        
        <div className="space-y-2">
          {collectionIds.map((collectionId: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={collectionId}
                onChange={(e) => updateCollectionId(index, e.target.value)}
                placeholder="Collection ID"
                className="bg-crd-surface/50 border-crd-border text-crd-foreground"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeCollectionId(index)}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {collectionIds.length === 0 && (
            <p className="text-sm text-crd-muted p-3 bg-crd-surface/30 rounded border border-crd-border/50">
              No collections selected. Click "Add Collection" to feature your collections.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};