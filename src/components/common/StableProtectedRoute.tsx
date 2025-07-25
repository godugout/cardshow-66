// Stable Protected Route - Beta Baseline
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCRDData } from '@/services/crdDataService';

interface StableProtectedRouteProps {
  children: React.ReactNode;
}

export const StableProtectedRoute: React.FC<StableProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useCRDData();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-crd-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-crd-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-crd-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign in with return URL
    return <Navigate to="/auth/stable-signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};