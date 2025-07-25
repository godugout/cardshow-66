// Unified CRD Data Service - Single Source of Truth for All Application State
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Core Data Types
export interface CRDUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  experience: number;
  crdTokens: number;
  subscriptionTier: 'free' | 'creator' | 'pro';
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface CRDCard {
  id: string;
  userId: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: string;
  tags: string[];
  frameId?: string;
  effectsData?: Record<string, any>;
  metadata?: Record<string, any>;
  isPublic: boolean;
  forSale: boolean;
  price?: number;
  viewsCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRDCollection {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  cardIds: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Service State
interface CRDDataServiceState {
  // Auth State
  user: User | null;
  session: Session | null;
  profile: CRDUser | null;
  loading: boolean;
  
  // Data Cache
  userCards: Map<string, CRDCard>;
  userCollections: Map<string, CRDCollection>;
  publicCards: Map<string, CRDCard>;
  
  // UI State
  lastError: string | null;
  isOnline: boolean;
}

class CRDDataService {
  private state: CRDDataServiceState = {
    user: null,
    session: null,
    profile: null,
    loading: true,
    userCards: new Map(),
    userCollections: new Map(),
    publicCards: new Map(),
    lastError: null,
    isOnline: navigator.onLine
  };

  private listeners: Set<(state: CRDDataServiceState) => void> = new Set();
  private authInitialized = false;

  constructor() {
    this.initializeAuth();
    this.setupNetworkListener();
  }

  // ========================================
  // CORE STATE MANAGEMENT
  // ========================================

  subscribe(listener: (state: CRDDataServiceState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): Readonly<CRDDataServiceState> {
    return { ...this.state };
  }

  private setState(updates: Partial<CRDDataServiceState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // ========================================
  // AUTHENTICATION MANAGEMENT
  // ========================================

  private async initializeAuth() {
    try {
      console.log('CRDDataService: Initializing auth...');
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('CRDDataService: Auth state changed:', event, !!session);
          this.setState({ session, user: session?.user ?? null });
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('CRDDataService: User signed in, loading profile and data...');
            await this.loadUserProfile(session.user);
            await this.loadUserData();
          } else if (event === 'SIGNED_OUT') {
            console.log('CRDDataService: User signed out, clearing data...');
            this.clearUserData();
          }
          
          // Only set loading to false after all auth-related operations are complete
          if (!this.authInitialized) {
            console.log('CRDDataService: Auth initialization complete');
            this.setState({ loading: false });
            this.authInitialized = true;
          }
        }
      );

      // Check for existing session
      console.log('CRDDataService: Checking for existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('CRDDataService: Found existing session, loading user data...');
        this.setState({ session, user: session.user });
        await this.loadUserProfile(session.user);
        await this.loadUserData();
      } else {
        console.log('CRDDataService: No existing session found');
      }
      
      // Mark auth as initialized and stop loading
      console.log('CRDDataService: Setting loading to false');
      this.setState({ loading: false });
      this.authInitialized = true;

      // Cleanup subscription on unload
      window.addEventListener('beforeunload', () => {
        subscription.unsubscribe();
      });

    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.setState({ loading: false, lastError: 'Authentication initialization failed' });
    }
  }

  private async loadUserProfile(user: User) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (!profile) {
        // Create profile for new users
        await this.createUserProfile(user);
        return;
      }

      const crdUser: CRDUser = {
        id: user.id,
        email: user.email || '',
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        level: profile.level || 1,
        experience: profile.experience || 0,
        crdTokens: profile.credits_balance || 100,
        subscriptionTier: (profile.subscription_tier as 'free' | 'creator' | 'pro') || 'free',
        isVerified: profile.is_verified || false,
        createdAt: new Date(profile.created_at),
        lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
      };

      this.setState({ profile: crdUser });
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.setState({ lastError: 'Failed to load user profile' });
    }
  }

  private async createUserProfile(user: User) {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          credits_balance: 100,
          level: 1,
          experience: 0
        });

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        // Reload the profile
        await this.loadUserProfile(user);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  private clearUserData() {
    this.setState({
      profile: null,
      userCards: new Map(),
      userCollections: new Map()
    });
  }

  // ========================================
  // AUTHENTICATION ACTIONS
  // ========================================

  async signUp(email: string, password: string, username?: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: username || email.split('@')[0],
          }
        }
      });

      if (error) {
        toast.error(`Sign up failed: ${error.message}`);
        return { error };
      }

      toast.success('Check your email for confirmation link');
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      toast.error(message);
      return { error: { message } };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Sign in failed: ${error.message}`);
        return { error };
      }

      toast.success('Signed in successfully');
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      toast.error(message);
      return { error: { message } };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`Sign out failed: ${error.message}`);
      } else {
        toast.success('Signed out successfully');
        this.clearUserData();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed');
    }
  }

  // ========================================
  // DATA MANAGEMENT
  // ========================================

  async loadUserData() {
    if (!this.state.user) return;

    try {
      // Load user's cards
      await this.loadUserCards();
      // Load user's collections
      await this.loadUserCollections();
    } catch (error) {
      console.error('Error loading user data:', error);
      this.setState({ lastError: 'Failed to load user data' });
    }
  }

  async loadUserCards() {
    if (!this.state.user) return;

    try {
      const { data: cards, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', this.state.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user cards:', error);
        return;
      }

      const cardMap = new Map<string, CRDCard>();
      cards?.forEach(card => {
        cardMap.set(card.id, this.transformSupabaseCard(card));
      });

      this.setState({ userCards: cardMap });
    } catch (error) {
      console.error('Error loading user cards:', error);
    }
  }

  async loadUserCollections() {
    if (!this.state.user) return;

    try {
      const { data: collections, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_items(card_id)
        `)
        .eq('user_id', this.state.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading collections:', error);
        return;
      }

      const collectionMap = new Map<string, CRDCollection>();
      collections?.forEach(collection => {
        const cardIds = collection.collection_items?.map((item: any) => item.card_id) || [];
        collectionMap.set(collection.id, {
          id: collection.id,
          userId: collection.user_id,
          title: collection.title,
          description: collection.description,
          cardIds,
          isPublic: collection.is_public,
          createdAt: new Date(collection.created_at),
          updatedAt: new Date(collection.updated_at)
        });
      });

      this.setState({ userCollections: collectionMap });
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  async saveCard(cardData: Omit<CRDCard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'likeCount'>): Promise<CRDCard | null> {
    if (!this.state.user) {
      toast.error('Must be signed in to save cards');
      return null;
    }

    try {
      const { data: card, error } = await supabase
        .from('cards')
        .insert({
          user_id: this.state.user.id,
          title: cardData.title,
          description: cardData.description,
          image_url: cardData.imageUrl,
          thumbnail_url: cardData.thumbnailUrl,
          rarity: cardData.rarity,
          category: cardData.category,
          tags: cardData.tags,
          is_public: cardData.isPublic,
          for_sale: cardData.forSale,
          price: cardData.price
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving card:', error);
        toast.error('Failed to save card');
        return null;
      }

      const newCard = this.transformSupabaseCard(card);
      
      // Update local cache
      const updatedCards = new Map(this.state.userCards);
      updatedCards.set(newCard.id, newCard);
      this.setState({ userCards: updatedCards });

      toast.success('Card saved successfully');
      return newCard;
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
      return null;
    }
  }

  private transformSupabaseCard(supabaseCard: any): CRDCard {
    return {
      id: supabaseCard.id,
      userId: supabaseCard.user_id,
      title: supabaseCard.title,
      description: supabaseCard.description,
      imageUrl: supabaseCard.image_url,
      thumbnailUrl: supabaseCard.thumbnail_url,
      rarity: supabaseCard.rarity || 'common',
      category: supabaseCard.category,
      tags: supabaseCard.tags || [],
      frameId: supabaseCard.frame_data?.frameId,
      effectsData: supabaseCard.effects_data,
      metadata: supabaseCard.activity_data,
      isPublic: supabaseCard.is_public || false,
      forSale: supabaseCard.for_sale || false,
      price: supabaseCard.price,
      viewsCount: supabaseCard.views_count || 0,
      likeCount: supabaseCard.like_count || 0,
      createdAt: new Date(supabaseCard.created_at),
      updatedAt: new Date(supabaseCard.updated_at)
    };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private setupNetworkListener() {
    window.addEventListener('online', () => {
      this.setState({ isOnline: true });
      if (this.state.user) {
        this.loadUserData(); // Refresh data when back online
      }
    });

    window.addEventListener('offline', () => {
      this.setState({ isOnline: false });
    });
  }

  // Getters for convenience
  get isAuthenticated(): boolean {
    return !!this.state.user;
  }

  get currentUser(): CRDUser | null {
    return this.state.profile;
  }

  get userCards(): CRDCard[] {
    return Array.from(this.state.userCards.values());
  }

  get userCollections(): CRDCollection[] {
    return Array.from(this.state.userCollections.values());
  }

  clearError() {
    this.setState({ lastError: null });
  }
}

// Create singleton instance
export const crdDataService = new CRDDataService();

// React Hook for easy integration
export function useCRDData() {
  const [state, setState] = React.useState(() => crdDataService.getState());

  React.useEffect(() => {
    const unsubscribe = crdDataService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    // Auth state
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: crdDataService.isAuthenticated,
    
    // Data
    userCards: crdDataService.userCards,
    userCollections: crdDataService.userCollections,
    
    // Status
    isOnline: state.isOnline,
    lastError: state.lastError,
    
    // Actions
    signUp: crdDataService.signUp.bind(crdDataService),
    signIn: crdDataService.signIn.bind(crdDataService),
    signOut: crdDataService.signOut.bind(crdDataService),
    saveCard: crdDataService.saveCard.bind(crdDataService),
    reloadData: crdDataService.loadUserData.bind(crdDataService),
    clearError: crdDataService.clearError.bind(crdDataService)
  };
}

// Re-export for convenience
export default crdDataService;