import { useState } from 'react';

export const useCards = () => {
  return {
    data: [],
    error: null,
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: () => {},
  };
};

export const useToggleFavorite = () => {
  return { mutate: () => {} };
};