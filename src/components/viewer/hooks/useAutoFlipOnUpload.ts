import { useEffect } from 'react';

export const useAutoFlipOnUpload = (
  hasImage: boolean,
  setIsFlipped: (flipped: boolean) => void
) => {
  useEffect(() => {
    // When image is uploaded, flip to front to show it
    if (hasImage) {
      setIsFlipped(false);
    } else {
      // When no image, show the impressive card back
      setIsFlipped(true);
    }
  }, [hasImage, setIsFlipped]);
};