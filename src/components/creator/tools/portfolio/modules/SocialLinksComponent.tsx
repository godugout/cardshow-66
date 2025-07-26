import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Twitter, Instagram, Globe, Github } from 'lucide-react';
import { SocialLinksConfig } from '@/types/portfolio';

interface SocialLinksComponentProps {
  config: SocialLinksConfig;
}

export const SocialLinksComponent: React.FC<SocialLinksComponentProps> = ({ config }) => {
  const { links } = config;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const mockLinks = [
    { platform: 'Twitter', url: 'https://twitter.com/cardcreator', username: '@cardcreator' },
    { platform: 'Instagram', url: 'https://instagram.com/cardcreator', username: '@cardcreator' },
    { platform: 'Website', url: 'https://cardcreator.com', username: 'cardcreator.com' }
  ];

  const displayLinks = links.length > 0 ? links : mockLinks;

  return (
    <Card className="p-6 bg-crd-surface/20 border-crd-border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-crd-foreground">
          Connect With Me
        </h2>

        <div className="flex flex-wrap gap-3">
          {displayLinks.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-crd-muted hover:text-crd-foreground border-crd-border hover:border-crd-blue/50"
              asChild
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {getPlatformIcon(link.platform)}
                <span>{link.username || link.platform}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-crd-muted">
              Configure this module to add your social media links.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};