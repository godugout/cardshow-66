
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, Move, Maximize2, Undo, Redo } from 'lucide-react';

interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface CompactCropControlsProps {
  cropState: CropState;
  onReset: () => void;
  onCenter: () => void;
  onFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRotationChange: (rotation: number) => void;
}

export const CompactCropControls: React.FC<CompactCropControlsProps> = ({
  cropState,
  onReset,
  onCenter,
  onFit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRotationChange
}) => {
  const handleRotateBy = (degrees: number) => {
    const newRotation = (cropState.rotation + degrees) % 360;
    onRotationChange(newRotation);
  };

  return (
    <div className="bg-crd-surface/90 backdrop-blur-sm border border-crd-border rounded-xl p-4 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-white font-semibold text-sm">Crop Controls</h3>
        <p className="text-crd-lightGray text-xs mt-1">Drag corners to resize • Use rotation handle above</p>
      </div>

      {/* Quick Actions Row */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={onCenter}
          size="sm"
          variant="outline"
          className="border-crd-border bg-crd-darkest/50 text-white hover:bg-crd-green hover:border-crd-green hover:text-black transition-all duration-200 text-xs font-medium"
        >
          <Move className="w-3 h-3 mr-1" />
          Center
        </Button>
        <Button
          onClick={onFit}
          size="sm"
          variant="outline"
          className="border-crd-border bg-crd-darkest/50 text-white hover:bg-crd-green hover:border-crd-green hover:text-black transition-all duration-200 text-xs font-medium"
        >
          <Maximize2 className="w-3 h-3 mr-1" />
          Fit
        </Button>
        <Button
          onClick={onReset}
          size="sm"
          variant="outline"
          className="border-crd-border bg-crd-darkest/50 text-white hover:bg-crd-orange hover:border-crd-orange hover:text-black transition-all duration-200 text-xs font-medium"
        >
          Reset
        </Button>
      </div>

      {/* Rotation & History Row */}
      <div className="flex justify-between items-center">
        {/* Rotation Controls */}
        <div className="flex items-center gap-2">
          <span className="text-crd-lightGray text-xs font-medium">Rotate:</span>
          <div className="flex items-center gap-1 bg-crd-darkest/50 rounded-lg p-1">
            <Button
              onClick={() => handleRotateBy(-15)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-crd-green hover:text-black w-7 h-7 p-0 transition-all duration-200"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <span className="text-white text-xs px-2 min-w-[35px] text-center font-mono">
              {Math.round(cropState.rotation)}°
            </span>
            <Button
              onClick={() => handleRotateBy(15)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-crd-green hover:text-black w-7 h-7 p-0 transition-all duration-200"
            >
              <RotateCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <span className="text-crd-lightGray text-xs font-medium">History:</span>
          <div className="flex gap-1 bg-crd-darkest/50 rounded-lg p-1">
            <Button
              onClick={onUndo}
              disabled={!canUndo}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-crd-blue hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white w-7 h-7 p-0 transition-all duration-200"
              title="Undo"
            >
              <Undo className="w-3 h-3" />
            </Button>
            <Button
              onClick={onRedo}
              disabled={!canRedo}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-crd-blue hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white w-7 h-7 p-0 transition-all duration-200"
              title="Redo"
            >
              <Redo className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-crd-green/10 border border-crd-green/20 rounded-lg px-3 py-1">
          <div className="w-2 h-2 bg-crd-green rounded-full animate-pulse"></div>
          <span className="text-crd-green text-xs font-medium">Ready to crop</span>
        </div>
      </div>
    </div>
  );
};
