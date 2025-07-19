
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export const ViewerUI: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <div className="flex gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-2">
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
          <Play className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
