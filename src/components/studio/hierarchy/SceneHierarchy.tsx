import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal,
  Plus,
  Copy,
  Trash2,
  Image,
  Type,
  Square,
  Circle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const getLayerIcon = (type: string) => {
  switch (type) {
    case 'image': return Image;
    case 'text': return Type;
    case 'shape': return Square;
    case 'background': return Circle;
    default: return Layers;
  }
};

export const SceneHierarchy: React.FC = () => {
  const { state } = useAdvancedStudio();
  
  // Mock layer functions for now
  const updateLayer = (layer: any) => {};
  const addLayer = (layer: any) => {};
  const removeLayer = (layerId: string) => {};
  const reorderLayers = (layers: any[]) => {};
  const selectLayer = (layerId: string) => {};
  
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['card-layers']));

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleLayerToggle = (layerId: string, property: 'visible' | 'locked') => {
    // Mock implementation
    toast.success(`Toggled ${property} for layer`);
  };

  const handleAddLayer = (type: 'text' | 'shape' | 'image') => {
    const newLayer = {
      id: `${type}-${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal'
    };
    addLayer(newLayer);
    selectLayer(newLayer.id);
    toast.success(`Added ${type} layer`);
  };

  const handleDuplicateLayer = (layerId: string) => {
    const layer = state.effectLayers.find(l => l.id === layerId);
    if (layer) {
      const duplicatedLayer = {
        ...layer,
        id: `${layer.id}-copy-${Date.now()}`
      };
      addLayer(duplicatedLayer);
      toast.success('Effect layer duplicated');
    }
  };

  const handleDeleteLayer = (layerId: string) => {
    removeLayer(layerId);
    toast.success('Layer deleted');
  };

  const sortedLayers = []; // Mock empty layers for now

  return (
    <div className="h-full bg-crd-dark flex flex-col">
      <div className="p-3 border-b border-crd-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Scene Hierarchy
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAddLayer('text')}>
                <Type className="w-4 h-4 mr-2" />
                Add Text Layer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddLayer('shape')}>
                <Square className="w-4 h-4 mr-2" />
                Add Shape Layer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddLayer('image')}>
                <Image className="w-4 h-4 mr-2" />
                Add Image Layer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {/* Card Layers Group */}
        <div className="space-y-1">
          <div 
            className="flex items-center gap-1 p-1 cursor-pointer hover:bg-crd-darkest rounded-sm"
            onClick={() => toggleGroupExpansion('card-layers')}
          >
            {expandedGroups.has('card-layers') ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Layers className="w-3 h-3 text-crd-accent" />
            <span className="text-xs font-medium">Card Layers</span>
            <span className="text-xs text-crd-text-secondary ml-auto">
              {sortedLayers.length}
            </span>
          </div>

          {expandedGroups.has('card-layers') && (
            <div className="ml-4 space-y-1">
              {sortedLayers.map((layer) => {
                const LayerIcon = getLayerIcon(layer.type);
                const isSelected = false; // Mock selection state
                
                return (
                  <Card
                    key={layer.id}
                    className={`p-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-crd-accent/20 border-crd-accent' 
                        : 'bg-crd-darkest/50 border-crd-border hover:bg-crd-darkest'
                    }`}
                    onClick={() => selectLayer(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <LayerIcon className="w-3 h-3 text-crd-accent" />
                      <span className="text-xs flex-1 truncate">{layer.name}</span>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLayerToggle(layer.id, 'visible');
                          }}
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 opacity-50" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLayerToggle(layer.id, 'locked');
                          }}
                        >
                          {layer.locked ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3 opacity-50" />
                          )}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDuplicateLayer(layer.id)}>
                              <Copy className="w-3 h-3 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLayer(layer.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Layer properties preview */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-crd-text-secondary">
                      <span>Opacity: {layer.opacity}%</span>
                      <span>•</span>
                      <span className="capitalize">{layer.blendMode}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Effect Layers Group */}
        <div className="mt-4 space-y-1">
          <div 
            className="flex items-center gap-1 p-1 cursor-pointer hover:bg-crd-darkest rounded-sm"
            onClick={() => toggleGroupExpansion('effect-layers')}
          >
            {expandedGroups.has('effect-layers') ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Layers className="w-3 h-3 text-crd-green" />
            <span className="text-xs font-medium">Effect Layers</span>
            <span className="text-xs text-crd-text-secondary ml-auto">
              {state.effectLayers.length}
            </span>
          </div>

          {expandedGroups.has('effect-layers') && (
            <div className="ml-4 space-y-1">
              {state.effectLayers.length === 0 ? (
                <div className="text-xs text-crd-text-secondary p-2">
                  No effect layers yet
                </div>
              ) : (
                state.effectLayers.map((effect) => (
                  <Card
                    key={effect.id}
                    className="p-2 bg-crd-darkest/50 border-crd-border"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3 text-crd-green" />
                      <span className="text-xs flex-1 capitalize">{effect.type}</span>
                      <span className="text-xs text-crd-text-secondary">
                        {effect.intensity}%
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};