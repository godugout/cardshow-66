// Enhanced Authentication Context with Cross-Subdomain Session Persistence
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithDiscord: () => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { persistSessionAcrossSubdomains, getSessionFromSubdomain } = useSubdomainRouting();

  useEffect(() => {
    // Enhanced auth state management with cross-subdomain persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Persist session across subdomains
        if (session) {
          persistSessionAcrossSubdomains({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user
          });
        } else {
          // Clear cross-subdomain session
          localStorage.removeItem('cardshow_session');
          if (!import.meta.env.DEV) {
            document.cookie = 'cardshow_session=; domain=.cardshow.app; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
        
        // Create profile for new users
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            await createUserProfile(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session (including cross-subdomain)
    const initializeAuth = async () => {
      // First check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        // Check for cross-subdomain session
        const crossSubdomainSession = getSessionFromSubdomain();
        if (crossSubdomainSession) {
          // Restore session from cross-subdomain data
          try {
            const { data } = await supabase.auth.setSession({
              access_token: crossSubdomainSession.access_token,
              refresh_token: crossSubdomainSession.refresh_token
            });
            
            if (data.session) {
              setSession(data.session);
              setUser(data.session.user);
            }
          } catch (error) {
            console.error('Error restoring cross-subdomain session:', error);
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [persistSessionAcrossSubdomains, getSessionFromSubdomain]);

  const createUserProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          });

        if (error) {
          console.error('Error creating profile:', error);
        }
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: username || email.split('@')[0],
        }
      }
    });

    if (error) {
      toast.error(`Sign up failed: ${error.message}`);
    } else {
      toast.success('Check your email for confirmation link');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
    } else {
      toast.success('Signed in successfully');
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (error) {
      toast.error(`Google sign in failed: ${error.message}`);
    }

    return { error };
  };

  const signInWithDiscord = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (error) {
      toast.error(`Discord sign in failed: ${error.message}`);
    }

    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    if (error) {
      toast.error(`Magic link failed: ${error.message}`);
    } else {
      toast.success('Check your email for sign in link');
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Sign out failed: ${error.message}`);
    } else {
      toast.success('Signed out successfully');
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast.error(`Password reset failed: ${error.message}`);
    } else {
      toast.success('Check your email for reset link');
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithDiscord,
    signInWithMagicLink,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};