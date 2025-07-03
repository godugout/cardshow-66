import React from 'react';
import { ImmersiveCardViewer } from '@/components/viewer/ImmersiveCardViewer';
import { SampleDataGenerator } from '@/components/debug/SampleDataGenerator';
import { useStudioState } from '@/hooks/studio/useStudioState';

const StudioPage: React.FC = () => {
  const { currentCard } = useStudioState();

  return (
    <div className="w-screen h-screen bg-crd-darkest">
      {currentCard ? (
        <ImmersiveCardViewer
          card={currentCard}
          isOpen={true}
          className="w-full h-full"
          allowRotation={true}
          showStats={true}
          ambient={true}
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