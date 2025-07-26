import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface SocialLinksConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SocialLinksConfig: React.FC<SocialLinksConfigProps> = ({ config, onChange }) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const links = config.links || [];

  const addLink = () => {
    const newLinks = [...links, { platform: 'Twitter', url: '', username: '' }];
    updateConfig('links', newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_: any, i: number) => i !== index);
    updateConfig('links', newLinks);
  };

  const updateLink = (index: number, key: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [key]: value };
    updateConfig('links', newLinks);
  };

  const platforms = [
    'Twitter',
    'Instagram', 
    'Github',
    'Website',
    'LinkedIn',
    'YouTube',
    'TikTok',
    'Discord'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-crd-foreground">Social Media Links</Label>
        <Button
          type="button"
          size="sm"
          onClick={addLink}
          className="bg-crd-green hover:bg-crd-green/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {links.map((link: any, index: number) => (
          <div key={index} className="p-4 border border-crd-border/50 rounded-lg bg-crd-surface/30 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-crd-foreground">Link #{index + 1}</h4>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeLink(index)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-crd-muted">Platform</Label>
                <Select 
                  value={link.platform} 
                  onValueChange={(value) => updateLink(index, 'platform', value)}
                >
                  <SelectTrigger className="bg-crd-surface/50 border-crd-border text-crd-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-crd-surface border-crd-border">
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-crd-muted">URL</Label>
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder="https://example.com/profile"
                  className="bg-crd-surface/50 border-crd-border text-crd-foreground"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-crd-muted">Display Name</Label>
                <Input
                  value={link.username}
                  onChange={(e) => updateLink(index, 'username', e.target.value)}
                  placeholder="@username"
                  className="bg-crd-surface/50 border-crd-border text-crd-foreground"
                />
              </div>
            </div>
          </div>
        ))}
        
        {links.length === 0 && (
          <p className="text-sm text-crd-muted p-3 bg-crd-surface/30 rounded border border-crd-border/50">
            No social links added. Click "Add Link" to connect your social media profiles.
          </p>
        )}
      </div>
    </div>
  );
};