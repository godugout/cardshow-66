import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProfileHeaderConfig as ConfigType } from '@/types/portfolio';

interface ProfileHeaderConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const ProfileHeaderConfig: React.FC<ProfileHeaderConfigProps> = ({ config, onChange }) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-crd-foreground">Display Name</Label>
        <Input
          id="displayName"
          value={config.displayName || ''}
          onChange={(e) => updateConfig('displayName', e.target.value)}
          placeholder="Your display name"
          className="bg-crd-surface/50 border-crd-border text-crd-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline" className="text-crd-foreground">Tagline</Label>
        <Input
          id="tagline"
          value={config.tagline || ''}
          onChange={(e) => updateConfig('tagline', e.target.value)}
          placeholder="A brief description of what you do"
          className="bg-crd-surface/50 border-crd-border text-crd-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bannerImageUrl" className="text-crd-foreground">Banner Image URL</Label>
        <Input
          id="bannerImageUrl"
          value={config.bannerImageUrl || ''}
          onChange={(e) => updateConfig('bannerImageUrl', e.target.value)}
          placeholder="https://example.com/banner.jpg"
          className="bg-crd-surface/50 border-crd-border text-crd-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl" className="text-crd-foreground">Avatar Image URL</Label>
        <Input
          id="avatarUrl"
          value={config.avatarUrl || ''}
          onChange={(e) => updateConfig('avatarUrl', e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="bg-crd-surface/50 border-crd-border text-crd-foreground"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showStats"
          checked={config.showStats ?? true}
          onCheckedChange={(checked) => updateConfig('showStats', checked)}
        />
        <Label htmlFor="showStats" className="text-crd-foreground">Show Statistics</Label>
      </div>
    </div>
  );
};