import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Crown,
  Shield,
  User,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TradeOfferBuilder } from './TradeOfferBuilder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TradingRoom as TradingRoomType, TradingRoomParticipant } from '@/types/trading';

interface TradingRoomProps {
  room: TradingRoomType;
  onLeaveRoom?: () => void;
}

export const TradingRoom: React.FC<TradingRoomProps> = ({ room, onLeaveRoom }) => {
  const [participants, setParticipants] = useState<TradingRoomParticipant[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'trades' | 'participants'>('chat');
  const [showTradeBuilder, setShowTradeBuilder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadParticipants();
    loadMessages();
    
    // Subscribe to real-time updates
    const messagesSubscription = supabase
      .channel(`room-${room.id}-messages`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trading_room_messages'
      }, () => {
        loadMessages();
      })
      .subscribe();

    const participantsSubscription = supabase
      .channel(`room-${room.id}-participants`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trading_room_participants'
      }, () => {
        loadParticipants();
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      participantsSubscription.unsubscribe();
    };
  }, [room.id]);

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from('trading_room_participants')
      .select('*')
      .eq('room_id', room.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error loading participants:', error);
      return;
    }

    setParticipants((data || []) as TradingRoomParticipant[]);
  };

  const loadMessages = async () => {
    // For now, we'll use a placeholder since we haven't created the messages table
    // In a real implementation, you'd query trading_room_messages
    setMessages([
      {
        id: '1',
        user: { username: 'CardTrader123', avatar_url: null },
        message: 'Looking for vintage sports cards!',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user: { username: 'Collector_Pro', avatar_url: null },
        message: 'I have some rare basketball cards for trade',
        created_at: new Date().toISOString()
      }
    ]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add message logic here
    toast({
      title: "Message sent",
      description: "Your message has been posted to the room"
    });
    
    setNewMessage('');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Room Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{room.name}</h2>
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {participants.length}
            </Badge>
            <Badge variant={room.room_type === 'public' ? 'default' : 'outline'}>
              {room.room_type}
            </Badge>
            {onLeaveRoom && (
              <Button variant="outline" size="sm" onClick={onLeaveRoom}>
                Leave Room
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'chat', name: 'Chat', icon: MessageSquare },
            { id: 'trades', name: 'Active Trades', icon: TrendingUp },
            { id: 'participants', name: 'Participants', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.user.avatar_url} />
                    <AvatarFallback>
                      {message.user.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">
                        {message.user.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Active Trades</h3>
              <Dialog open={showTradeBuilder} onOpenChange={setShowTradeBuilder}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Trade
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Trade Offer</DialogTitle>
                  </DialogHeader>
                  <TradeOfferBuilder onClose={() => setShowTradeBuilder(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Placeholder for active trades */}
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Active Trades</h3>
              <p className="text-muted-foreground mb-4">
                Create your first trade offer to get started
              </p>
              <Button onClick={() => setShowTradeBuilder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Trade Offer
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">
                Participants ({participants.length})
              </h3>
              <div className="flex items-center space-x-2">
                <Input placeholder="Search participants..." className="w-48" />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <Card key={participant.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback>
                        {participant.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          {participant.user?.username || 'Unknown User'}
                        </span>
                        {getRoleIcon(participant.role)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          Joined {new Date(participant.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      participant.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};