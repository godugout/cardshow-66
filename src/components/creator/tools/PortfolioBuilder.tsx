import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save, Eye, Settings } from 'lucide-react';
import { AvailableModulesPanel } from './portfolio/AvailableModulesPanel';
import { PortfolioCanvas } from './portfolio/PortfolioCanvas';
import { ModuleConfigModal } from './portfolio/ModuleConfigModal';
import { PortfolioModule, PortfolioModuleType, ModuleTemplate } from '@/types/portfolio';
import { supabase } from '@/integrations/supabase/client';

const moduleTemplates: ModuleTemplate[] = [
  {
    type: 'ProfileHeader',
    name: 'Profile Header',
    description: 'Display your name, avatar, and banner',
    icon: '👤',
    defaultConfig: {
      displayName: '',
      tagline: '',
      showStats: true,
      bannerImageUrl: '',
      avatarUrl: ''
    }
  },
  {
    type: 'AboutMe',
    name: 'About Me',
    description: 'Tell your story and background',
    icon: '📝',
    defaultConfig: {
      content: '',
      showContactButton: true
    }
  },
  {
    type: 'FeaturedCards',
    name: 'Featured Cards',
    description: 'Showcase your best cards',
    icon: '🎨',
    defaultConfig: {
      cardIds: [],
      displayStyle: 'grid',
      title: 'Featured Cards'
    }
  },
  {
    type: 'CardCollections',
    name: 'Card Collections',
    description: 'Display your card collections',
    icon: '📚',
    defaultConfig: {
      collectionIds: [],
      showPrivate: false,
      displayStyle: 'grid'
    }
  },
  {
    type: 'SocialLinks',
    name: 'Social Links',
    description: 'Connect with your audience',
    icon: '🔗',
    defaultConfig: {
      links: []
    }
  },
  {
    type: 'Statistics',
    name: 'Statistics',
    description: 'Show your achievements',
    icon: '📊',
    defaultConfig: {
      showTotalCards: true,
      showTotalViews: true,
      showFollowers: true,
      showJoinDate: true
    }
  }
];

export const PortfolioBuilder: React.FC = () => {
  const [modules, setModules] = useState<PortfolioModule[]>([]);
  const [activeModule, setActiveModule] = useState<PortfolioModule | null>(null);
  const [selectedModule, setSelectedModule] = useState<PortfolioModule | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const moduleId = active.id as string;
    
    // Find the module being dragged
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setActiveModule(module);
    }
  }, [modules]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveModule(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle dropping new module from sidebar
    if (activeId.startsWith('template-')) {
      const moduleType = activeId.replace('template-', '') as PortfolioModuleType;
      const template = moduleTemplates.find(t => t.type === moduleType);
      
      if (template) {
        const newModule: PortfolioModule = {
          id: `${moduleType}-${Date.now()}`,
          type: moduleType,
          config: { ...template.defaultConfig },
          order: modules.length
        };
        
        setModules(prev => [...prev, newModule]);
        toast.success(`${template.name} added to portfolio`);
      }
      return;
    }

    // Handle reordering existing modules
    if (activeId !== overId) {
      setModules(prev => {
        const oldIndex = prev.findIndex(item => item.id === activeId);
        const newIndex = prev.findIndex(item => item.id === overId);
        
        const reorderedModules = arrayMove(prev, oldIndex, newIndex);
        return reorderedModules.map((module, index) => ({
          ...module,
          order: index
        }));
      });
    }
  }, [modules]);

  const handleAddModule = useCallback((moduleType: PortfolioModuleType) => {
    const template = moduleTemplates.find(t => t.type === moduleType);
    
    if (template) {
      const newModule: PortfolioModule = {
        id: `${moduleType}-${Date.now()}`,
        type: moduleType,
        config: { ...template.defaultConfig },
        order: modules.length
      };
      
      setModules(prev => [...prev, newModule]);
      toast.success(`${template.name} added to portfolio`);
    }
  }, [modules.length]);

  const handleRemoveModule = useCallback((moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    toast.success('Module removed from portfolio');
  }, []);

  const handleConfigureModule = useCallback((module: PortfolioModule) => {
    setSelectedModule(module);
    setIsConfigModalOpen(true);
  }, []);

  const handleUpdateModuleConfig = useCallback((moduleId: string, newConfig: Record<string, any>) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, config: { ...module.config, ...newConfig } }
        : module
    ));
    setIsConfigModalOpen(false);
    setSelectedModule(null);
    toast.success('Module configuration updated');
  }, []);

  const handleSavePortfolio = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save your portfolio');
        return;
      }

      const response = await supabase.functions.invoke('portfolio-save', {
        body: {
          layout: modules.sort((a, b) => a.order - b.order)
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Portfolio saved successfully!');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error('Failed to save portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPortfolio = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-crd-darkest via-[#0a0a0b] to-[#131316] flex">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-crd-border/20 bg-crd-surface/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-crd-orange/20 to-crd-yellow/20">
                <Settings className="w-5 h-5 text-crd-orange" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-crd-foreground">
                  Portfolio Builder
                </h1>
                <p className="text-sm text-crd-muted">
                  Create your professional portfolio
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewPortfolio}
                className="text-crd-muted hover:text-crd-foreground"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                onClick={handleSavePortfolio}
                disabled={isSaving || modules.length === 0}
                className="bg-crd-green hover:bg-crd-green/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Portfolio'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-20">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          {!isPreviewMode && (
            <AvailableModulesPanel
              templates={moduleTemplates}
              onAddModule={handleAddModule}
            />
          )}

          <div className={`flex-1 ${!isPreviewMode ? 'ml-80' : ''}`}>
            <SortableContext 
              items={modules.map(m => m.id)} 
              strategy={verticalListSortingStrategy}
            >
              <PortfolioCanvas
                modules={modules}
                isPreviewMode={isPreviewMode}
                onConfigureModule={handleConfigureModule}
                onRemoveModule={handleRemoveModule}
              />
            </SortableContext>
          </div>

          <DragOverlay>
            {activeModule ? (
              <Card className="p-4 bg-crd-surface border-crd-border shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {moduleTemplates.find(t => t.type === activeModule.type)?.icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-crd-foreground">
                      {moduleTemplates.find(t => t.type === activeModule.type)?.name}
                    </h3>
                  </div>
                </div>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Configuration Modal */}
      {selectedModule && (
        <ModuleConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
          onUpdateConfig={handleUpdateModuleConfig}
        />
      )}
    </div>
  );
};