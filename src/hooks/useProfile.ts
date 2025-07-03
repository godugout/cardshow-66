import { useState } from 'react';

export const useProfile = () => {
  const [profile] = useState(null);

  const updateProfile = {
    mutate: () => {},
    isPending: false,
  };

  return {
    profile,
    updateProfile,
    isLoading: false
  };
};