import React from 'react';
import { CardCreatorLayout } from '@/components/crdmkr/CardCreatorLayout';
import type { CardData } from '@/types/card';

const demoCard: CardData = {
  id: '1',
  title: 'Your Card Title',
  description: 'Upload an image to create your digital collectible',
  image_url: null, // No image by default - shows card back with CRD logo
  rarity: 'legendary',
  tags: ['digital', 'collectible', 'card'],
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