import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { LoadingState } from '@/components/common/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const EnhancedProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const { isFeatureEnabled } = useFeatureFlags();
  const location = useLocation();
  
  const realAuthEnabled = isFeatureEnabled('REAL_AUTH');
  const isMockUser = user?.id === '00000000-0000-0000-0000-000000000001';

  if (loading) {
    return <LoadingState message="Authenticating..." fullPage size="lg" />;
  }

  // If real auth is enabled, enforce real authentication
  if (requireAuth && realAuthEnabled) {
    if (!user || isMockUser) {
      return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }
  }

  // If real auth is disabled, allow mock user
  if (requireAuth && !realAuthEnabled) {
    if (!user) {
      return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }
  }

  // Redirect authenticated users away from auth pages
  if (!requireAuth && user && !isMockUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};