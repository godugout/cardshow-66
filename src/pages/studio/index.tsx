import React from 'react';
import { StudioInterface } from '@/components/studio/StudioInterface';
import { SampleDataGenerator } from '@/components/debug/SampleDataGenerator';
import { useStudioState } from '@/hooks/studio/useStudioState';

const StudioPage: React.FC = () => {
  const { currentCard } = useStudioState();

  return (
    <div className="w-screen h-screen bg-crd-darkest">
      {currentCard ? (
        <StudioInterface
          card={currentCard}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <SampleDataGenerator />
        </div>
      )}
    </div>
  );
};

export default StudioPage;