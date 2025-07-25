
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CardGrid } from '@/components/cards/CardGrid';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Sparkles } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  rarity: string;
  tags: string[];
  created_at: string;
  design_metadata?: any;
}

export const GeneratedCardsView = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGeneratedCards();
  }, []);

  const fetchGeneratedCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('is_public', true)
        .contains('tags', ['Sports'])
        .order('created_at', { ascending: false })
        .limit(101);

      if (error) throw error;
      // Map data to expected Card interface, making design_metadata optional
      const mappedCards = (data || []).map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        image_url: card.image_url,
        rarity: card.rarity,
        tags: card.tags || [],
        created_at: card.created_at,
        design_metadata: {}
      }));
      setCards(mappedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-12 w-12" />}
        title="No Generated Cards Found"
        description="Use the card generator in the editor to create your first collection of CRDs."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Generated CRD Collection</h2>
        <p className="text-crd-lightGray">
          {cards.length} randomly generated cards with sports themes and player stats
        </p>
      </div>
      
      <CardGrid 
        cards={cards} 
        loading={false}
        viewMode="grid"
      />
    </div>
  );
};
