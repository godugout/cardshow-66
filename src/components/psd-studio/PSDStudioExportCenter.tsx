import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudioProject } from '@/pages/PSDStudioPage';
import { Download, Package, Image, FileText, Settings, CheckCircle, Loader2 } from 'lucide-react';

interface PSDStudioExportCenterProps {
  project: StudioProject;
  mode: 'beginner' | 'advanced' | 'bulk';
}

export const PSDStudioExportCenter: React.FC<PSDStudioExportCenterProps> = ({
  project,
  mode
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [completedExports, setCompletedExports] = useState<string[]>([]);

  const exportOptions = [
    {
      id: 'frames',
      name: 'CRD Frames',
      description: 'Ready-to-use card frames',
      icon: Package,
      formats: ['PNG', 'JPG', 'SVG'],
      recommended: true,
      available: project.files.some(f => f.status === 'ready')
    },
    {
      id: 'layers',
      name: 'Individual Layers',
      description: 'Separated layer images',
      icon: Image,
      formats: ['PNG', 'JPG'],
      recommended: false,
      available: project.files.some(f => f.status === 'ready')
    },
    {
      id: 'assets',
      name: 'Asset Bundle',
      description: 'Complete asset package',
      icon: Download,
      formats: ['ZIP'],
      recommended: mode === 'bulk',
      available: project.files.length > 1
    },
    {
      id: 'report',
      name: 'Analysis Report',
      description: 'Detailed project analysis',
      icon: FileText,
      formats: ['PDF', 'JSON'],
      recommended: mode === 'advanced',
      available: mode !== 'beginner'
    }
  ];

  const qualityOptions = [
    { id: 'ultra', name: 'Ultra (4K)', description: '4096px', premium: true },
    { id: 'high', name: 'High (2K)', description: '2048px', premium: false },
    { id: 'standard', name: 'Standard (1K)', description: '1024px', premium: false },
    { id: 'web', name: 'Web (512px)', description: '512px', premium: false }
  ];

  const [selectedExports, setSelectedExports] = useState<string[]>(
    exportOptions.filter(opt => opt.recommended && opt.available).map(opt => opt.id)
  );
  const [selectedQuality, setSelectedQuality] = useState('high');
  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>({
    frames: 'PNG',
    layers: 'PNG',
    assets: 'ZIP',
    report: 'PDF'
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setCompletedExports([]);

    // Simulate export process
    for (let i = 0; i < selectedExports.length; i++) {
      const exportId = selectedExports[i];
      
      // Simulate processing time
      for (let progress = 0; progress <= 100; progress += 10) {
        setExportProgress((i * 100 + progress) / selectedExports.length);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setCompletedExports(prev => [...prev, exportId]);
    }

    setIsExporting(false);
    setExportProgress(100);
  };

  const toggleExport = (exportId: string) => {
    setSelectedExports(prev => 
      prev.includes(exportId)
        ? prev.filter(id => id !== exportId)
        : [...prev, exportId]
    );
  };

  const toggleFormat = (exportId: string, format: string) => {
    setSelectedFormats(prev => ({
      ...prev,
      [exportId]: format
    }));
  };

  const readyFiles = project.files.filter(f => f.status === 'ready');
  const totalLayers = readyFiles.reduce((sum, f) => sum + f.processedPSD.layers.length, 0);

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Export Center</h2>
          <p className="text-muted-foreground">
            Download your processed files and generated frames in your preferred formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Summary */}
            <Card className="p-6 bg-gradient-to-r from-card/80 to-muted/20">
              <h3 className="text-lg font-semibold mb-4">Export Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Files Ready</span>
                  <div className="text-2xl font-bold text-crd-green">{readyFiles.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Layers</span>
                  <div className="text-2xl font-bold text-crd-blue">{totalLayers}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Generated Frames</span>
                  <div className="text-2xl font-bold text-crd-orange">0</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Export Size</span>
                  <div className="text-2xl font-bold text-foreground">~45MB</div>
                </div>
              </div>
            </Card>

            {/* Export Types */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">What to Export</h3>
              
              <div className="space-y-4">
                {exportOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedExports.includes(option.id);
                  const isCompleted = completedExports.includes(option.id);
                  
                  return (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        !option.available 
                          ? 'opacity-50 cursor-not-allowed bg-muted/20'
                          : isSelected
                          ? 'border-crd-green bg-crd-green/5'
                          : 'border-border hover:border-border/80'
                      }`}
                      onClick={() => option.available && !isExporting && toggleExport(option.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-crd-green/20' : 'bg-muted'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-crd-green" />
                            ) : (
                              <IconComponent className={`w-5 h-5 ${
                                isSelected ? 'text-crd-green' : 'text-muted-foreground'
                              }`} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{option.name}</h4>
                              {option.recommended && (
                                <Badge variant="outline" className="text-xs">Recommended</Badge>
                              )}
                              {!option.available && (
                                <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {option.description}
                            </p>
                            
                            {/* Format Selection */}
                            {isSelected && option.formats.length > 1 && (
                              <div className="flex gap-1 mt-2">
                                {option.formats.map((format) => (
                                  <Button
                                    key={format}
                                    size="sm"
                                    variant={selectedFormats[option.id] === format ? "default" : "outline"}
                                    className="text-xs h-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFormat(option.id, format);
                                    }}
                                  >
                                    {format}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isSelected && !isCompleted && (
                            <div className="w-4 h-4 border-2 border-crd-green border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Export Progress */}
            {isExporting && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-crd-blue" />
                  Exporting...
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(exportProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-crd-green to-crd-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Exporting {completedExports.length} of {selectedExports.length} items...
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Quality Settings */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Export Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <div className="space-y-2">
                    {qualityOptions.map((quality) => (
                      <label
                        key={quality.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedQuality === quality.id
                            ? 'bg-crd-green/10 border border-crd-green/20'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quality"
                          value={quality.id}
                          checked={selectedQuality === quality.id}
                          onChange={(e) => setSelectedQuality(e.target.value)}
                          className="text-crd-green"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{quality.name}</span>
                            {quality.premium && (
                              <Badge variant="outline" className="text-xs">Pro</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{quality.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Include metadata</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Compress output</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Preserve transparency</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Action */}
            <Card className="p-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-crd-green to-crd-blue hover:from-crd-green/90 hover:to-crd-blue/90"
                onClick={handleExport}
                disabled={selectedExports.length === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {selectedExports.length} Item{selectedExports.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              
              {selectedExports.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Select at least one export option
                </p>
              )}
            </Card>

            {/* File Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Files Included</h3>
              <div className="space-y-2">
                {readyFiles.slice(0, 3).map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-crd-green rounded-full" />
                    <span className="truncate">{file.fileName}</span>
                  </div>
                ))}
                {readyFiles.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-4">
                    +{readyFiles.length - 3} more files
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};