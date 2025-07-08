import React from 'react';
import { ImmersiveCardViewer } from '@/components/viewer/ImmersiveCardViewer';
import { useStudioState } from '@/hooks/studio/useStudioState';

const StudioPage: React.FC = () => {
  const { currentCard } = useStudioState();

  return (
    <div className="pt-16 w-screen h-screen bg-crd-darkest">
      <div className="w-full h-full">
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
            <div className="text-center">
              <p className="text-crd-text-secondary text-lg">No card selected.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPage;