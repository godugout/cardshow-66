import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'earn' | 'spend' | 'bonus' | 'refund';
  description: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export const useCredits = () => {
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreditBalance = async () => {
    if (!user?.id) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setBalance(profile.credits_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions((data || []) as CreditTransaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const spendCredits = async (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please sign in to spend credits');
      return false;
    }

    if (balance < amount) {
      toast.error(`Insufficient credits. You need ${amount} credits but only have ${balance}.`);
      return false;
    }

    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount, // Negative for spending
          transaction_type: 'spend',
          description,
          reference_id: referenceId,
          reference_type: referenceType
        });

      if (error) throw error;

      // Update local balance immediately
      setBalance(prev => prev - amount);
      
      // Refresh transactions
      await fetchTransactions();
      
      toast.success(`Spent ${amount} credits: ${description}`);
      return true;
    } catch (error) {
      console.error('Error spending credits:', error);
      toast.error('Failed to spend credits');
      return false;
    }
  };

  const earnCredits = async (
    amount: number,
    description: string,
    type: 'earn' | 'bonus' | 'purchase' = 'earn',
    referenceId?: string,
    referenceType?: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: amount, // Positive for earning
          transaction_type: type,
          description,
          reference_id: referenceId,
          reference_type: referenceType
        });

      if (error) throw error;

      // Update local balance immediately
      setBalance(prev => prev + amount);
      
      // Refresh transactions
      await fetchTransactions();
      
      toast.success(`Earned ${amount} credits: ${description}`);
      return true;
    } catch (error) {
      console.error('Error earning credits:', error);
      toast.error('Failed to earn credits');
      return false;
    }
  };

  const canAfford = (amount: number): boolean => {
    return balance >= amount;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCreditBalance(), fetchTransactions()]);
      setLoading(false);
    };

    if (user?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    balance,
    transactions,
    loading,
    spendCredits,
    earnCredits,
    canAfford,
    refreshBalance: fetchCreditBalance,
    refreshTransactions: fetchTransactions
  };
};