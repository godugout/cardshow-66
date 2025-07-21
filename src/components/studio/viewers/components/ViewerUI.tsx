import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';

export const ViewerUI: React.FC = () => {
  const { state } = useAdvancedStudio();

  return (
    <>
      {/* Bottom info bar - keep this as it's scene-specific */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="p-3 bg-black/20 backdrop-blur-sm border-white/10">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-white border-white/20">
                {state.selectedCard?.title || 'Untitled Card'}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20">
                {state.material.preset}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20">
                {state.lighting.preset}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Animation: {state.animation.preset}</span>
              <span>Quality: High</span>
              <span>Render: Real-time</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading overlay */}
      {!state.selectedCard?.image_url && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <Card className="p-6 bg-black/40 backdrop-blur-sm border-white/10 text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading 3D Scene...</p>
          </Card>
        </div>
      )}
    </>
  );
};
