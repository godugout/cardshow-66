/**
 * Secure Authentication Service
 * Consolidated, secure authentication with proper session management
 * Replaces multiple fragmented auth contexts
 */

import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { validateEmail, validatePassword, createRateLimit } from './inputValidation';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Rate limiting for authentication attempts
const loginRateLimit = createRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const signupRateLimit = createRateLimit(3, 60 * 60 * 1000); // 3 attempts per hour

export class SecureAuthService {
  private listeners: Set<(state: AuthState) => void> = new Set();
  private currentState: AuthState = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  };

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Set up auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        this.handleAuthStateChange(event, session);
      });

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await this.handleAuthStateChange('SIGNED_IN', session);
      } else {
        this.updateState({ 
          user: null, 
          session: null, 
          isLoading: false, 
          isAuthenticated: false 
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateState({ 
        user: null, 
        session: null, 
        isLoading: false, 
        isAuthenticated: false 
      });
    }
  }

  private async handleAuthStateChange(event: string, session: Session | null) {
    if (session?.user) {
      // Fetch user profile data
      setTimeout(async () => {
        try {
          const profile = await this.fetchUserProfile(session.user.id);
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            username: profile?.username,
            displayName: profile?.display_name,
            avatarUrl: profile?.avatar_url,
            isVerified: profile?.is_verified || false,
            role: profile?.subscription_tier || 'free'
          };

          this.updateState({
            user: authUser,
            session,
            isLoading: false,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('Profile fetch error:', error);
          this.updateState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              isVerified: false,
              role: 'free'
            },
            session,
            isLoading: false,
            isAuthenticated: true
          });
        }
      }, 0);
    } else {
      this.updateState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }

  private async fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return data;
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  // Public API
  getState(): AuthState {
    return this.currentState;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    // Rate limiting
    const clientIP = 'signup_' + email; // Use email as identifier for rate limiting
    if (!signupRateLimit(clientIP)) {
      return {
        data: null,
        error: { message: 'Too many signup attempts. Please try again later.' } as AuthError
      };
    }

    // Input validation
    if (!validateEmail(email)) {
      return {
        data: null,
        error: { message: 'Invalid email format' } as AuthError
      };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        data: null,
        error: { message: passwordValidation.errors.join(', ') } as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { data, error };
    } catch (err) {
      return {
        data: null,
        error: err as AuthError
      };
    }
  }

  async signIn(email: string, password: string) {
    // Rate limiting
    const clientIP = 'login_' + email; // Use email as identifier for rate limiting
    if (!loginRateLimit(clientIP)) {
      return {
        data: null,
        error: { message: 'Too many login attempts. Please try again later.' } as AuthError
      };
    }

    // Input validation
    if (!validateEmail(email)) {
      return {
        data: null,
        error: { message: 'Invalid email format' } as AuthError
      };
    }

    if (!password.trim()) {
      return {
        data: null,
        error: { message: 'Password is required' } as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      return { data, error };
    } catch (err) {
      return {
        data: null,
        error: err as AuthError
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'discord') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { data, error };
    } catch (err) {
      return {
        data: null,
        error: err as AuthError
      };
    }
  }

  async resetPassword(email: string) {
    if (!validateEmail(email)) {
      return {
        data: null,
        error: { message: 'Invalid email format' } as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { data, error };
    } catch (err) {
      return {
        data: null,
        error: err as AuthError
      };
    }
  }

  async updatePassword(newPassword: string) {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return {
        data: null,
        error: { message: passwordValidation.errors.join(', ') } as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { data, error };
    } catch (err) {
      return {
        data: null,
        error: err as AuthError
      };
    }
  }

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return { data, error };
    } catch (err) {
      return {
        data: null,
        error: err as AuthError
      };
    }
  }
}

// Export singleton instance
export const secureAuthService = new SecureAuthService();