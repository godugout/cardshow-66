import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { PortfolioModule } from '@/types/portfolio';
import { PortfolioModuleWrapper } from './PortfolioModuleWrapper';
import { PortfolioModuleRenderer } from './PortfolioModuleRenderer';

interface PortfolioCanvasProps {
  modules: PortfolioModule[];
  isPreviewMode: boolean;
  onConfigureModule: (module: PortfolioModule) => void;
  onRemoveModule: (moduleId: string) => void;
}

export const PortfolioCanvas: React.FC<PortfolioCanvasProps> = ({
  modules,
  isPreviewMode,
  onConfigureModule,
  onRemoveModule,
}) => {
  const { setNodeRef } = useDroppable({
    id: 'portfolio-canvas',
  });

  if (modules.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className="flex-1 p-8 min-h-full"
      >
        <Card className="h-full border-2 border-dashed border-crd-border/50 bg-crd-surface/10">
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-crd-foreground mb-2">
                Start Building Your Portfolio
              </h3>
              <p className="text-crd-muted">
                Drag modules from the sidebar to start creating your professional portfolio. 
                Begin with a Profile Header to introduce yourself!
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="flex-1 p-8 min-h-full"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((module) => (
            isPreviewMode ? (
              <PortfolioModuleRenderer
                key={module.id}
                module={module}
              />
            ) : (
              <PortfolioModuleWrapper
                key={module.id}
                module={module}
                onConfigure={onConfigureModule}
                onRemove={onRemoveModule}
              />
            )
          ))}
      </div>
    </div>
  );
};