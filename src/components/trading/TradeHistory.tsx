import React from 'react';

interface TradeHistoryProps {
  tradeId: string;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ tradeId }) => {
  return (
    <div className="bg-crd-dark border border-crd-mediumGray rounded-lg p-4">
      <div className="text-center py-8 text-crd-lightGray">
        <p>Trade History Coming Soon</p>
        <p className="text-sm">Trade history for {tradeId} will be shown here.</p>
      </div>
    </div>
  );
};