import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfilePage } from '@/hooks/useProfilePage';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { EnhancedProfileTabs } from '@/components/profile/EnhancedProfileTabs';

export default function Profile() {
  const { user } = useAuth();
  const {
    profile,
    isLoading,
    activeTab,
    setActiveTab,
    memories,
    memoriesLoading,
    hasMore,
    handleLoadMore,
    followers,
    following
  } = useProfilePage();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 py-6">
          <ProfileHeader 
            user={user}
            profile={profile}
            followers={followers}
            following={following}
          />
          
          <EnhancedProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            memories={memories}
            memoriesLoading={memoriesLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}