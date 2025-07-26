import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { AboutMeConfig } from '@/types/portfolio';

interface AboutMeComponentProps {
  config: AboutMeConfig;
}

export const AboutMeComponent: React.FC<AboutMeComponentProps> = ({ config }) => {
  const { content, showContactButton } = config;

  return (
    <Card className="p-6 bg-crd-surface/20 border-crd-border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-crd-foreground">About Me</h2>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-crd-muted leading-relaxed">
            {content || 'Tell your story here. Share your background, inspiration, and what makes your cards special. This helps collectors connect with you and your work.'}
          </p>
        </div>

        {showContactButton && (
          <div className="pt-2">
            <Button className="bg-crd-blue hover:bg-crd-blue/90">
              <Mail className="w-4 h-4 mr-2" />
              Get in Touch
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};