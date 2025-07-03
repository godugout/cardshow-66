
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
  // Create a mock user for development - no authentication required
  const mockUser: User = {
    id: 'mock-user-id',
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

  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>(mockSession);
  const [loading] = useState(false);

  useEffect(() => {
    // Create a mock profile if it doesn't exist
    const createMockProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', mockUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await supabase
            .from('profiles')
            .insert({
              id: mockUser.id,
              user_id: mockUser.id,
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
  }, []);

  // Mock auth functions for development - no actual authentication
  const signIn = async (email: string, password: string) => {
    toast.success('Demo mode - already signed in!');
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    toast.success('Demo mode - already signed in!');
    return { error: null };
  };

  const signOut = async () => {
    toast.success('Demo mode - sign out disabled');
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    toast.success('Demo mode - already signed in!');
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    toast.success('Demo mode - password reset not needed');
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      loading, 
      signIn, 
      signUp, 
      signOut, 
      signInWithOAuth, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
