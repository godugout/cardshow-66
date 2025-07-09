
import React from 'react';
import { LargeCardPreview } from './LargeCardPreview';
import { FrameSelectionPanel } from './FrameSelectionPanel';
import { UploadAssetPanel } from './UploadAssetPanel';
import type { MinimalistFrame } from '../data/minimalistFrames';

interface EnhancedDesktopLayoutProps {
  frames: MinimalistFrame[];
  currentIndex: number;
  currentFrame: MinimalistFrame;
  uploadedImage?: string;
  isDragActive: boolean;
  onFrameSelect: (index: number) => void;
  onImageUpload: (imageUrl: string) => void;
  getRootProps: () => any;
  getInputProps: () => any;
}

export const EnhancedDesktopLayout: React.FC<EnhancedDesktopLayoutProps> = ({
  frames,
  currentIndex,
  currentFrame,
  uploadedImage,
  isDragActive,
  onFrameSelect,
  onImageUpload,
  getRootProps,
  getInputProps
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-2 lg:p-4">
      <div className="grid grid-cols-3 gap-3 lg:gap-6 h-full min-h-[600px]">
        {/* Large Card Preview Column - 33% width (1 of 3 columns) */}
        <div className="col-span-1 flex items-center justify-center">
          <LargeCardPreview
            frames={frames}
            currentIndex={currentIndex}
            uploadedImage={uploadedImage}
            isDragActive={isDragActive}
            onFrameSelect={onFrameSelect}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
          />
        </div>

        {/* Frame Selection Panel - 33% width (1 of 3 columns) */}
        <div className="col-span-1 overflow-hidden">
          <FrameSelectionPanel
            frames={frames}
            currentIndex={currentIndex}
            currentFrame={currentFrame}
            uploadedImage={uploadedImage}
            onFrameSelect={onFrameSelect}
          />
        </div>

        {/* Upload & Asset Management Panel - 33% width (1 of 3 columns) */}
        <div className="col-span-1 overflow-hidden">
          <UploadAssetPanel
            uploadedImage={uploadedImage}
            onImageUpload={onImageUpload}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
          />
        </div>
      </div>
    </div>
  );
};
