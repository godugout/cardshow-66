import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Card } from '@/types/card';

interface MarketplaceListing {
  id: string;
  card_id: string;
  user_id: string;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
  updated_at: string;
  card?: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    rarity: string;
    tags: string[];
  };
  seller?: {
    username: string;
    display_name: string;
    creator_verified: boolean;
  };
}

export const useMarketplace = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          cards (
            id,
            title,
            description,
            image_url,
            rarity,
            tags
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedListings = data?.map(listing => ({
        ...listing,
        status: listing.status as 'active' | 'sold' | 'cancelled',
        card: listing.cards,
        seller: {
          username: 'creator',
          display_name: 'Creator', 
          creator_verified: false
        }
      })) || [];
      
      setListings(typedListings);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to load marketplace listings');
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (cardId: string, price: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          card_id: cardId,
          user_id: user.id,
          price,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Card listed successfully!"
      });

      fetchListings();
      return data;
    } catch (err) {
      console.error('Error creating listing:', err);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    error,
    fetchListings,
    createListing
  };
};