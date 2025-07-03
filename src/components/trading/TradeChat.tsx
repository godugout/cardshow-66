import React from 'react';

interface TradeChatProps {
  tradeId: string;
  typingUsers: string[];
  onTyping: (isTyping: boolean) => void;
  onSendMessage: (message: string) => Promise<any>;
}

export const TradeChat: React.FC<TradeChatProps> = ({ 
  tradeId, 
  typingUsers, 
  onTyping, 
  onSendMessage 
}) => {
  return (
    <div className="bg-crd-dark border border-crd-mediumGray rounded-lg p-4">
      <div className="text-center py-8 text-crd-lightGray">
        <p>Trade Chat Coming Soon</p>
        <p className="text-sm">Chat functionality will be available here.</p>
      </div>
    </div>
  );
};