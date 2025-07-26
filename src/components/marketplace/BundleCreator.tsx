import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Package, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { AvailableCard, BundleDetails, BundleCreateRequest } from '@/types/bundle';

export const BundleCreator: React.FC = () => {
  const [availableCards, setAvailableCards] = useState<AvailableCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<AvailableCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<AvailableCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bundleDetails, setBundleDetails] = useState<BundleDetails>({
    title: '',
    description: '',
    price: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const MAX_CARDS = 20;

  // Fetch creator's available cards
  useEffect(() => {
    const fetchAvailableCards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cards, error } = await supabase
          .from('cards')
          .select('id, title, image_url, thumbnail_url, rarity, category, tags, is_public, for_sale, bundle_id')
          .eq('user_id', user.id)
          .eq('for_sale', false)
          .is('bundle_id', null)
          .eq('is_public', true);

        if (error) throw error;

        setAvailableCards(cards || []);
        setFilteredCards(cards || []);
      } catch (error) {
        console.error('Error fetching cards:', error);
        toast.error('Failed to load your cards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableCards();
  }, []);

  // Filter cards based on search term
  useEffect(() => {
    const filtered = availableCards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCards(filtered);
  }, [searchTerm, availableCards]);

  const handleCardSelection = (card: AvailableCard, isSelected: boolean) => {
    if (isSelected && selectedCards.length >= MAX_CARDS) {
      toast.error(`You can only select up to ${MAX_CARDS} cards per bundle`);
      return;
    }

    if (isSelected) {
      setSelectedCards(prev => [...prev, card]);
    } else {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    }
  };

  const removeSelectedCard = (cardId: string) => {
    setSelectedCards(prev => prev.filter(c => c.id !== cardId));
  };

  const handleBundleDetailsChange = (field: keyof BundleDetails, value: string | number) => {
    setBundleDetails(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      selectedCards.length >= 2 &&
      bundleDetails.title.trim() !== '' &&
      bundleDetails.price > 0
    );
  };

  const handleCreateBundle = async () => {
    if (!isFormValid()) return;

    setIsCreating(true);

    try {
      const requestData: BundleCreateRequest = {
        title: bundleDetails.title.trim(),
        description: bundleDetails.description.trim() || undefined,
        price: bundleDetails.price,
        cardIds: selectedCards.map(card => card.id)
      };

      const { data, error } = await supabase.functions.invoke('marketplace-bundles-create', {
        body: requestData
      });

      if (error) throw error;

      toast.success('Bundle created successfully!');
      
      // Reset form
      setSelectedCards([]);
      setBundleDetails({ title: '', description: '', price: 0 });
      
      // Refresh available cards
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: cards } = await supabase
          .from('cards')
          .select('id, title, image_url, thumbnail_url, rarity, category, tags, is_public, for_sale, bundle_id')
          .eq('user_id', user.id)
          .eq('for_sale', false)
          .is('bundle_id', null)
          .eq('is_public', true);
        
        setAvailableCards(cards || []);
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Failed to create bundle. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-crd-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading your cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-crd-black">
      {/* Left Panel - Card Selection */}
      <div className="w-1/2 border-r border-crd-border flex flex-col">
        <div className="p-6 border-b border-crd-border">
          <h2 className="text-xl font-bold text-white mb-4">Select Cards for Bundle</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-crd-surface border-crd-border text-white"
            />
          </div>

          {/* Counter */}
          <p className="text-sm text-muted-foreground">
            {selectedCards.length} / {MAX_CARDS} cards selected
          </p>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-white">No available cards found</p>
              <p className="text-sm text-muted-foreground">
                Create some cards or make them public to include in bundles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredCards.map((card) => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <Card
                    key={card.id}
                    className={`bg-crd-surface border-crd-border cursor-pointer transition-all hover:border-crd-orange/50 ${
                      isSelected ? 'border-crd-orange' : ''
                    }`}
                    onClick={() => handleCardSelection(card, !isSelected)}
                  >
                    <CardContent className="p-3">
                      <div className="relative">
                        <div className="aspect-[2.5/3.5] bg-crd-black rounded-lg mb-2 overflow-hidden">
                          {card.image_url || card.thumbnail_url ? (
                            <img
                              src={card.image_url || card.thumbnail_url}
                              alt={card.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={isSelected}
                          className="absolute top-2 right-2 bg-white"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => handleCardSelection(card, checked === true)}
                        />
                      </div>
                      <h3 className="text-white text-sm font-medium truncate">{card.title}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {card.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Cards Summary */}
        {selectedCards.length > 0 && (
          <div className="border-t border-crd-border p-4">
            <h3 className="text-white font-medium mb-2">Selected Cards</h3>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {selectedCards.map((card) => (
                <div key={card.id} className="flex items-center gap-1 bg-crd-orange/20 text-crd-orange px-2 py-1 rounded text-xs">
                  <span className="truncate max-w-20">{card.title}</span>
                  <button
                    onClick={() => removeSelectedCard(card.id)}
                    className="hover:bg-crd-orange/30 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Bundle Details */}
      <div className="w-1/2 flex flex-col">
        <div className="p-6 border-b border-crd-border">
          <h2 className="text-xl font-bold text-white">Bundle Details</h2>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Bundle Preview */}
          {selectedCards.length > 0 && (
            <Card className="bg-crd-surface border-crd-border">
              <CardHeader>
                <CardTitle className="text-white text-sm">Bundle Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {selectedCards.slice(0, 8).map((card) => (
                    <div key={card.id} className="aspect-[2.5/3.5] bg-crd-black rounded overflow-hidden">
                      {card.image_url || card.thumbnail_url ? (
                        <img
                          src={card.image_url || card.thumbnail_url}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedCards.length > 8 && (
                    <div className="aspect-[2.5/3.5] bg-crd-surface rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{selectedCards.length - 8} more
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Bundle Title *</Label>
              <Input
                id="title"
                value={bundleDetails.title}
                onChange={(e) => handleBundleDetailsChange('title', e.target.value)}
                placeholder="Enter bundle title..."
                className="bg-crd-surface border-crd-border text-white mt-1"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={bundleDetails.description}
                onChange={(e) => handleBundleDetailsChange('description', e.target.value)}
                placeholder="Describe your bundle..."
                className="bg-crd-surface border-crd-border text-white mt-1 min-h-20"
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="price" className="text-white">Bundle Price *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={bundleDetails.price || ''}
                  onChange={(e) => handleBundleDetailsChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-8 bg-crd-surface border-crd-border text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-crd-border p-6">
          <Button
            onClick={handleCreateBundle}
            disabled={!isFormValid() || isCreating}
            className="w-full bg-crd-orange hover:bg-crd-orange/90 text-white font-semibold py-3"
          >
            {isCreating ? 'Creating Bundle...' : 'List Bundle for Sale'}
          </Button>
          
          {!isFormValid() && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {selectedCards.length < 2
                ? 'Select at least 2 cards'
                : !bundleDetails.title.trim()
                ? 'Enter a bundle title'
                : bundleDetails.price <= 0
                ? 'Set a valid price'
                : ''
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};