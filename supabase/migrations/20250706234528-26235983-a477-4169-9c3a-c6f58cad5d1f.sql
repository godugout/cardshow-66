-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Positive for earning, negative for spending
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'earn', 'spend', 'bonus', 'refund')),
  description TEXT NOT NULL,
  reference_id UUID, -- Optional reference to related entity (card, template, etc.)
  reference_type TEXT, -- Type of reference (card_creation, template_purchase, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own credit transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own transactions (for spending)
CREATE POLICY "Users can create their own credit transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add credit balance to profiles
ALTER TABLE public.profiles 
ADD COLUMN credits_balance INTEGER DEFAULT 100; -- Start with 100 free credits

-- Create function to update credit balance
CREATE OR REPLACE FUNCTION update_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's credit balance
  UPDATE public.profiles 
  SET credits_balance = credits_balance + NEW.amount 
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credit balance updates
CREATE TRIGGER update_credit_balance_trigger
  AFTER INSERT ON public.credit_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credit_balance();

-- Create function to check sufficient balance
CREATE OR REPLACE FUNCTION public.has_sufficient_credits(
  _user_id UUID, 
  _amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT credits_balance >= _amount
  FROM public.profiles
  WHERE user_id = _user_id;
$$;

-- Add indexes for performance
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(transaction_type);