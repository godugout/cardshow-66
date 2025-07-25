/**
 * Session Security Utilities
 * Provides secure session management and validation
 */

import { supabase } from '@/integrations/supabase/client';

// Session timeout settings (in milliseconds)
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

// Session security metadata
interface SessionMetadata {
  createdAt: number;
  lastActivity: number;
  userAgent: string;
  ipAddress?: string;
  deviceFingerprint?: string;
}

// Store session metadata securely
export const storeSessionMetadata = (metadata: SessionMetadata): void => {
  try {
    sessionStorage.setItem('session_metadata', JSON.stringify(metadata));
  } catch (error) {
    console.warn('Failed to store session metadata:', error);
  }
};

// Retrieve session metadata
export const getSessionMetadata = (): SessionMetadata | null => {
  try {
    const stored = sessionStorage.getItem('session_metadata');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to retrieve session metadata:', error);
    return null;
  }
};

// Update last activity timestamp
export const updateLastActivity = (): void => {
  const metadata = getSessionMetadata();
  if (metadata) {
    metadata.lastActivity = Date.now();
    storeSessionMetadata(metadata);
  }
};

// Check if session is expired
export const isSessionExpired = (): boolean => {
  const metadata = getSessionMetadata();
  if (!metadata) return true;
  
  const now = Date.now();
  const timeSinceLastActivity = now - metadata.lastActivity;
  
  return timeSinceLastActivity > SESSION_TIMEOUT;
};

// Check if session is about to expire
export const isSessionAboutToExpire = (): boolean => {
  const metadata = getSessionMetadata();
  if (!metadata) return false;
  
  const now = Date.now();
  const timeSinceLastActivity = now - metadata.lastActivity;
  const timeUntilExpiry = SESSION_TIMEOUT - timeSinceLastActivity;
  
  return timeUntilExpiry <= SESSION_WARNING_TIME && timeUntilExpiry > 0;
};

// Initialize session security
export const initializeSessionSecurity = async (): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const metadata: SessionMetadata = {
      createdAt: Date.now(),
      lastActivity: Date.now(),
      userAgent: navigator.userAgent,
      deviceFingerprint: await generateDeviceFingerprint()
    };
    
    storeSessionMetadata(metadata);
  }
};

// Generate a simple device fingerprint
export const generateDeviceFingerprint = async (): Promise<string> => {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ];
  
  const fingerprint = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Validate session integrity
export const validateSessionIntegrity = async (): Promise<boolean> => {
  const metadata = getSessionMetadata();
  if (!metadata) return false;
  
  // Check if session is expired
  if (isSessionExpired()) {
    await invalidateSession();
    return false;
  }
  
  // Check device fingerprint
  const currentFingerprint = await generateDeviceFingerprint();
  if (metadata.deviceFingerprint && metadata.deviceFingerprint !== currentFingerprint) {
    console.warn('Device fingerprint mismatch detected');
    await invalidateSession();
    return false;
  }
  
  // Check user agent
  if (metadata.userAgent !== navigator.userAgent) {
    console.warn('User agent change detected');
    await invalidateSession();
    return false;
  }
  
  // Update last activity
  updateLastActivity();
  
  return true;
};

// Invalidate session and clean up
export const invalidateSession = async (): Promise<void> => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear session storage
    sessionStorage.removeItem('session_metadata');
    sessionStorage.removeItem('csrf_token');
    
    // Clear any other sensitive data
    localStorage.removeItem('user_preferences');
    
    // Redirect to login page
    window.location.href = '/auth/signin';
  } catch (error) {
    console.error('Error during session invalidation:', error);
  }
};

// Session activity monitor
export const startSessionMonitoring = (): () => void => {
  let intervalId: NodeJS.Timeout;
  
  const monitor = async () => {
    const isValid = await validateSessionIntegrity();
    
    if (!isValid) {
      clearInterval(intervalId);
      return;
    }
    
    // Show warning if session is about to expire
    if (isSessionAboutToExpire()) {
      const shouldExtend = confirm(
        'Your session is about to expire. Would you like to extend it?'
      );
      
      if (shouldExtend) {
        // Refresh the session
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh failed:', error);
          await invalidateSession();
        } else {
          updateLastActivity();
        }
      } else {
        await invalidateSession();
      }
    }
  };
  
  // Check session every 5 minutes
  intervalId = setInterval(monitor, 5 * 60 * 1000);
  
  // Also check on user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  const handleActivity = () => {
    updateLastActivity();
  };
  
  activityEvents.forEach(event => {
    document.addEventListener(event, handleActivity, true);
  });
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity, true);
    });
  };
};