
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User3DPreferences {
  enabled: boolean;
  quality: 'high' | 'medium' | 'low';
  autoEnable: boolean;
  showPerformanceWarnings: boolean;
}

const DEFAULT_PREFERENCES: User3DPreferences = {
  enabled: true,
  quality: 'high',
  autoEnable: true,
  showPerformanceWarnings: true
};

export const use3DPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localPreferences, setLocalPreferences] = useState<User3DPreferences | null>(null);

  // Load preferences from localStorage (profiles table doesn't have 3D preferences yet)
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-3d-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // For now, load from localStorage until we add 3D preferences to profiles table
      const saved = localStorage.getItem(`crd-3d-preferences-${user.id}`);
      if (saved) {
        try {
          return JSON.parse(saved) as User3DPreferences;
        } catch (error) {
          console.warn('Failed to parse 3D preferences:', error);
        }
      }
      
      return DEFAULT_PREFERENCES;
    },
    enabled: !!user?.id
  });

  // Save preferences to localStorage (profiles table doesn't have 3D preferences yet)
  const savePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: User3DPreferences) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Save to localStorage until we add 3D preferences to profiles table
      localStorage.setItem(`crd-3d-preferences-${user.id}`, JSON.stringify(newPreferences));
      return newPreferences;
    },
    onSuccess: (newPreferences) => {
      queryClient.setQueryData(['user-3d-preferences', user?.id], newPreferences);
    }
  });

  // Load local preferences for unauthenticated users
  useEffect(() => {
    if (!user?.id) {
      const saved = localStorage.getItem('crd-3d-preferences');
      if (saved) {
        try {
          setLocalPreferences(JSON.parse(saved));
        } catch (error) {
          console.warn('Failed to parse local 3D preferences:', error);
          setLocalPreferences(DEFAULT_PREFERENCES);
        }
      } else {
        setLocalPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, [user?.id]);

  const currentPreferences = user?.id ? preferences : localPreferences;

  const updatePreferences = async (updates: Partial<User3DPreferences>) => {
    const newPreferences = { ...currentPreferences, ...updates } as User3DPreferences;
    
    if (user?.id) {
      // Save to Supabase for authenticated users
      await savePreferencesMutation.mutateAsync(newPreferences);
    } else {
      // Save to localStorage for unauthenticated users
      localStorage.setItem('crd-3d-preferences', JSON.stringify(newPreferences));
      setLocalPreferences(newPreferences);
    }
  };

  return {
    preferences: currentPreferences || DEFAULT_PREFERENCES,
    isLoading: user?.id ? isLoading : false,
    updatePreferences,
    isUpdating: savePreferencesMutation.isPending
  };
};
