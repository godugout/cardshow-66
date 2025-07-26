import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ModuleTemplate, PortfolioModuleType } from '@/types/portfolio';

interface DraggableModuleProps {
  template: ModuleTemplate;
  onAdd: (type: PortfolioModuleType) => void;
}

const DraggableModule: React.FC<DraggableModuleProps> = ({ template, onAdd }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `template-${template.type}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-grab border-crd-border bg-crd-surface/50 hover:bg-crd-surface/70 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{template.icon}</span>
          <div className="flex-1">
            <h3 className="font-medium text-crd-foreground mb-1">
              {template.name}
            </h3>
            <p className="text-sm text-crd-muted leading-relaxed">
              {template.description}
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(template.type);
          }}
          className="shrink-0 w-8 h-8 p-0 text-crd-muted hover:text-crd-foreground"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

interface AvailableModulesPanelProps {
  templates: ModuleTemplate[];
  onAddModule: (type: PortfolioModuleType) => void;
}

export const AvailableModulesPanel: React.FC<AvailableModulesPanelProps> = ({
  templates,
  onAddModule,
}) => {
  return (
    <div className="fixed left-0 top-20 bottom-0 w-80 bg-crd-surface/20 border-r border-crd-border/20 backdrop-blur-sm">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-crd-foreground mb-2">
            Available Modules
          </h2>
          <p className="text-sm text-crd-muted">
            Drag modules to your portfolio or click the + button to add them
          </p>
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <DraggableModule
              key={template.type}
              template={template}
              onAdd={onAddModule}
            />
          ))}
        </div>

        <div className="mt-8 p-4 rounded-lg bg-crd-blue/10 border border-crd-blue/20">
          <h3 className="text-sm font-medium text-crd-blue mb-2">
            💡 Pro Tip
          </h3>
          <p className="text-xs text-crd-muted">
            Start with a Profile Header, then add an About Me section. 
            Feature your best cards to make a strong first impression!
          </p>
        </div>
      </div>
    </div>
  );
};