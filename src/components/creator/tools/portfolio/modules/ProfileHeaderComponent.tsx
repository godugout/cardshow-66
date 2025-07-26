import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileHeaderConfig } from '@/types/portfolio';

interface ProfileHeaderComponentProps {
  config: ProfileHeaderConfig;
}

export const ProfileHeaderComponent: React.FC<ProfileHeaderComponentProps> = ({ config }) => {
  const {
    bannerImageUrl,
    avatarUrl,
    displayName,
    tagline,
    showStats
  } = config;

  return (
    <Card className="overflow-hidden border-0 bg-transparent">
      {/* Banner */}
      <div 
        className="h-48 bg-gradient-to-r from-crd-orange/20 to-crd-blue/20 relative"
        style={bannerImageUrl ? {
          backgroundImage: `url(${bannerImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-crd-surface bg-crd-surface/50 backdrop-blur-sm overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-crd-muted">
                👤
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-4">
            <h1 className="text-3xl font-bold text-crd-foreground mb-2">
              {displayName || 'Your Name'}
            </h1>
            {tagline && (
              <p className="text-lg text-crd-muted">
                {tagline}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-crd-foreground">24</div>
              <div className="text-sm text-crd-muted">Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crd-foreground">1.2K</div>
              <div className="text-sm text-crd-muted">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crd-foreground">156</div>
              <div className="text-sm text-crd-muted">Followers</div>
            </div>
            <Badge className="bg-crd-green/20 text-crd-green border-crd-green/30">
              ✓ Verified Creator
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};