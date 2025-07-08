import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithOAuth: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isFeatureEnabled } = useFeatureFlags();
  const realAuthEnabled = isFeatureEnabled('REAL_AUTH');

  // Fixed mock user with valid UUID format
  const mockUserId = '00000000-0000-0000-0000-000000000001';
  const mockUser: User = {
    id: mockUserId,
    email: 'demo@cardshow.dev',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      username: 'demo-user',
      full_name: 'Demo User',
      avatar_url: ''
    },
    aud: 'authenticated',
    role: 'authenticated'
  } as User;

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser
  } as Session;

  // Real auth state
  const [realUser, setRealUser] = useState<User | null>(null);
  const [realSession, setRealSession] = useState<Session | null>(null);
  const [realLoading, setRealLoading] = useState(true);

  // Mock auth state
  const [mockUserState] = useState<User | null>(mockUser);
  const [mockSessionState] = useState<Session | null>(mockSession);
  const [mockLoading] = useState(false);

  // Adapter pattern: return real or mock auth based on feature flag
  const user = realAuthEnabled ? realUser : mockUserState;
  const session = realAuthEnabled ? realSession : mockSessionState;
  const loading = realAuthEnabled ? realLoading : mockLoading;

  // Real authentication setup
  useEffect(() => {
    if (!realAuthEnabled) {
      setRealLoading(false);
      return;
    }

    // Set up real auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setRealSession(session);
        setRealUser(session?.user ?? null);
        setRealLoading(false);

        // Create profile for new users (deferred to avoid deadlock)
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            createUserProfile(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setRealSession(session);
      setRealUser(session?.user ?? null);
      setRealLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [realAuthEnabled]);

  // Mock profile setup
  useEffect(() => {
    if (realAuthEnabled) return;

    const createMockProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', mockUserId)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await supabase
            .from('profiles')
            .insert({
              user_id: mockUserId,
              username: 'demo-user',
              display_name: 'Demo User',
              avatar_url: '',
              bio: 'Demo user for testing'
            });
        }
      } catch (error) {
        console.log('Mock profile setup:', error);
      }
    };

    createMockProfile();
  }, [realAuthEnabled]);

  // Helper function to create user profile
  const createUserProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            display_name: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
            avatar_url: user.user_metadata?.avatar_url || '',
            bio: ''
          });
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Auth functions - real or mock based on feature flag
  const signIn = async (email: string, password: string) => {
    if (!realAuthEnabled) {
      console.log('Mock sign in:', { email });
      toast.success('Signed in successfully (mock)');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('An error occurred during sign in');
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!realAuthEnabled) {
      console.log('Mock sign up:', { email });
      toast.success('Account created successfully (mock)');
      return { error: null };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email for verification.');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('An error occurred during sign up');
      return { error: authError };
    }
  };

  const signOut = async () => {
    if (!realAuthEnabled) {
      console.log('Mock sign out');
      toast.success('Signed out successfully (mock)');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      toast.error('An error occurred during sign out');
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    if (!realAuthEnabled) {
      console.log('Mock OAuth sign in:', { provider });
      toast.success(`Signed in with ${provider} successfully (mock)`);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error(`An error occurred signing in with ${provider}`);
      return { error: authError };
    }
  };

  const resetPassword = async (email: string) => {
    if (!realAuthEnabled) {
      console.log('Mock reset password:', { email });
      toast.success('Password reset email sent (mock)');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('An error occurred sending reset email');
      return { error: authError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};