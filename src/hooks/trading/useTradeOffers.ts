import { useState } from 'react';

export const useTradeOffers = () => {
  const [userTrades] = useState<any[]>([]);
  const isLoadingTrades = false;

  const createTradeOffer = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-offer' }),
    isPending: false,
  };

  const acceptTradeOffer = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-offer' }),
    isPending: false,
  };

  const rejectTradeOffer = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-offer' }),
    isPending: false,
  };

  const completeTradeOffer = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-offer' }),
    isPending: false,
  };

  return {
    userTrades,
    isLoadingTrades,
    createTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
    completeTradeOffer
  };
};