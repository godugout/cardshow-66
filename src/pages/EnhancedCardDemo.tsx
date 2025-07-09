import React from 'react';
import { EnhancedCardContainer } from '@/components/viewer/EnhancedCardContainer';
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Enhanced Card Design System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of digital card design with separate front/back editing, 
            advanced edge effects, material systems, and interactive lighting.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <EnhancedCardContainer
            card={demoCard}
            width={450}
            height={630}
            allowFlip={true}
            showControls={true}
            initialFrontSide={{
              frameId: 'oakland-as-donruss',
              material: 'standard',
              effects: {
                metallic: 0.2,
                holographic: 0.1,
                chrome: 0,
                crystal: 0,
                vintage: 0.1,
                prismatic: 0,
                interference: 0,
                rainbow: 0,
                particles: false
              },
              lighting: {
                intensity: 0.6,
                direction: { x: 0.4, y: 0.6 },
                color: '#FF6B4A',
                environment: 'studio'
              }
            }}
            initialBackSide={{
              frameId: 'modern-holographic',
              material: 'holographic',
              effects: {
                metallic: 0.1,
                holographic: 0.7,
                chrome: 0,
                crystal: 0.3,
                vintage: 0,
                prismatic: 0.4,
                interference: 0.2,
                rainbow: 0.1,
                particles: true
              },
              lighting: {
                intensity: 0.8,
                direction: { x: 0.3, y: 0.7 },
                color: '#4FFFB0',
                environment: 'cosmic'
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              🎨 Front/Back Design
            </h3>
            <p className="text-muted-foreground text-sm">
              Independent front and back card design with different frames, effects, and materials.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              ✨ Advanced Effects
            </h3>
            <p className="text-muted-foreground text-sm">
              Realistic edge lighting, material-specific treatments, and interactive lighting engine.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              🔧 Design Interface
            </h3>
            <p className="text-muted-foreground text-sm">
              Comprehensive controls for materials, lighting, frames, and effects customization.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-card rounded-lg px-4 py-2 border">
            <span className="text-sm text-muted-foreground">
              🚀 Enhanced Card System v1.0 • Web Technology at Maximum Capability
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}