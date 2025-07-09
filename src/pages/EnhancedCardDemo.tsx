import React from 'react';
import { CardCreatorLayout } from '@/components/crdmkr/CardCreatorLayout';
import type { CardData } from '@/types/card';

const demoCard: CardData = {
  id: '1',
  title: 'Oakland Athletics Legend',
  description: 'A legendary player from the golden era',
  image_url: '/lovable-uploads/7697ffa5-ac9b-428b-9bc0-35500bcb2286.png',
  rarity: 'legendary',
  tags: ['athletics', 'legend', 'oakland'],
  creator_id: 'demo-creator',
  creator_name: 'CardShow',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  visibility: 'public',
  is_public: true,
  creator_attribution: {
    creator_name: 'CardShow',
    creator_id: 'demo-creator',
    collaboration_type: 'solo'
  },
  publishing_options: {
    marketplace_listing: true,
    crd_catalog_inclusion: true,
    print_available: false
  },
  design_metadata: {}
};

export default function EnhancedCardDemo() {
  return <CardCreatorLayout card={demoCard} />;
}