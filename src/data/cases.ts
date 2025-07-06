import { CardCase } from '@/types/template';

export const CARD_CASES: CardCase[] = [
  {
    id: 'penny-sleeve',
    name: 'Penny Sleeve',
    type: 'penny-sleeve',
    description: 'Basic protection for everyday cards',
    imageUrl: '/cases/penny-sleeve.png',
    unlockRequirement: {
      type: 'default',
      value: 'always'
    }
  },
  {
    id: 'toploader',
    name: 'Top Loader',
    type: 'toploader',
    description: 'Rigid protection for valuable cards',
    imageUrl: '/cases/toploader.png',
    unlockRequirement: {
      type: 'cards-created',
      value: 3
    }
  },
  {
    id: 'magnetic',
    name: 'Magnetic Case',
    type: 'magnetic',
    description: 'Premium magnetic closure case',
    imageUrl: '/cases/magnetic.png',
    unlockRequirement: {
      type: 'cards-created',
      value: 8
    }
  },
  {
    id: 'graded',
    name: 'Graded Slab',
    type: 'graded',
    description: 'Professional grading slab display',
    imageUrl: '/cases/graded.png',
    unlockRequirement: {
      type: 'cards-created',
      value: 15
    }
  },
  {
    id: 'premium',
    name: 'Premium Display',
    type: 'premium',
    description: 'Ultra-premium display case with lighting',
    imageUrl: '/cases/premium.png',
    unlockRequirement: {
      type: 'subscription',
      value: 'creator'
    }
  }
];

export const getAvailableCases = (userProgress: { cardsCreated: number; subscriptionTier: string }) => {
  return CARD_CASES.filter(cardCase => {
    if (!cardCase.unlockRequirement || cardCase.unlockRequirement.type === 'default') {
      return true;
    }
    
    if (cardCase.unlockRequirement.type === 'cards-created') {
      return userProgress.cardsCreated >= (cardCase.unlockRequirement.value as number);
    }
    
    if (cardCase.unlockRequirement.type === 'subscription') {
      const requiredTier = cardCase.unlockRequirement.value;
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