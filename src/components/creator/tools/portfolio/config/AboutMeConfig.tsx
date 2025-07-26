import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface AboutMeConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AboutMeConfig: React.FC<AboutMeConfigProps> = ({ config, onChange }) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content" className="text-crd-foreground">About Me Content</Label>
        <Textarea
          id="content"
          value={config.content || ''}
          onChange={(e) => updateConfig('content', e.target.value)}
          placeholder="Tell your story here. Share your background, inspiration, and what makes your cards special..."
          className="bg-crd-surface/50 border-crd-border text-crd-foreground min-h-[120px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showContactButton"
          checked={config.showContactButton ?? true}
          onCheckedChange={(checked) => updateConfig('showContactButton', checked)}
        />
        <Label htmlFor="showContactButton" className="text-crd-foreground">Show Contact Button</Label>
      </div>
    </div>
  );
};