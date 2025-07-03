import { cardRepository, collectionRepository } from '@/lib/storage';
import type { Card } from '@/lib/storage/repositories/CardRepository';
import type { Collection } from '@/lib/storage/repositories/CollectionRepository';

// Sample card data with placeholder images
const sampleCards: Omit<Card, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    title: "Lightning Strike",
    description: "A powerful electric attack that can stun opponents",
    image_url: "https://images.unsplash.com/photo-1519030945084-23b19c4ead64?w=400&h=600&fit=crop",
    metadata: {
      rarity: "rare",
      element: "electric",
      attack: 85,
      defense: 40,
      speed: 90
    }
  },
  {
    title: "Forest Guardian",
    description: "Ancient protector of the woodland realm",
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
    metadata: {
      rarity: "epic",
      element: "nature",
      attack: 70,
      defense: 95,
      speed: 50
    }
  },
  {
    title: "Cosmic Voyager",
    description: "Explorer of distant galaxies and unknown worlds",
    image_url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop",
    metadata: {
      rarity: "legendary",
      element: "cosmic",
      attack: 100,
      defense: 80,
      speed: 75
    }
  },
  {
    title: "Crystal Mage",
    description: "Master of crystalline magic and gem manipulation",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
    metadata: {
      rarity: "epic",
      element: "crystal",
      attack: 90,
      defense: 60,
      speed: 70
    }
  },
  {
    title: "Shadow Warrior",
    description: "Silent assassin who strikes from the darkness",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    metadata: {
      rarity: "rare",
      element: "shadow",
      attack: 95,
      defense: 45,
      speed: 100
    }
  },
  {
    title: "Ocean Spirit",
    description: "Mystical being that commands the power of the seas",
    image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=600&fit=crop",
    metadata: {
      rarity: "epic",
      element: "water",
      attack: 75,
      defense: 85,
      speed: 65
    }
  }
];

// Sample collections
const sampleCollections: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'card_count'>[] = [
  {
    name: "Elemental Masters",
    description: "Powerful beings who command the forces of nature",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    is_public: true
  },
  {
    name: "Cosmic Warriors",
    description: "Elite fighters from across the galaxy",
    image_url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
    is_public: true
  }
];

export const generateSampleData = async (userId?: string) => {
  try {
    console.log('Generating sample data...');
    
    // Create collections first
    const createdCollections = [];
    for (const collectionData of sampleCollections) {
      const collection = await collectionRepository.create({
        ...collectionData,
        user_id: userId
      });
      createdCollections.push(collection);
      console.log('Created collection:', collection.name);
    }

    // Create cards and assign them to collections
    const createdCards = [];
    for (let i = 0; i < sampleCards.length; i++) {
      const cardData = sampleCards[i];
      const collectionIndex = i < 3 ? 0 : 1; // First 3 cards go to first collection, rest to second
      
      const card = await cardRepository.create({
        ...cardData,
        collection_id: createdCollections[collectionIndex].id,
        user_id: userId
      });
      createdCards.push(card);
      console.log('Created card:', card.title);
    }

    // Update collection card counts
    for (const collection of createdCollections) {
      await collectionRepository.updateCardCount(collection.id);
    }

    console.log('Sample data generation complete!');
    return {
      collections: createdCollections,
      cards: createdCards
    };
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
};

export const getSampleCard = (): import('@/hooks/studio/useStudioState').CardData => {
  return {
    id: 'sample-card-1',
    title: "Lightning Strike",
    description: "A powerful electric attack that can stun opponents",
    rarity: "rare",
    tags: ["electric", "attack", "powerful"],
    image_url: "https://images.unsplash.com/photo-1519030945084-23b19c4ead64?w=400&h=600&fit=crop",
    design_metadata: {
      element: "electric",
      attack: 85,
      defense: 40,
      speed: 90
    },
    visibility: "public",
    is_public: true,
    creator_attribution: {
      collaboration_type: "solo"
    },
    publishing_options: {
      marketplace_listing: false,
      crd_catalog_inclusion: true,
      print_available: false,
      pricing: {
        currency: "USD"
      },
      distribution: {
        limited_edition: false
      }
    }
  };
};