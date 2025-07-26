import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { AuctionCreateRequest } from '@/types/auction';

interface AuctionListingFormProps {
  cardId: string;
  onSuccess: (auctionId: string) => void;
  onCancel: () => void;
}

export const AuctionListingForm: React.FC<AuctionListingFormProps> = ({
  cardId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    startingPrice: '',
    durationHours: '24',
    buyNowPrice: '',
    enableBuyNow: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationOptions = [
    { label: '1 Day', value: '24' },
    { label: '3 Days', value: '72' },
    { label: '5 Days', value: '120' },
    { label: '7 Days', value: '168' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startingPrice) {
      toast.error('Please enter a starting price');
      return;
    }

    const startingPrice = parseFloat(formData.startingPrice);
    if (startingPrice <= 0) {
      toast.error('Starting price must be greater than $0');
      return;
    }

    const buyNowPrice = formData.enableBuyNow && formData.buyNowPrice 
      ? parseFloat(formData.buyNowPrice) 
      : undefined;

    if (buyNowPrice && buyNowPrice <= startingPrice) {
      toast.error('Buy Now price must be higher than starting price');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: AuctionCreateRequest = {
        cardId,
        startingPrice,
        durationHours: parseInt(formData.durationHours),
        buyNowPrice
      };

      const { data, error } = await supabase.functions.invoke('marketplace-auctions-create', {
        body: requestData
      });

      if (error) throw error;

      toast.success('Auction created successfully!');
      onSuccess(data.auctionId);
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="startingPrice" className="text-sm font-medium text-white">
            Starting Price *
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="startingPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.startingPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: e.target.value }))}
              className="pl-8 bg-crd-surface border-crd-border text-white"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duration" className="text-sm font-medium text-white">
            Auction Duration *
          </Label>
          <Select value={formData.durationHours} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, durationHours: value }))
          }>
            <SelectTrigger className="bg-crd-surface border-crd-border text-white mt-1">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableBuyNow"
              checked={formData.enableBuyNow}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, enableBuyNow: checked === true }))
              }
            />
            <Label htmlFor="enableBuyNow" className="text-sm text-white">
              Enable "Buy It Now" option
            </Label>
          </div>

          {formData.enableBuyNow && (
            <div>
              <Label htmlFor="buyNowPrice" className="text-sm font-medium text-white">
                Buy It Now Price
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="buyNowPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.buyNowPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyNowPrice: e.target.value }))}
                  className="pl-8 bg-crd-surface border-crd-border text-white"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Buyers can purchase immediately at this price, ending the auction
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-crd-orange hover:bg-crd-orange/90"
        >
          {isSubmitting ? 'Creating...' : 'Create Auction'}
        </Button>
      </div>
    </form>
  );
};