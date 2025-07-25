// CRDMKR Professional Frame Builder - Main Interface
import React, { useState, useCallback, useMemo } from 'react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { PlatformHeader } from '@/components/ui/design-system/organisms/PlatformHeader';
import { PSDProcessingEngine } from '@/components/crdmkr/PSDProcessingEngine';
import { LayerTreeInterface } from '@/components/crdmkr/LayerTreeInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Download, 
  Palette,
  ChevronRight,
  Settings,
  Grid,
  Maximize2,
  RotateCcw,
  Share2,
  Layers,
  Edit
} from 'lucide-react';
import { useSubdomainRouting } from '@/hooks/useSubdomainRouting';
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

export const CRDMKRFrameBuilder: React.FC = () => {
  const { currentSubdomain } = useSubdomainRouting();
  
  // Core state
  const [project, setProject] = useState<CRDFrameProject | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Team and style codes for naming convention
  const TEAM_CODES = ['BOS', 'MTL', 'USA', 'AI1', 'LAX'];
  const STYLE_CODES = ['S', 'B', 'UNI', 'SK', 'CL70s'];

  const handlePSDProcessed = useCallback((processedPSD: EnhancedProcessedPSD, fileName: string) => {
    // Generate file name following CS_FRM_[TEAMCODE]_[STYLECODE] convention
    const teamCode = TEAM_CODES[0]; // Default to first, user can change
    const styleCode = STYLE_CODES[0]; // Default to first, user can change
    const frameName = `CS_FRM_${teamCode}_${styleCode}`;

    // Initialize layer visibility - ensure all layers have isVisible property
    const layersWithVisibility = processedPSD.layers.map(layer => ({
      ...layer,
      isVisible: layer.isVisible !== undefined ? layer.isVisible : true
    }));

    const newProject: CRDFrameProject = {
      id: `frame_${Date.now()}`,
      name: frameName,
      teamCode,
      styleCode,
      processedPSD: {
        ...processedPSD,
        layers: layersWithVisibility
      },
      metadata: {
        description: `Frame template generated from ${fileName}`,
        category: 'custom',
        isPublic: false,
        tags: ['psd-import', 'frame-template']
      },
      editableRegions: [],
      lastModified: new Date()
    };

    setProject(newProject);
    toast.success('Frame project created successfully!');
  }, [TEAM_CODES, STYLE_CODES]);

  const handleLayerVisibilityToggle = useCallback((layerId: string) => {
    if (!project?.processedPSD) return;
    
    // Update the layer visibility in the processed PSD
    const updatedLayers = project.processedPSD.layers.map(layer => {
      if (layer.id === layerId) {
        const newVisibility = layer.isVisible !== undefined ? !layer.isVisible : false;
        console.log(`Toggling layer ${layer.name} from ${layer.isVisible} to ${newVisibility}`);
        return { ...layer, isVisible: newVisibility };
      }
      return layer;
    });
    
    setProject(prev => prev ? {
      ...prev,
      processedPSD: {
        ...prev.processedPSD!,
        layers: updatedLayers
      },
      lastModified: new Date()
    } : null);
  }, [project]);

  const handleLayerSelect = useCallback((layerId: string) => {
    setSelectedLayerId(layerId);
  }, []);

  const generateFrameName = () => {
    if (!project) return '';
    return `CS_FRM_${project.teamCode}_${project.styleCode}.png`;
  };

  const handleSaveProject = useCallback(() => {
    if (!project) return;
    // TODO: Implement project saving
    toast.success('Project saved successfully!');
  }, [project]);

  const handleExportFrame = useCallback(() => {
    if (!project) return;
    // TODO: Implement frame export
    toast.success('Frame exported successfully!');
  }, [project]);

  const selectedLayer = project?.processedPSD?.layers.find(layer => layer.id === selectedLayerId);

  // Generate preview with visible layers only
  const previewLayers = useMemo(() => {
    if (!project?.processedPSD) return [];
    return project.processedPSD.layers.filter(layer => layer.isVisible);
  }, [project?.processedPSD?.layers]);

  // Handle name editing
  const startEditingName = () => {
    if (project) {
      setEditedName(project.name);
      setIsEditingName(true);
    }
  };

  const saveEditedName = () => {
    if (project && editedName.trim()) {
      setProject(prev => prev ? { ...prev, name: editedName.trim() } : null);
      setIsEditingName(false);
      toast.success('Frame name updated');
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  // Initial state - no project loaded
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
            <h2 className="text-3xl font-bold text-crd-text mb-4">
              Import Your PSD Template
            </h2>
            <p className="text-lg text-crd-text-dim max-w-2xl mx-auto">
              Upload your Photoshop file to automatically extract layers and build a professional 
              card frame template compatible with our 3D rendering system.
            </p>
          </div>

          <PSDProcessingEngine onPSDProcessed={handlePSDProcessed} />

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-crd-surface rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Grid className="w-6 h-6 text-crd-orange" />
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

  // Main editor interface
  return (
    <div className="min-h-screen bg-crd-black flex flex-col">
      {/* Professional Header */}
      <header className="border-b border-crd-border bg-crd-black/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-6 h-6 text-crd-orange" />
              <span className="font-bold text-lg text-crd-text">CRDMKR</span>
            </div>
            
            {/* Inline Editable Frame Name */}
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditedName();
                      if (e.key === 'Escape') cancelEditingName();
                    }}
                    onBlur={saveEditedName}
                    className="px-2 py-1 bg-crd-black border border-crd-border rounded text-sm text-crd-text focus:outline-none focus:ring-2 focus:ring-crd-orange"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={startEditingName}
                  className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-crd-hover group"
                >
                  <span className="text-sm text-crd-text font-medium">{project.name}</span>
                  <Edit className="w-3 h-3 text-crd-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
              <span className="text-xs text-crd-text-muted">
                {generateFrameName()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CRDButton variant="ghost" size="sm" onClick={handleSaveProject}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </CRDButton>
            <CRDButton variant="blue" size="sm" onClick={handleExportFrame}>
              <Download className="w-4 h-4 mr-2" />
              Export Frame
            </CRDButton>
          </div>
        </div>
      </header>

      {/* Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tabbed Sidebar */}
        <div className={cn(
          "bg-crd-surface border-r border-crd-border transition-all duration-300",
          sidebarCollapsed ? "w-12" : "w-80"
        )}>
          {!sidebarCollapsed && project?.processedPSD && (
            <Tabs defaultValue="layers" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-crd-black/50 border-b border-crd-border">
                <TabsTrigger value="layers" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Layers
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="layers" className="flex-1 overflow-hidden">
                <LayerTreeInterface
                  layers={project.processedPSD.layers as EnhancedProcessedPSDLayer[]}
                  selectedLayerId={selectedLayerId}
                  onLayerSelect={handleLayerSelect}
                  onLayerVisibilityToggle={handleLayerVisibilityToggle}
                  className="h-full"
                />
              </TabsContent>
              
              <TabsContent value="settings" className="flex-1 overflow-auto">
                <div className="p-4 space-y-6">
                  {/* Frame Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-crd-text mb-3">Frame Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-crd-text-dim mb-1">
                          Team Code
                        </label>
                        <select 
                          className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange"
                          value={project.teamCode}
                          onChange={(e) => setProject(prev => prev ? {...prev, teamCode: e.target.value} : null)}
                        >
                          {TEAM_CODES.map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-crd-text-dim mb-1">
                          Style Code
                        </label>
                        <select 
                          className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange"
                          value={project.styleCode}
                          onChange={(e) => setProject(prev => prev ? {...prev, styleCode: e.target.value} : null)}
                        >
                          {STYLE_CODES.map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-crd-text-dim mb-1">
                          Category
                        </label>
                        <select 
                          className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange"
                          value={project.metadata.category}
                          onChange={(e) => setProject(prev => prev ? {
                            ...prev, 
                            metadata: { ...prev.metadata, category: e.target.value as any }
                          } : null)}
                        >
                          <option value="sports">Sports</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="art">Art</option>
                          <option value="business">Business</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-crd-text-dim mb-1">
                          Description
                        </label>
                        <textarea 
                          className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange resize-none"
                          rows={3}
                          value={project.metadata.description}
                          onChange={(e) => setProject(prev => prev ? {
                            ...prev, 
                            metadata: { ...prev.metadata, description: e.target.value }
                          } : null)}
                          placeholder="Describe your frame template..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={project.metadata.isPublic}
                          onChange={(e) => setProject(prev => prev ? {
                            ...prev, 
                            metadata: { ...prev.metadata, isPublic: e.target.checked }
                          } : null)}
                          className="rounded border-crd-border focus:ring-crd-orange"
                        />
                        <label htmlFor="isPublic" className="text-xs text-crd-text-dim">
                          Make this frame template public
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Selected Layer Properties */}
                  {selectedLayer && (
                    <div>
                      <h4 className="text-sm font-medium text-crd-text mb-3">Selected Layer</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-crd-text-dim mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent"
                            value={selectedLayer.name}
                            readOnly
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-crd-text-dim mb-1">
                            Type
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent"
                            value={selectedLayer.semanticType || selectedLayer.type}
                            readOnly
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-crd-text-dim mb-1">
                            Dimensions
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-crd-black border border-crd-border rounded-lg text-crd-text text-sm focus:outline-none focus:ring-2 focus:ring-crd-orange focus:border-transparent"
                            value={`${selectedLayer.bounds.right - selectedLayer.bounds.left} × ${selectedLayer.bounds.bottom - selectedLayer.bounds.top}px`}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {/* Collapse button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-4 right-2 p-1 hover:bg-crd-hover rounded z-10"
          >
            <ChevronRight className={cn(
              "w-4 h-4 text-crd-text-dim transition-transform",
              !sidebarCollapsed && "rotate-180"
            )} />
          </button>
        </div>

        {/* Center Panel - Canvas Preview */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="p-4 border-b border-crd-border bg-crd-surface/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-crd-text-dim">
                  {project.processedPSD?.width} × {project.processedPSD?.height}px
                </span>
                <span className="text-xs text-crd-text-muted">
                  {previewLayers.length} of {project.processedPSD?.layers.length} layers visible
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewZoom(Math.max(0.1, previewZoom - 0.1))}
                    className="px-2 py-1 text-xs bg-crd-hover rounded hover:bg-crd-active text-crd-text"
                  >
                    -
                  </button>
                  <span className="text-sm min-w-[4rem] text-center text-crd-text">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(3, previewZoom + 0.1))}
                    className="px-2 py-1 text-xs bg-crd-hover rounded hover:bg-crd-active text-crd-text"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CRDButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPreviewZoom(1)}
                >
                  <Maximize2 className="w-4 h-4" />
                </CRDButton>
                <CRDButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setPreviewZoom(1);
                    setPreviewOffset({ x: 0, y: 0 });
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </CRDButton>
              </div>
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 relative overflow-auto bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {project.processedPSD?.extractedImages.flattenedImageUrl && (
                <div className="relative">
                  <img
                    src={project.processedPSD.extractedImages.flattenedImageUrl}
                    alt="PSD Preview"
                    className="max-w-none border border-crd-border shadow-2xl rounded-lg"
                    style={{
                      transform: `scale(${previewZoom}) translate(${previewOffset.x}px, ${previewOffset.y}px)`,
                      opacity: previewLayers.length === project.processedPSD.layers.length ? 1 : 0.3
                    }}
                  />
                  
                  {/* Render visible layers on top */}
                  {previewLayers.length < project.processedPSD.layers.length && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        transform: `scale(${previewZoom}) translate(${previewOffset.x}px, ${previewOffset.y}px)`
                      }}
                    >
                      {previewLayers.map(layer => {
                        const enhancedLayer = layer as EnhancedProcessedPSDLayer;
                        return enhancedLayer.thumbnailUrl && (
                          <img
                            key={enhancedLayer.id}
                            src={enhancedLayer.thumbnailUrl}
                            alt={enhancedLayer.name}
                            className="absolute"
                            style={{
                              left: enhancedLayer.bounds.left,
                              top: enhancedLayer.bounds.top,
                              width: enhancedLayer.bounds.right - enhancedLayer.bounds.left,
                              height: enhancedLayer.bounds.bottom - enhancedLayer.bounds.top,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};