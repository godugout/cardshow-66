/**
 * React hook for secure authentication state management
 * Replaces fragmented auth contexts with unified, secure implementation
 */

import { useState, useEffect } from 'react';
import { secureAuthService, AuthState } from '@/lib/security/secureAuthService';

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(secureAuthService.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = secureAuthService.subscribe(setAuthState);
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return {
    // Auth state
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    
    // Auth actions
    signUp: secureAuthService.signUp.bind(secureAuthService),
    signIn: secureAuthService.signIn.bind(secureAuthService),
    signOut: secureAuthService.signOut.bind(secureAuthService),
    signInWithOAuth: secureAuthService.signInWithOAuth.bind(secureAuthService),
    resetPassword: secureAuthService.resetPassword.bind(secureAuthService),
    updatePassword: secureAuthService.updatePassword.bind(secureAuthService),
    refreshSession: secureAuthService.refreshSession.bind(secureAuthService)
  };
};