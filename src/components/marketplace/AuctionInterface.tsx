import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Clock, Users, Gavel } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format, isAfter } from 'date-fns';
import type { Auction, AuctionBid, AuctionRealtimeUpdate } from '@/types/auction';

interface AuctionInterfaceProps {
  auctionId: string;
}

export const AuctionInterface: React.FC<AuctionInterfaceProps> = ({ auctionId }) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidHistory, setBidHistory] = useState<AuctionBid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEnded, setIsEnded] = useState(false);

  // Fetch auction details
  const fetchAuctionDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('marketplace-auctions-get', {
        body: { auctionId }
      });

      if (error) throw error;

      setAuction(data.auction);
      setBidHistory(data.bidHistory || []);
      
      // Check if auction has ended
      const endTime = new Date(data.auction.auction_end_time);
      setIsEnded(isAfter(new Date(), endTime));
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Failed to load auction details');
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  // Update countdown timer
  useEffect(() => {
    if (!auction?.auction_end_time) return;

    const updateTimer = () => {
      const endTime = new Date(auction.auction_end_time);
      const now = new Date();
      
      if (isAfter(now, endTime)) {
        setTimeLeft('Ended');
        setIsEnded(true);
        return;
      }

      setTimeLeft(formatDistanceToNow(endTime, { addSuffix: false }));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction?.auction_end_time]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`auction:${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_bids',
          filter: `auction_id=eq.${auctionId}`
        },
        (payload) => {
          console.log('Real-time bid update:', payload);
          // Refetch auction details when new bid is placed
          fetchAuctionDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId, fetchAuctionDetails]);

  // Initial load
  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount) return;

    const amount = parseFloat(bidAmount);
    
    if (amount <= auction.current_bid) {
      toast.error(`Bid must be higher than current bid of $${auction.current_bid.toFixed(2)}`);
      return;
    }

    setIsPlacingBid(true);

    try {
      const { error } = await supabase.functions.invoke('marketplace-auctions-bid', {
        body: {
          auctionId,
          amount
        }
      });

      if (error) throw error;

      toast.success('Bid placed successfully!');
      setBidAmount('');
      
      // Refresh auction data
      await fetchAuctionDetails();
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleBuyNow = async () => {
    if (!auction?.buy_now_price) return;

    try {
      const { error } = await supabase.functions.invoke('marketplace-auctions-buy-now', {
        body: { auctionId }
      });

      if (error) throw error;

      toast.success('Purchase completed! Auction ended.');
      await fetchAuctionDetails();
    } catch (error) {
      console.error('Error buying now:', error);
      toast.error('Failed to complete purchase. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-crd-surface rounded-lg"></div>
        <div className="h-24 bg-crd-surface rounded-lg"></div>
        <div className="h-16 bg-crd-surface rounded-lg"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <Card className="bg-crd-surface border-crd-border">
        <CardContent className="p-6 text-center">
          <p className="text-white">Auction not found</p>
        </CardContent>
      </Card>
    );
  }

  const minBidAmount = auction.current_bid + 0.01;
  const canBid = !isEnded && auction.status === 'active';

  return (
    <div className="space-y-6">
      {/* Auction Header */}
      <Card className="bg-crd-surface border-crd-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gavel className="h-5 w-5 text-crd-orange" />
            Live Auction
            {isEnded && <span className="text-red-400 text-sm">(Ended)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Countdown Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-crd-orange" />
              <span className="text-sm text-muted-foreground">Time Left</span>
            </div>
            <div className={`text-2xl font-bold ${isEnded ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}
            </div>
          </div>

          {/* Current Bid Info */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Current Bid</div>
              <div className="text-xl font-bold text-crd-green">
                ${auction.current_bid.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-4 w-4" />
                Bids
              </div>
              <div className="text-xl font-bold text-white">
                {auction.bid_count}
              </div>
            </div>
          </div>

          {/* Buy Now Option */}
          {auction.buy_now_price && canBid && (
            <div className="text-center pt-4 border-t border-crd-border">
              <Button
                onClick={handleBuyNow}
                className="bg-crd-green hover:bg-crd-green/90 text-white font-semibold"
              >
                Buy It Now - ${auction.buy_now_price.toFixed(2)}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Purchase immediately and end the auction
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bidding Form */}
      {canBid && (
        <Card className="bg-crd-surface border-crd-border">
          <CardHeader>
            <CardTitle className="text-white">Place Your Bid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min={minBidAmount}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min: ${minBidAmount.toFixed(2)}`}
                    className="pl-8 bg-crd-black border-crd-border text-white"
                    disabled={isPlacingBid}
                  />
                </div>
                <Button
                  onClick={handlePlaceBid}
                  disabled={isPlacingBid || !bidAmount || parseFloat(bidAmount) <= auction.current_bid}
                  className="bg-crd-orange hover:bg-crd-orange/90 text-white px-6"
                >
                  {isPlacingBid ? 'Placing...' : 'Place Bid'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum bid: ${minBidAmount.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid History */}
      <Collapsible open={showBidHistory} onOpenChange={setShowBidHistory}>
        <CollapsibleTrigger asChild>
          <Card className="bg-crd-surface border-crd-border cursor-pointer hover:bg-crd-surface/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Bid History ({bidHistory.length})</span>
                <ChevronDown className={`h-4 w-4 text-white transition-transform ${showBidHistory ? 'rotate-180' : ''}`} />
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="bg-crd-surface border-crd-border mt-2">
            <CardContent className="p-4">
              {bidHistory.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bidHistory.map((bid, index) => (
                    <div key={bid.id} className="flex justify-between items-center py-2 border-b border-crd-border last:border-b-0">
                      <div>
                        <span className="text-white font-medium">
                          {bid.bidder_display_name || `Bidder #${bidHistory.length - index}`}
                        </span>
                        {bid.is_winning_bid && (
                          <span className="ml-2 px-2 py-1 bg-crd-green/20 text-crd-green text-xs rounded">
                            Winning
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">${bid.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(bid.created_at), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No bids yet</p>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};