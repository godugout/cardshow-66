import { useState } from 'react';

export const useCards = (filters: any = {}) => {
  return {
    data: { pages: [{ cards: [], total: 0 }] },
    error: null,
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: () => {},
  };
};

export const useToggleFavorite = () => {
  return { 
    mutate: () => {},
    mutateAsync: async () => {},
    isPending: false
  };
};