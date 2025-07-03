import { useState } from 'react';

export const useStripeConnect = () => {
  const [loading] = useState(false);

  const createSellerAccount = async () => {
    return { account_id: 'mock-account' };
  };

  const getAccountLink = async () => {
    return 'https://mock-stripe-url.com';
  };

  return {
    createSellerAccount,
    getAccountLink,
    loading
  };
};