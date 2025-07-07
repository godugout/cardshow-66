import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Minus, 
  Search, 
  ArrowRight, 
  Coins, 
  Calendar,
  X,
  Check
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TradeOffer } from '@/types/trading';

interface TradeOfferBuilderProps {
  onClose: () => void;
  recipientId?: string;
}

export const TradeOfferBuilder: React.FC<TradeOfferBuilderProps> = ({ 
  onClose, 
  recipientId 
}) => {
  const [userCards, setUserCards] = useState<any[]>([]);
  const [selectedOfferedCards, setSelectedOfferedCards] = useState<string[]>([]);
  const [selectedRequestedCards, setSelectedRequestedCards] = useState<string[]>([]);
  const [offeredCredits, setOfferedCredits] = useState(0);
  const [requestedCredits, setRequestedCredits] = useState(0);
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'offering' | 'requesting'>('offering');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserCards();
  }, []);

  const loadUserCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading cards:', error);
      return;
    }

    setUserCards(data || []);
  };

  const filteredCards = userCards.filter(card =>
    card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCardSelection = (cardId: string, section: 'offering' | 'requesting') => {
    if (section === 'offering') {
      setSelectedOfferedCards(prev =>
        prev.includes(cardId)
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    } else {
      setSelectedRequestedCards(prev =>
        prev.includes(cardId)
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    }
  };

  const getSelectedCards = (section: 'offering' | 'requesting') => {
    const selectedIds = section === 'offering' ? selectedOfferedCards : selectedRequestedCards;
    return userCards.filter(card => selectedIds.includes(card.id));
  };

  const createTradeOffer = async () => {
    if (selectedOfferedCards.length === 0 && offeredCredits === 0) {
      toast({
        title: "Nothing to offer",
        description: "Please add cards or credits to your offer",
        variant: "destructive"
      });
      return;
    }

    if (selectedRequestedCards.length === 0 && requestedCredits === 0) {
      toast({
        title: "Nothing requested",
        description: "Please specify what you want in return",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the trade
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          creator_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: recipientId,
          message,
          expires_at: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString(),
          trade_type: 'card_for_card'
        })
        .select()
        .single();

      if (tradeError) throw tradeError;

      // Add offered items
      const offeredItems = [
        ...selectedOfferedCards.map(cardId => ({
          trade_id: trade.id,
          card_id: cardId,
          owner_type: 'creator' as const,
          quantity: 1,
          credits_value: 0,
          cash_value: 0
        })),
        ...(offeredCredits > 0 ? [{
          trade_id: trade.id,
          owner_type: 'creator' as const,
          quantity: 1,
          credits_value: offeredCredits,
          cash_value: 0
        }] : [])
      ];

      // Add requested items
      const requestedItems = [
        ...selectedRequestedCards.map(cardId => ({
          trade_id: trade.id,
          card_id: cardId,
          owner_type: 'recipient' as const,
          quantity: 1,
          credits_value: 0,
          cash_value: 0
        })),
        ...(requestedCredits > 0 ? [{
          trade_id: trade.id,
          owner_type: 'recipient' as const,
          quantity: 1,
          credits_value: requestedCredits,
          cash_value: 0
        }] : [])
      ];

      if (offeredItems.length > 0) {
        const { error: offeredError } = await supabase
          .from('trade_items')
          .insert(offeredItems);
        if (offeredError) throw offeredError;
      }

      if (requestedItems.length > 0) {
        const { error: requestedError } = await supabase
          .from('trade_items')
          .insert(requestedItems);
        if (requestedError) throw requestedError;
      }

      toast({
        title: "Trade offer created",
        description: "Your trade offer has been sent successfully"
      });

      onClose();
    } catch (error) {
      console.error('Error creating trade:', error);
      toast({
        title: "Error creating trade",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Offering Section */}
        <Card className="p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            You're Offering
          </h3>
          <div className="space-y-2">
            {getSelectedCards('offering').map(card => (
              <div key={card.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{card.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardSelection(card.id, 'offering')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {offeredCredits > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{offeredCredits} Credits</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOfferedCredits(0)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {selectedOfferedCards.length === 0 && offeredCredits === 0 && (
              <p className="text-sm text-muted-foreground">Nothing selected</p>
            )}
          </div>
        </Card>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>

        {/* Requesting Section */}
        <Card className="p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            You're Requesting
          </h3>
          <div className="space-y-2">
            {getSelectedCards('requesting').map(card => (
              <div key={card.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{card.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardSelection(card.id, 'requesting')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {requestedCredits > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{requestedCredits} Credits</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRequestedCredits(0)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {selectedRequestedCards.length === 0 && requestedCredits === 0 && (
              <p className="text-sm text-muted-foreground">Nothing selected</p>
            )}
          </div>
        </Card>
      </div>

      <Separator />

      {/* Section Toggle */}
      <div className="flex items-center space-x-2">
        <Button
          variant={activeSection === 'offering' ? 'default' : 'outline'}
          onClick={() => setActiveSection('offering')}
        >
          Add to Offer
        </Button>
        <Button
          variant={activeSection === 'requesting' ? 'default' : 'outline'}
          onClick={() => setActiveSection('requesting')}
        >
          Add to Request
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
        {filteredCards.map(card => {
          const isSelected = activeSection === 'offering' 
            ? selectedOfferedCards.includes(card.id)
            : selectedRequestedCards.includes(card.id);

          return (
            <Card 
              key={card.id} 
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => toggleCardSelection(card.id, activeSection)}
            >
              <div className="aspect-[2.5/3.5] relative">
                {card.image_url && (
                  <img 
                    src={card.image_url} 
                    alt={card.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {card.title}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {card.rarity || 'common'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Credits Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Offer Credits
          </label>
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={offeredCredits}
              onChange={(e) => setOfferedCredits(Number(e.target.value))}
              min="0"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Request Credits
          </label>
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={requestedCredits}
              onChange={(e) => setRequestedCredits(Number(e.target.value))}
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Message (Optional)
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message to your trade offer..."
          rows={3}
        />
      </div>

      {/* Expiration */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Expires In
        </label>
        <Select value={expiresIn.toString()} onValueChange={(value) => setExpiresIn(Number(value))}>
          <SelectTrigger>
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 day</SelectItem>
            <SelectItem value="3">3 days</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={createTradeOffer} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Send Trade Offer'}
        </Button>
      </div>
    </div>
  );
};