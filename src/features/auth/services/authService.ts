import { supabase } from '@/integrations/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';
import { validateEmail, validatePassword } from '@/lib/security/inputValidation';
import type { OAuthProvider } from '../types';

/**
 * @deprecated Use SecureAuthService instead
 * This service will be removed in favor of the consolidated secure authentication
 */
export class AuthService {
  private getRedirectUrl(path: string = '') {
    // Use the current origin for redirect URLs
    const origin = window.location.origin;
    return `${origin}${path}`;
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
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
          emailRedirectTo: this.getRedirectUrl('/auth/callback'),
        },
      });
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  }

  async signIn(email: string, password: string) {
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
      return { data: null, error: err as AuthError };
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async signInWithOAuth(provider: OAuthProvider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: this.getRedirectUrl('/auth/callback'),
      },
    });
    
    return { data, error };
  }

  async signInWithMagicLink(email: string) {
    if (!validateEmail(email)) {
      return {
        data: null,
        error: { message: 'Invalid email format' } as AuthError
      };
    }
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: this.getRedirectUrl('/auth/callback'),
      },
    });
    
    return { data, error };
  }

  async resetPassword(email: string) {
    if (!validateEmail(email)) {
      return {
        data: null,
        error: { message: 'Invalid email format' } as AuthError
      };
    }
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: this.getRedirectUrl('/auth/reset-password'),
    });
    
    return { data, error };
  }

  async getSession() {
    const result = await supabase.auth.getSession();
    return result;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
