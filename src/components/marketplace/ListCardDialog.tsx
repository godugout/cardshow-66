import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Tag, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ListCardDialogProps {
  card: {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    rarity?: string;
    creator_name?: string;
  };
  onSuccess?: () => void;
  children: React.ReactNode;
}

export const ListCardDialog: React.FC<ListCardDialogProps> = ({
  card,
  onSuccess,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isListing, setIsListing] = useState(false);

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsListing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to list cards');
        return;
      }

      // Create marketplace listing
      const { error: listingError } = await supabase
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          card_id: card.id,
          price: parseFloat(price),
          status: 'active'
        });

      if (listingError) throw listingError;

      // Update card for_sale status
      const { error: cardError } = await supabase
        .from('cards')
        .update({ 
          for_sale: true,
          price: parseFloat(price)
        })
        .eq('id', card.id);

      if (cardError) throw cardError;

      toast.success('Card listed successfully!');
      setOpen(false);
      setPrice('');
      setDescription('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to list card');
    } finally {
      setIsListing(false);
    }
  };

  const rarityColors = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            List Card for Sale
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Card Preview</h3>
            <Card>
              <CardContent className="p-4">
                {card.image_url && (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{card.title}</h4>
                  {card.creator_name && (
                    <p className="text-sm text-muted-foreground">
                      by {card.creator_name}
                    </p>
                  )}
                  {card.rarity && (
                    <Badge 
                      variant="secondary" 
                      className={`${rarityColors[card.rarity as keyof typeof rarityColors]} text-white`}
                    >
                      {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                    </Badge>
                  )}
                  {card.description && (
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listing Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Listing Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details about this card..."
                rows={3}
              />
            </div>

            {/* Marketplace Tips */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Listing Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Research similar cards to price competitively</li>
                <li>• High-quality images increase sales</li>
                <li>• Detailed descriptions build buyer confidence</li>
                <li>• You can edit or remove listings anytime</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleList}
                disabled={isListing || !price}
                className="flex-1"
              >
                {isListing ? 'Listing...' : 'List for Sale'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isListing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};