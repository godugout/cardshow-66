
import { useState, useEffect } from 'react';
import { useAppSettings } from './useAppSettings';

export interface FeatureFlags {
  // Legacy features
  OAK_FEATURES: boolean;
  
  // Core features
  REAL_AUTH: boolean;
  STRIPE_PAYMENTS: boolean;
  REAL_TIME_FEATURES: boolean;
  
  // Advanced features  
  ADVANCED_3D_FEATURES: boolean;
  AR_FEATURES: boolean;
  AI_RECOMMENDATIONS: boolean;
  
  // Experimental features
  VOICE_COMMANDS: boolean;
  HAPTIC_FEEDBACK: boolean;
  COLLABORATION_TOOLS: boolean;
  
  // Performance features
  PERFORMANCE_MONITORING: boolean;
  ADVANCED_CACHING: boolean;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Legacy
  OAK_FEATURES: false,
  
  // Core - Enable gradually
  REAL_AUTH: false, // Enable after testing
  STRIPE_PAYMENTS: true, // Already implemented
  REAL_TIME_FEATURES: false,
  
  // Advanced - Enable after core is stable
  ADVANCED_3D_FEATURES: true, // Already working
  AR_FEATURES: false,
  AI_RECOMMENDATIONS: false,
  
  // Experimental - Beta users only
  VOICE_COMMANDS: false,
  HAPTIC_FEEDBACK: false,
  COLLABORATION_TOOLS: false,
  
  // Performance - Enable for monitoring
  PERFORMANCE_MONITORING: true,
  ADVANCED_CACHING: false,
};

export const useFeatureFlags = () => {
  const { settings, saveSettings, isLoading } = useAppSettings();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  useEffect(() => {
    if (settings?.features) {
      setFeatureFlags({
        ...DEFAULT_FEATURE_FLAGS,
        ...settings.features
      });
    }
  }, [settings]);

  const updateFeatureFlag = (flag: keyof FeatureFlags, enabled: boolean) => {
    const updatedFlags = { ...featureFlags, [flag]: enabled };
    setFeatureFlags(updatedFlags);
    
    saveSettings({
      ...settings,
      features: updatedFlags
    });
  };

  const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
    return featureFlags[flag] ?? DEFAULT_FEATURE_FLAGS[flag];
  };

  return {
    featureFlags,
    updateFeatureFlag,
    isFeatureEnabled,
    isLoading
  };
};
