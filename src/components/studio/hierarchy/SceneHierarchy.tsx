import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  Lightbulb,
  Camera,
  Trash2,
  Copy,
  Edit
} from 'lucide-react';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';
import { toast } from 'sonner';

interface SceneObject {
  id: string;
  name: string;
  type: 'card' | 'light' | 'camera' | 'effect' | 'environment';
  visible: boolean;
  locked: boolean;
  children?: SceneObject[];
  properties?: Record<string, any>;
}

export const SceneHierarchy: React.FC = () => {
  const { state, updateEffectLayer, removeEffectLayer } = useAdvancedStudio();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['scene', 'effects']));
  const [editingName, setEditingName] = useState<string | null>(null);

  // Build scene hierarchy from current state
  const sceneHierarchy: SceneObject = {
    id: 'scene',
    name: 'Scene',
    type: 'environment',
    visible: true,
    locked: false,
    children: [
      ...(state.selectedCard ? [{
        id: 'main-card',
        name: state.selectedCard.title || 'Card',
        type: 'card' as const,
        visible: true,
        locked: false,
        properties: {
          material: state.material.preset,
          template: state.selectedCard.template
        }
      }] : []),
      {
        id: 'lighting',
        name: 'Lighting',
        type: 'light' as const,
        visible: true,
        locked: false,
        properties: {
          preset: state.lighting.preset,
          intensity: state.lighting.intensity,
          ambient: state.lighting.ambientLight
        }
      },
      {
        id: 'environment',
        name: 'Environment',
        type: 'environment' as const,
        visible: true,
        locked: false,
        properties: {
          preset: state.environment.preset,
          hdri: state.environment.hdriIntensity
        }
      },
      ...(state.effectLayers.length > 0 ? [{
        id: 'effects',
        name: 'Effects',
        type: 'effect' as const,
        visible: true,
        locked: false,
        children: state.effectLayers.map(layer => ({
          id: layer.id,
          name: layer.type.charAt(0).toUpperCase() + layer.type.slice(1),
          type: 'effect' as const,
          visible: layer.enabled,
          locked: false,
          properties: {
            intensity: layer.intensity,
            opacity: layer.opacity,
            blendMode: layer.blendMode
          }
        }))
      }] : [])
    ]
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'card': return Box;
      case 'light': return Lightbulb;
      case 'camera': return Camera;
      case 'effect': return Layers;
      case 'environment': return Eye;
      default: return Box;
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleVisibilityToggle = (id: string, visible: boolean) => {
    if (id.startsWith('effect-') || state.effectLayers.find(l => l.id === id)) {
      updateEffectLayer(id, { enabled: visible });
    }
    toast.success(`${visible ? 'Showed' : 'Hid'} object`);
  };

  const handleDelete = (id: string) => {
    if (state.effectLayers.find(l => l.id === id)) {
      removeEffectLayer(id);
      toast.success('Effect removed');
    }
  };

  const handleDuplicate = (id: string) => {
    const layer = state.effectLayers.find(l => l.id === id);
    if (layer) {
      // In a real implementation, this would add a copy
      toast.success('Effect duplicated');
    }
  };

  const renderObjectItem = (obj: SceneObject, depth: number = 0) => {
    const Icon = getIcon(obj.type);
    const hasChildren = obj.children && obj.children.length > 0;
    const isExpanded = expandedItems.has(obj.id);
    const isEditing = editingName === obj.id;

    return (
      <div key={obj.id}>
        <div 
          className={`flex items-center gap-2 px-2 py-1 hover:bg-crd-darker/50 rounded group ${
            depth > 0 ? 'ml-4' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => toggleExpanded(obj.id)}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Icon */}
          <Icon className="w-4 h-4 text-crd-text-secondary" />

          {/* Name */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={obj.name}
                onChange={(e) => {
                  // Update name logic here
                }}
                onBlur={() => setEditingName(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingName(null);
                  if (e.key === 'Escape') setEditingName(null);
                }}
                className="h-6 text-xs"
                autoFocus
              />
            ) : (
              <span 
                className="text-sm text-crd-text truncate cursor-pointer"
                onDoubleClick={() => setEditingName(obj.id)}
              >
                {obj.name}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Visibility Toggle */}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => handleVisibilityToggle(obj.id, !obj.visible)}
            >
              {obj.visible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3 text-crd-text-secondary" />
              )}
            </Button>

            {/* Lock Toggle */}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              {obj.locked ? (
                <Lock className="w-3 h-3 text-crd-text-secondary" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </Button>

            {/* More Options */}
            {obj.type === 'effect' && obj.id !== 'effects' && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDuplicate(obj.id)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDelete(obj.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Properties */}
        {obj.properties && isExpanded && (
          <div className="ml-8 mb-2">
            <div className="text-xs text-crd-text-secondary bg-crd-darker/30 rounded p-2">
              {Object.entries(obj.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span>{typeof value === 'number' ? Math.round(value) : String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && obj.children && (
          <div>
            {obj.children.map(child => renderObjectItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-crd-dark border-l border-crd-border h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-crd-border">
        <h2 className="text-crd-text text-lg font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Scene Hierarchy
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {renderObjectItem(sceneHierarchy)}
        </div>
      </div>

      {/* Scene Stats */}
      <div className="p-4 border-t border-crd-border bg-crd-darker/50">
        <div className="text-xs text-crd-text-secondary space-y-1">
          <div className="flex justify-between">
            <span>Objects:</span>
            <span>{1 + state.effectLayers.length + 2}</span>
          </div>
          <div className="flex justify-between">
            <span>Effects:</span>
            <span>{state.effectLayers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Visible:</span>
            <span>{state.effectLayers.filter(l => l.enabled).length + 3}</span>
          </div>
        </div>
      </div>
    </div>
  );
};