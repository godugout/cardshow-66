import { Template } from '@/types/template';

export const CRD_TEMPLATES: Template[] = [
  // Default Templates (Always Available)
  {
    id: 'basic-sports',
    name: 'Basic Sports',
    category: 'sports',
    frameUrl: '/frames/basic-sports.png',
    thumbnail: '/thumbnails/basic-sports.jpg',
    description: 'Classic sports card layout perfect for athletes and team photos',
    defaultEffects: {
      holographic: false,
      chrome: false,
      foil: false,
      intensity: 0
    },
    unlockRequirement: {
      type: 'default',
      value: 'always'
    }
  },
  {
    id: 'simple-fantasy',
    name: 'Simple Fantasy',
    category: 'fantasy',
    frameUrl: '/frames/simple-fantasy.png',
    thumbnail: '/thumbnails/simple-fantasy.jpg',
    description: 'Mystical design for fantasy characters and magical themes',
    defaultEffects: {
      holographic: false,
      chrome: false,
      foil: true,
      intensity: 0.3
    },
    unlockRequirement: {
      type: 'default',
      value: 'always'
    }
  },

  // Unlockable Templates (5 cards created)
  {
    id: 'chrome-sports',
    name: 'Chrome Sports',
    category: 'sports',
    frameUrl: '/frames/chrome-sports.png',
    thumbnail: '/thumbnails/chrome-sports.jpg',
    description: 'Premium chrome finish for professional athletes',
    defaultEffects: {
      holographic: false,
      chrome: true,
      foil: false,
      intensity: 0.7
    },
    unlockRequirement: {
      type: 'cards-created',
      value: 5
    }
  },
  {
    id: 'holographic-fantasy',
    name: 'Holographic Fantasy',
    category: 'fantasy',
    frameUrl: '/frames/holographic-fantasy.png',
    thumbnail: '/thumbnails/holographic-fantasy.jpg',
    description: 'Shimmering holographic effects for magical creatures',
    defaultEffects: {
      holographic: true,
      chrome: false,
      foil: true,
      intensity: 0.8
    },
    unlockRequirement: {
      type: 'cards-created',
      value: 5
    }
  },
  {
    id: 'cyber-scifi',
    name: 'Cyber Tech',
    category: 'scifi',
    frameUrl: '/frames/cyber-scifi.png',
    thumbnail: '/thumbnails/cyber-scifi.jpg',
    description: 'Futuristic cyberpunk design with neon accents',
    defaultEffects: {
      holographic: true,
      chrome: false,
      foil: false,
      intensity: 0.6
    },
    unlockRequirement: {
      type: 'cards-created',
      value: 5
    }
  },

  // Advanced Templates (10 cards created)
  {
    id: 'legendary-sports',
    name: 'Legendary Sports',
    category: 'sports',
    frameUrl: '/frames/legendary-sports.png',
    thumbnail: '/thumbnails/legendary-sports.jpg',
    description: 'Elite sports card design with golden accents',
    defaultEffects: {
      holographic: true,
      chrome: true,
      foil: true,
      intensity: 0.9
    },
    unlockRequirement: {
      type: 'cards-created',
      value: 10
    }
  },
  {
    id: 'vintage-classic',
    name: 'Vintage Classic',
    category: 'vintage',
    frameUrl: '/frames/vintage-classic.png',
    thumbnail: '/thumbnails/vintage-classic.jpg',
    description: 'Timeless vintage design with ornate borders',
    defaultEffects: {
      holographic: false,
      chrome: false,
      foil: true,
      intensity: 0.4
    },
    unlockRequirement: {
      type: 'cards-created',
      value: 10
    }
  },

  // Premium Templates (Subscription Only)
  {
    id: 'prismatic-fantasy',
    name: 'Prismatic Fantasy',
    category: 'fantasy',
    frameUrl: '/frames/prismatic-fantasy.png',
    thumbnail: '/thumbnails/prismatic-fantasy.jpg',
    description: 'Ultra-rare prismatic effects with rainbow hues',
    defaultEffects: {
      holographic: true,
      chrome: true,
      foil: true,
      intensity: 1.0
    },
    unlockRequirement: {
      type: 'subscription',
      value: 'creator'
    }
  },
  {
    id: 'quantum-scifi',
    name: 'Quantum Scifi',
    category: 'scifi',
    frameUrl: '/frames/quantum-scifi.png',
    thumbnail: '/thumbnails/quantum-scifi.jpg',
    description: 'Advanced quantum technology theme with particle effects',
    defaultEffects: {
      holographic: true,
      chrome: true,
      foil: false,
      intensity: 0.95
    },
    unlockRequirement: {
      type: 'subscription',
      value: 'creator'
    }
  }
];

export const getAvailableTemplates = (userProgress: { cardsCreated: number; subscriptionTier: string }) => {
  return CRD_TEMPLATES.filter(template => {
    if (!template.unlockRequirement || template.unlockRequirement.type === 'default') {
      return true;
    }
    
    if (template.unlockRequirement.type === 'cards-created') {
      return userProgress.cardsCreated >= (template.unlockRequirement.value as number);
    }
    
    if (template.unlockRequirement.type === 'subscription') {
      const requiredTier = template.unlockRequirement.value;
      const userTier = userProgress.subscriptionTier;
      
      if (requiredTier === 'creator') {
        return userTier === 'creator' || userTier === 'pro';
      }
      if (requiredTier === 'pro') {
        return userTier === 'pro';
      }
    }
    
    return false;
  });
};

export const getTemplatesByCategory = (category: string, userProgress: { cardsCreated: number; subscriptionTier: string }) => {
  const availableTemplates = getAvailableTemplates(userProgress);
  return availableTemplates.filter(template => template.category === category);
};