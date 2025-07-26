export interface PortfolioModule {
  id: string;
  type: PortfolioModuleType;
  config: Record<string, any>;
  order: number;
}

export type PortfolioModuleType = 
  | 'ProfileHeader'
  | 'AboutMe'
  | 'FeaturedCards'
  | 'CardCollections'
  | 'SocialLinks'
  | 'ContactInfo'
  | 'Statistics';

export interface PortfolioLayout {
  id: string;
  user_id: string;
  username: string;
  layout: PortfolioModule[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleTemplate {
  type: PortfolioModuleType;
  name: string;
  description: string;
  icon: string;
  defaultConfig: Record<string, any>;
}

export interface ProfileHeaderConfig {
  bannerImageUrl?: string;
  avatarUrl?: string;
  displayName: string;
  tagline?: string;
  showStats: boolean;
}

export interface AboutMeConfig {
  content: string;
  showContactButton: boolean;
}

export interface FeaturedCardsConfig {
  cardIds: string[];
  displayStyle: 'grid' | 'carousel' | 'featured';
  title: string;
}

export interface CardCollectionsConfig {
  collectionIds: string[];
  showPrivate: boolean;
  displayStyle: 'grid' | 'list';
}

export interface SocialLinksConfig {
  links: {
    platform: string;
    url: string;
    username: string;
  }[];
}

export interface ContactInfoConfig {
  email?: string;
  website?: string;
  showEmail: boolean;
  showWebsite: boolean;
}

export interface StatisticsConfig {
  showTotalCards: boolean;
  showTotalViews: boolean;
  showFollowers: boolean;
  showJoinDate: boolean;
}