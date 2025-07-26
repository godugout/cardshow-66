import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GripVertical, Settings, Trash2 } from 'lucide-react';
import { PortfolioModule } from '@/types/portfolio';
import { PortfolioModuleRenderer } from './PortfolioModuleRenderer';

interface PortfolioModuleWrapperProps {
  module: PortfolioModule;
  onConfigure: (module: PortfolioModule) => void;
  onRemove: (moduleId: string) => void;
}

export const PortfolioModuleWrapper: React.FC<PortfolioModuleWrapperProps> = ({
  module,
  onConfigure,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      {/* Module Controls Overlay */}
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onConfigure(module)}
            className="w-8 h-8 p-0 bg-crd-surface border-crd-border hover:bg-crd-surface/80"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemove(module.id)}
            className="w-8 h-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 cursor-grab bg-crd-surface border border-crd-border hover:bg-crd-surface/80"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Module Content */}
      <Card className={`border-crd-border bg-crd-surface/20 overflow-hidden transition-all ${
        isDragging ? 'opacity-50 shadow-lg' : 'group-hover:border-crd-blue/50'
      }`}>
        <PortfolioModuleRenderer module={module} />
      </Card>
    </div>
  );
};