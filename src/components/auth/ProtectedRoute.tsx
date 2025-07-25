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

  console.log('ProtectedRoute - Current state:', {
    user: !!user,
    loading,
    location: location.pathname,
    requireProfile
  });

  if (loading) {
    console.log('ProtectedRoute - Still loading auth state');
    return <UnifiedLoading />;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to signin');
    // Redirect to sign in with return URL
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // For routes that require a complete profile
  if (requireProfile && user && !user.user_metadata?.profile_complete) {
    console.log('ProtectedRoute - Profile incomplete, redirecting to setup');
    return <Navigate to="/auth/profile-setup" replace />;
  }

  console.log('ProtectedRoute - Rendering children for authenticated user');
  return <>{children}</>;
};