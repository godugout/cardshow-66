import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';

const MarketplacePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <MarketplaceBrowser />
      </div>
    </MainLayout>
  );
};

export default MarketplacePage;