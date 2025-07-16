
import React from 'react';
import { useOverlay } from './OverlayProvider';
import { EnhancedCardDetectionDialog } from './EnhancedCardDetectionDialog';
import { PSDWorkflowDialog } from './PSDWorkflowDialog';

export const OverlayManager = () => {
  const { isOpen, overlayType, overlayData, closeOverlay } = useOverlay();

  if (overlayType === 'card-detection') {
    return (
      <EnhancedCardDetectionDialog
        isOpen={isOpen}
        onClose={closeOverlay}
        onCardsExtracted={overlayData?.onCardsExtracted}
      />
    );
  }

  if (overlayType === 'psd-workflow') {
    return (
      <PSDWorkflowDialog
        isOpen={isOpen}
        onClose={closeOverlay}
        file={overlayData?.file}
        onFrameCreated={overlayData?.onFrameCreated}
      />
    );
  }

  // Add other overlay types here as needed
  return null;
};
