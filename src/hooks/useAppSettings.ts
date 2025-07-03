import { useState } from 'react';

export const useAppSettings = () => {
  const [settings] = useState({
    theme: 'dark',
    notifications: true
  });

  const updateSettings = {
    mutate: () => {},
    isPending: false,
  };

  return {
    settings,
    updateSettings,
    isLoading: false
  };
};