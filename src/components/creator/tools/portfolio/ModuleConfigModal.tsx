import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PortfolioModule } from '@/types/portfolio';
import { ProfileHeaderConfig } from './config/ProfileHeaderConfig';
import { AboutMeConfig } from './config/AboutMeConfig';
import { FeaturedCardsConfig } from './config/FeaturedCardsConfig';
import { CardCollectionsConfig } from './config/CardCollectionsConfig';
import { SocialLinksConfig } from './config/SocialLinksConfig';
import { StatisticsConfig } from './config/StatisticsConfig';

interface ModuleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: PortfolioModule;
  onUpdateConfig: (moduleId: string, config: Record<string, any>) => void;
}

export const ModuleConfigModal: React.FC<ModuleConfigModalProps> = ({
  isOpen,
  onClose,
  module,
  onUpdateConfig,
}) => {
  const [config, setConfig] = useState(module.config);

  useEffect(() => {
    setConfig(module.config);
  }, [module.config]);

  const handleSave = () => {
    onUpdateConfig(module.id, config);
  };

  const renderConfigComponent = () => {
    const commonProps = {
      config,
      onChange: setConfig,
    };

    switch (module.type) {
      case 'ProfileHeader':
        return <ProfileHeaderConfig {...commonProps} />;
      
      case 'AboutMe':
        return <AboutMeConfig {...commonProps} />;
      
      case 'FeaturedCards':
        return <FeaturedCardsConfig {...commonProps} />;
      
      case 'CardCollections':
        return <CardCollectionsConfig {...commonProps} />;
      
      case 'SocialLinks':
        return <SocialLinksConfig {...commonProps} />;
      
      case 'Statistics':
        return <StatisticsConfig {...commonProps} />;
      
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-crd-muted">No configuration available for this module type.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-crd-surface border-crd-border">
        <DialogHeader>
          <DialogTitle className="text-crd-foreground">
            Configure {module.type.replace(/([A-Z])/g, ' $1').trim()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderConfigComponent()}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-crd-border/50">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-crd-muted hover:text-crd-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-crd-green hover:bg-crd-green/90"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};