import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TradingRoom } from '@/components/trading/TradingRoom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TradingRoom as TradingRoomType, Trade } from '@/types/trading';

export const Trading: React.FC = () => {
  const [tradingRooms, setTradingRooms] = useState<TradingRoomType[]>([]);
  const [myTrades, setMyTrades] = useState<Trade[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<TradingRoomType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState<'public' | 'private'>('public');
  const { toast } = useToast();

  useEffect(() => {
    loadTradingRooms();
    loadMyTrades();
  }, []);

  const loadTradingRooms = async () => {
    const { data, error } = await supabase
      .from('trading_rooms')
      .select(`
        *,
        trading_room_participants!inner(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trading rooms:', error);
      return;
    }

    // Transform the data to include participant count
    const roomsWithCounts = data?.map(room => ({
      ...room,
      participant_count: room.trading_room_participants?.length || 0
    })) || [];

    setTradingRooms(roomsWithCounts as TradingRoomType[]);
  };

  const loadMyTrades = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        trade_items(*)
      `)
      .or(`creator_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trades:', error);
      return;
    }

    setMyTrades((data || []) as Trade[]);
  };

  const createTradingRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for your trading room",
        variant: "destructive"
      });
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    try {
      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('trading_rooms')
        .insert({
          name: newRoomName,
          description: newRoomDescription,
          room_type: newRoomType,
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('trading_room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: 'owner'
        });

      if (participantError) throw participantError;

      toast({
        title: "Room created",
        description: "Your trading room has been created successfully"
      });

      setShowCreateRoom(false);
      setNewRoomName('');
      setNewRoomDescription('');
      loadTradingRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error creating room",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const joinTradingRoom = async (roomId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trading_room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      const room = tradingRooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoom(room);
      }

      toast({
        title: "Joined room",
        description: "You have joined the trading room"
      });
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error joining room",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const filteredRooms = tradingRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedRoom) {
    return (
      <TradingRoom 
        room={selectedRoom} 
        onLeaveRoom={() => setSelectedRoom(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Hub</h1>
          <p className="text-muted-foreground">
            Trade cards with other collectors in real-time
          </p>
        </div>
        <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Trading Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Room Name
                </label>
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description (Optional)
                </label>
                <Input
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Describe your trading room..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Room Type
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant={newRoomType === 'public' ? 'default' : 'outline'}
                    onClick={() => setNewRoomType('public')}
                    className="flex-1"
                  >
                    Public
                  </Button>
                  <Button
                    variant={newRoomType === 'private' ? 'default' : 'outline'}
                    onClick={() => setNewRoomType('private')}
                    className="flex-1"
                  >
                    Private
                  </Button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                  Cancel
                </Button>
                <Button onClick={createTradingRoom}>
                  Create Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rooms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rooms">Trading Rooms</TabsTrigger>
          <TabsTrigger value="trades">My Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search trading rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Trading Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {room.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={room.room_type === 'public' ? 'default' : 'secondary'}>
                      {room.room_type}
                    </Badge>
                    {room.room_type === 'private' && (
                      <Shield className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{room.participant_count || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{new Date(room.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => joinTradingRoom(room.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Trading Rooms Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Create the first trading room to get started'}
              </p>
              <Button onClick={() => setShowCreateRoom(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Trading Room
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          {/* My Trades */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">My Trades</h2>
            
            {myTrades.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Trades Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join a trading room to start making trade offers
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTrades.map((trade) => (
                  <Card key={trade.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{trade.status}</Badge>
                          <Badge variant="secondary">{trade.trade_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(trade.created_at).toLocaleDateString()}
                        </p>
                        {trade.message && (
                          <p className="text-sm text-foreground mt-2">{trade.message}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};