import React from 'react';
import { PortfolioModule } from '@/types/portfolio';
import { ProfileHeaderComponent } from './modules/ProfileHeaderComponent';
import { AboutMeComponent } from './modules/AboutMeComponent';
import { FeaturedCardsComponent } from './modules/FeaturedCardsComponent';
import { CardCollectionsComponent } from './modules/CardCollectionsComponent';
import { SocialLinksComponent } from './modules/SocialLinksComponent';
import { StatisticsComponent } from './modules/StatisticsComponent';

interface PortfolioModuleRendererProps {
  module: PortfolioModule;
}

export const PortfolioModuleRenderer: React.FC<PortfolioModuleRendererProps> = ({ module }) => {
  switch (module.type) {
    case 'ProfileHeader':
      return <ProfileHeaderComponent config={module.config as any} />;
    
    case 'AboutMe':
      return <AboutMeComponent config={module.config as any} />;
    
    case 'FeaturedCards':
      return <FeaturedCardsComponent config={module.config as any} />;
    
    case 'CardCollections':
      return <CardCollectionsComponent config={module.config as any} />;
    
    case 'SocialLinks':
      return <SocialLinksComponent config={module.config as any} />;
    
    case 'Statistics':
      return <StatisticsComponent config={module.config as any} />;
    
    default:
      return (
        <div className="p-8 text-center">
          <p className="text-crd-muted">Unknown module type: {module.type}</p>
        </div>
      );
  }
};