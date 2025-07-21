// CRDMKR Professional Frame Builder - Main Interface
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { PlatformHeader } from '@/components/ui/design-system/organisms/PlatformHeader';
import { 
  Upload, 
  Layers, 
  Settings, 
  Save, 
  Download, 
  Eye, 
  EyeOff,
  Move,
  Palette,
  Type,
  Image as ImageIcon,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
import { unifiedPSDService } from '@/services/psdProcessor/unifiedPsdService';
import { EnhancedProcessedPSD, EnhancedProcessedPSDLayer } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CRDFrameProject {
  id: string;
  name: string;
  teamCode: string;
  styleCode: string;
  processedPSD: EnhancedProcessedPSD | null;
  metadata: {
    description: string;
    category: 'sports' | 'entertainment' | 'art' | 'business' | 'custom';
    isPublic: boolean;
    tags: string[];
  };
  editableRegions: EditableRegion[];
  lastModified: Date;
}

interface EditableRegion {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  type: 'image' | 'text' | 'logo';
  required: boolean;
  defaultContent?: string;
}

interface LayerTreeNode {
  layer: EnhancedProcessedPSDLayer;
  children: LayerTreeNode[];
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
}

export const CRDMKRFrameBuilder: React.FC = () => {
  const { currentSubdomain } = useSubdomainRouting();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Core state
  const [project, setProject] = useState<CRDFrameProject | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [layerTree, setLayerTree] = useState<LayerTreeNode[]>([]);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });

  // Team and style codes for naming convention
  const TEAM_CODES = ['BOS', 'MTL', 'USA', 'AI1', 'LAX'];
  const STYLE_CODES = ['S', 'B', 'UNI', 'SK', 'CL70s'];

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    if (!file.type.includes('image') && !file.name.toLowerCase().endsWith('.psd')) {
      toast.error('Please upload a PSD file');
      return;
    }

    setIsProcessing(true);
    
    try {
      const processedPSD = await unifiedPSDService.processPSDFile(file, {
        extractImages: true,
        generateThumbnails: true,
        maxLayerSize: 2048
      });

      // Generate file name following CS_FRM_[TEAMCODE]_[STYLECODE] convention
      const teamCode = TEAM_CODES[0]; // Default to first, user can change
      const styleCode = STYLE_CODES[0]; // Default to first, user can change
      const fileName = `CS_FRM_${teamCode}_${styleCode}`;

      const newProject: CRDFrameProject = {
        id: `frame_${Date.now()}`,
        name: fileName,
        teamCode,
        styleCode,
        processedPSD,
        metadata: {
          description: `Frame template generated from ${file.name}`,
          category: 'custom',
          isPublic: false,
          tags: ['psd-import', 'frame-template']
        },
        editableRegions: [],
        lastModified: new Date()
      };

      setProject(newProject);
      
      // Build layer tree with hierarchy
      const tree = buildLayerTree(processedPSD.layers as EnhancedProcessedPSDLayer[]);
      setLayerTree(tree);
      
      toast.success('PSD processed successfully!');
      
    } catch (error) {
      console.error('PSD processing failed:', error);
      toast.error('Failed to process PSD file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const buildLayerTree = (layers: EnhancedProcessedPSDLayer[]): LayerTreeNode[] => {
    return layers.map(layer => ({
      layer,
      children: [], // TODO: Build actual hierarchy from group relationships
      isExpanded: true,
      isSelected: false,
      isVisible: layer.isVisible
    }));
  };

  const handleLayerVisibilityToggle = useCallback((layerId: string) => {
    setLayerTree(prev => prev.map(node => {
      if (node.layer.id === layerId) {
        return { ...node, isVisible: !node.isVisible };
      }
      return node;
    }));
  }, []);

  const handleLayerSelect = useCallback((layerId: string) => {
    setSelectedLayerId(layerId);
    setLayerTree(prev => prev.map(node => ({
      ...node,
      isSelected: node.layer.id === layerId
    })));
  }, []);

  const generateFrameName = () => {
    if (!project) return '';
    return `CS_FRM_${project.teamCode}_${project.styleCode}.png`;
  };

  const LayerTreeItem: React.FC<{ 
    node: LayerTreeNode; 
    depth: number; 
  }> = ({ node, depth }) => {
    const { layer } = node;
    const isSelected = selectedLayerId === layer.id;
    
    return (
      <div className="select-none">
        <div 
          className={cn(
            "flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors",
            "hover:bg-crd-surface-light",
            isSelected && "bg-crd-orange/20 border-l-2 border-crd-orange",
            !node.isVisible && "opacity-50"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => handleLayerSelect(layer.id)}
        >
          {/* Layer type icon */}
          <div className="mr-2 flex-shrink-0">
            {layer.semanticType === 'text' && <Type className="w-4 h-4 text-crd-yellow" />}
            {layer.semanticType === 'image' && <ImageIcon className="w-4 h-4 text-crd-blue" />}
            {layer.semanticType === 'background' && <Palette className="w-4 h-4 text-crd-green" />}
            {!['text', 'image', 'background'].includes(layer.semanticType || '') && 
              <Layers className="w-4 h-4 text-crd-text-muted" />}
          </div>
          
          {/* Layer thumbnail */}
          {layer.thumbnailUrl && (
            <div className="mr-2 flex-shrink-0">
              <img 
                src={layer.thumbnailUrl} 
                alt={layer.name}
                className="w-6 h-6 rounded border border-crd-border object-cover"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          )}
          
          {/* Layer name */}
          <span className={cn(
            "flex-1 text-sm truncate font-medium",
            isSelected ? "text-crd-text" : "text-crd-text-dim"
          )}>
            {layer.name}
          </span>
          
          {/* Layer visibility toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLayerVisibilityToggle(layer.id);
            }}
            className="ml-2 p-1 hover:bg-crd-hover rounded"
          >
            {node.isVisible ? 
              <Eye className="w-4 h-4 text-crd-text-dim" /> : 
              <EyeOff className="w-4 h-4 text-crd-text-muted" />
            }
          </button>
        </div>
      </div>
    );
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-crd-black">
        <PlatformHeader 
          title="CRDMKR Frame Builder"
          subtitle="Professional PSD-to-Frame conversion tool"
        />
        
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-crd-orange to-crd-yellow rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Palette className="w-12 h-12 text-crd-black" />
            </div>
            <h2 className="text-3xl font-bold text-crd-text mb-4 font-display">
              Import Your PSD Template
            </h2>
            <p className="text-lg text-crd-text-dim max-w-2xl mx-auto">
              Upload your Photoshop file to automatically extract layers and build a professional 
              card frame template compatible with our 3D rendering system.
            </p>
          </div>

          <CRDCard className="p-12 text-center border-2 border-dashed border-crd-border hover:border-crd-orange transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".psd,image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            <Upload className="w-16 h-16 text-crd-text-muted mx-auto mb-6" />
            
            <h3 className="text-xl font-semibold text-crd-text mb-4">
              {isProcessing ? 'Processing PSD...' : 'Drop your PSD file here'}
            </h3>
            
            <p className="text-crd-text-dim mb-8">
              Supports complex PSDs with layers, groups, and text elements. Max file size: 50MB
            </p>
            
            <CRDButton 
              variant="orange" 
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              loading={isProcessing}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Choose PSD File'}
            </CRDButton>
          </CRDCard>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-crd-surface rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Layers className="w-6 h-6 text-crd-orange" />
              </div>
              <h4 className="font-semibold text-crd-text mb-2">Layer Analysis</h4>
              <p className="text-sm text-crd-text-dim">AI-powered layer detection and categorization</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-crd-surface rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-6 h-6 text-crd-orange" />
              </div>
              <h4 className="font-semibold text-crd-text mb-2">Non-Destructive Editing</h4>
              <p className="text-sm text-crd-text-dim">Make changes without altering original layers</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-crd-surface rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Download className="w-6 h-6 text-crd-orange" />
              </div>
              <h4 className="font-semibold text-crd-text mb-2">Professional Export</h4>
              <p className="text-sm text-crd-text-dim">Generate production-ready frame templates</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crd-black flex flex-col">
      {/* Professional Header */}
      <header className="border-b border-crd-border bg-crd-black/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-6 h-6 text-crd-orange" />
              <span className="font-bold text-lg text-crd-text font-display">CRDMKR</span>
            </div>
            <div className="text-sm text-crd-text-dim">
              {generateFrameName()}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CRDButton variant="ghost" size="sm">
              <Save className="w-4 h-4" />
              Save
            </CRDButton>
            <CRDButton variant="blue" size="sm">
              <Download className="w-4 h-4" />
              Export Frame
            </CRDButton>
          </div>
        </div>
      </header>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Layer Tree */}
        <div className={cn(
          "bg-crd-surface border-r border-crd-border transition-all duration-300",
          sidebarCollapsed ? "w-12" : "w-80"
        )}>
          <div className="p-4 border-b border-crd-border">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-semibold text-crd-text transition-opacity",
                sidebarCollapsed && "opacity-0"
              )}>
                Layers
              </h3>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 hover:bg-crd-hover rounded"
              >
                <ChevronRight className={cn(
                  "w-4 h-4 text-crd-text-dim transition-transform",
                  !sidebarCollapsed && "rotate-180"
                )} />
              </button>
            </div>
          </div>
          
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {layerTree.map((node, index) => (
                  <LayerTreeItem key={node.layer.id} node={node} depth={0} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Canvas Preview */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-crd-border bg-crd-surface/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-crd-text-dim">
                  {project.processedPSD?.width} × {project.processedPSD?.height}px
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewZoom(Math.max(0.1, previewZoom - 0.1))}
                    className="px-2 py-1 text-xs bg-crd-hover rounded hover:bg-crd-active"
                  >
                    -
                  </button>
                  <span className="text-sm min-w-[4rem] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(3, previewZoom + 0.1))}
                    className="px-2 py-1 text-xs bg-crd-hover rounded hover:bg-crd-active"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-auto bg-checkered">
            <div className="absolute inset-0 flex items-center justify-center">
              {project.processedPSD?.extractedImages.flattenedImageUrl && (
                <img
                  src={project.processedPSD.extractedImages.flattenedImageUrl}
                  alt="PSD Preview"
                  className="max-w-none border border-crd-border shadow-lg"
                  style={{
                    transform: `scale(${previewZoom}) translate(${previewOffset.x}px, ${previewOffset.y}px)`
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className={cn(
          "bg-crd-surface border-l border-crd-border transition-all duration-300",
          propertiesPanelCollapsed ? "w-12" : "w-80"
        )}>
          <div className="p-4 border-b border-crd-border">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-semibold text-crd-text transition-opacity",
                propertiesPanelCollapsed && "opacity-0"
              )}>
                Properties
              </h3>
              <button
                onClick={() => setPropertiesPanelCollapsed(!propertiesPanelCollapsed)}
                className="p-1 hover:bg-crd-hover rounded"
              >
                <ChevronRight className={cn(
                  "w-4 h-4 text-crd-text-dim transition-transform",
                  propertiesPanelCollapsed && "rotate-180"
                )} />
              </button>
            </div>
          </div>
          
          {!propertiesPanelCollapsed && selectedLayerId && (
            <div className="p-4 space-y-4">
              {/* Layer properties will go here */}
              <div>
                <label className="block text-sm font-medium text-crd-text mb-2">
                  Layer Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent"
                  value={layerTree.find(n => n.layer.id === selectedLayerId)?.layer.name || ''}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};