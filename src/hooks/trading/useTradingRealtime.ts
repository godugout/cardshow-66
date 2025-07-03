import { useState } from 'react';

export const useTradingRealtime = () => {
  const [messages] = useState<any[]>([]);
  const isConnected = true;
  const typingUsers: string[] = [];
  const onlineUsers: string[] = [];

  const broadcastTyping = () => {};
  
  const sendMessage = async () => {
    return { id: 'mock-message' };
  };

  return {
    messages,
    isConnected,
    typingUsers,
    onlineUsers,
    broadcastTyping,
    sendMessage
  };
};