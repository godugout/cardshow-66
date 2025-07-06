export interface Template {
  id: string;
  name: string;
  category: 'sports' | 'fantasy' | 'scifi' | 'vintage';
  frameUrl: string;
  thumbnail: string;
  description: string;
  defaultEffects: Partial<CardEffects>;
  unlockRequirement?: UnlockRequirement;
}

export interface UnlockRequirement {
  type: 'cards-created' | 'default' | 'subscription';
  value: number | 'always' | 'creator' | 'pro';
}

export interface CardEffects {
  holographic: boolean;
  chrome: boolean;
  foil: boolean;
  intensity: number; // 0-1
}

export interface CardCase {
  id: string;
  name: string;
  type: 'penny-sleeve' | 'toploader' | 'magnetic' | 'graded' | 'premium';
  description: string;
  imageUrl: string;
  unlockRequirement: UnlockRequirement;
}

export interface UserProgress {
  cardsCreated: number;
  casesUnlocked: string[];
  templatesUnlocked: string[];
  subscriptionTier: 'free' | 'creator' | 'pro';
}