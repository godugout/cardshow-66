import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedLoading } from '@/components/ui/UnifiedLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <UnifiedLoading />;
  }

  if (!user) {
    // Redirect to sign in with return URL
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // For routes that require a complete profile
  if (requireProfile && user && !user.user_metadata?.profile_complete) {
    return <Navigate to="/auth/profile-setup" replace />;
  }

  return <>{children}</>;
};