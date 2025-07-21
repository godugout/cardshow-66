// Professional Layer Tree Interface for CRDMKR
import React, { useState, useCallback, useMemo } from 'react';
import { EnhancedProcessedPSDLayer } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown,
  Type,
  Image as ImageIcon,
  Palette,
  Layers,
  Move,
  Lock,
  Unlock,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';

interface LayerTreeNode {
  layer: EnhancedProcessedPSDLayer;
  children: LayerTreeNode[];
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  depth: number;
}

interface LayerTreeInterfaceProps {
  layers: EnhancedProcessedPSDLayer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle?: (layerId: string) => void;
  onLayerReorder?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

interface LayerFilters {
  searchTerm: string;
  showOnlyVisible: boolean;
  layerType: 'all' | 'text' | 'image' | 'background' | 'shape';
}

export const LayerTreeInterface: React.FC<LayerTreeInterfaceProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerReorder,
  className
}) => {
  const [filters, setFilters] = useState<LayerFilters>({
    searchTerm: '',
    showOnlyVisible: false,
    layerType: 'all'
  });
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [lockedLayers, setLockedLayers] = useState<Set<string>>(new Set());

  // Build hierarchical layer tree
  const layerTree = useMemo(() => {
    const buildTree = (layerList: EnhancedProcessedPSDLayer[], depth = 0): LayerTreeNode[] => {
      return layerList.map(layer => ({
        layer,
        children: [], // TODO: Build actual hierarchy from parent-child relationships
        isExpanded: expandedNodes.has(layer.id),
        isSelected: selectedLayerId === layer.id,
        isVisible: layer.isVisible,
        isLocked: lockedLayers.has(layer.id),
        depth
      }));
    };
    
    return buildTree(layers);
  }, [layers, expandedNodes, selectedLayerId, lockedLayers]);

  // Filter layers based on search and filters
  const filteredLayers = useMemo(() => {
    return layerTree.filter(node => {
      const layer = node.layer;
      
      // Search filter
      if (filters.searchTerm && !layer.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Visibility filter
      if (filters.showOnlyVisible && !node.isVisible) {
        return false;
      }
      
      // Layer type filter
      if (filters.layerType !== 'all' && layer.semanticType !== filters.layerType) {
        return false;
      }
      
      return true;
    });
  }, [layerTree, filters]);

  const handleNodeExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleLayerLock = useCallback((layerId: string) => {
    setLockedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
    onLayerLockToggle?.(layerId);
  }, [onLayerLockToggle]);

  const getLayerIcon = (semanticType: string | undefined) => {
    switch (semanticType) {
      case 'text': return <Type className="w-4 h-4 text-crd-yellow" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-crd-blue" />;
      case 'background': return <Palette className="w-4 h-4 text-crd-green" />;
      default: return <Layers className="w-4 h-4 text-crd-text-muted" />;
    }
  };

  const LayerTreeItem: React.FC<{ node: LayerTreeNode }> = ({ node }) => {
    const { layer } = node;
    const hasChildren = node.children.length > 0;
    
    return (
      <div className="select-none">
        <div 
          className={cn(
            "flex items-center py-2 px-2 rounded-lg cursor-pointer transition-all duration-200",
            "hover:bg-crd-surface-light",
            node.isSelected && "bg-crd-orange/20 border-l-4 border-crd-orange",
            !node.isVisible && "opacity-50",
            node.isLocked && "bg-crd-surface/50"
          )}
          style={{ paddingLeft: `${8 + node.depth * 16}px` }}
          onClick={() => onLayerSelect(layer.id)}
        >
          {/* Expand/Collapse Arrow */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNodeExpand(layer.id);
              }}
              className="mr-2 p-0.5 hover:bg-crd-hover rounded"
            >
              {node.isExpanded ? 
                <ChevronDown className="w-4 h-4 text-crd-text-dim" /> : 
                <ChevronRight className="w-4 h-4 text-crd-text-dim" />
              }
            </button>
          )}
          
          {/* Layer Type Icon */}
          <div className="mr-3 flex-shrink-0">
            {getLayerIcon(layer.semanticType)}
          </div>
          
          {/* Layer Thumbnail */}
          {layer.thumbnailUrl && (
            <div className="mr-3 flex-shrink-0">
              <img 
                src={layer.thumbnailUrl} 
                alt={layer.name}
                className="w-8 h-8 rounded border border-crd-border object-cover"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          )}
          
          {/* Layer Name and Info */}
          <div className="flex-1 min-w-0">
            <div className={cn(
              "text-sm font-medium truncate",
              node.isSelected ? "text-crd-text" : "text-crd-text-dim"
            )}>
              {layer.name}
            </div>
            <div className="text-xs text-crd-text-muted truncate">
              {layer.semanticType} • {layer.bounds.right - layer.bounds.left}×{layer.bounds.bottom - layer.bounds.top}
            </div>
          </div>
          
          {/* Layer Controls */}
          <div className="flex items-center space-x-1 ml-2">
            {/* Lock Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLayerLock(layer.id);
              }}
              className="p-1 hover:bg-crd-hover rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title={node.isLocked ? 'Unlock layer' : 'Lock layer'}
            >
              {node.isLocked ? 
                <Lock className="w-3.5 h-3.5 text-crd-text-muted" /> : 
                <Unlock className="w-3.5 h-3.5 text-crd-text-muted" />
              }
            </button>
            
            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLayerVisibilityToggle(layer.id);
              }}
              className="p-1 hover:bg-crd-hover rounded"
              title={node.isVisible ? 'Hide layer' : 'Show layer'}
            >
              {node.isVisible ? 
                <Eye className="w-4 h-4 text-crd-text-dim" /> : 
                <EyeOff className="w-4 h-4 text-crd-text-muted" />
              }
            </button>
          </div>
        </div>
        
        {/* Render Children */}
        {hasChildren && node.isExpanded && (
          <div className="ml-4">
            {node.children.map(childNode => (
              <LayerTreeItem key={childNode.layer.id} node={childNode} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-crd-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-crd-text">Layers</h3>
          <span className="text-xs text-crd-text-muted">
            {filteredLayers.length} of {layers.length}
          </span>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crd-text-muted" />
          <input
            type="text"
            placeholder="Search layers..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-crd-black border border-crd-border rounded-lg text-sm text-crd-text placeholder-crd-text-muted focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={filters.layerType}
            onChange={(e) => setFilters(prev => ({ ...prev, layerType: e.target.value as any }))}
            className="flex-1 px-2 py-1 text-xs bg-crd-black border border-crd-border rounded text-crd-text focus:outline-none focus:ring-1 focus:ring-crd-orange"
          >
            <option value="all">All Types</option>
            <option value="text">Text Layers</option>
            <option value="image">Images</option>
            <option value="background">Backgrounds</option>
            <option value="shape">Shapes</option>
          </select>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, showOnlyVisible: !prev.showOnlyVisible }))}
            className={cn(
              "px-3 py-1 text-xs rounded border transition-colors",
              filters.showOnlyVisible 
                ? "bg-crd-orange text-crd-black border-crd-orange" 
                : "bg-crd-black text-crd-text-dim border-crd-border hover:border-crd-orange"
            )}
          >
            <Filter className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Layer Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredLayers.length === 0 ? (
          <div className="text-center py-8">
            <Layers className="w-12 h-12 text-crd-text-muted mx-auto mb-3" />
            <p className="text-sm text-crd-text-dim">
              {filters.searchTerm || filters.layerType !== 'all' || filters.showOnlyVisible
                ? 'No layers match your filters'
                : 'No layers found'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1 group">
            {filteredLayers.map(node => (
              <LayerTreeItem key={node.layer.id} node={node} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-crd-border">
        <div className="grid grid-cols-2 gap-2">
          <CRDButton
            variant="ghost"
            size="sm"
            onClick={() => {
              layers.forEach(layer => onLayerVisibilityToggle(layer.id));
            }}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Show All
          </CRDButton>
          
          <CRDButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({
                searchTerm: '',
                showOnlyVisible: false,
                layerType: 'all'
              });
            }}
            className="text-xs"
          >
            Clear Filters
          </CRDButton>
        </div>
      </div>
    </div>
  );
};