import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudioProject, PSDStudioFile } from '@/pages/PSDStudioPage';
import { FileImage, Clock, Layers, CheckCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

interface PSDStudioFileBrowserProps {
  project: StudioProject;
  selectedFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onProjectUpdate: (project: StudioProject) => void;
  mode: 'beginner' | 'advanced' | 'bulk';
}

export const PSDStudioFileBrowser: React.FC<PSDStudioFileBrowserProps> = ({
  project,
  selectedFileId,
  onFileSelect,
  onProjectUpdate,
  mode
}) => {
  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = project.files.filter(f => f.id !== fileId);
    const updatedProject = {
      ...project,
      files: updatedFiles,
      lastModified: new Date()
    };
    onProjectUpdate(updatedProject);

    // If removed file was selected, select another one
    if (selectedFileId === fileId && updatedFiles.length > 0) {
      onFileSelect(updatedFiles[0].id);
    }
  };

  const getStatusIcon = (status: PSDStudioFile['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-crd-green" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-crd-blue animate-pulse" />;
    }
  };

  const getStatusBadge = (status: PSDStudioFile['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="outline" className="text-crd-green border-crd-green/20">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Processing</Badge>;
    }
  };

  if (project.files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-12 text-center max-w-md mx-auto">
          <FileImage className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-3">No Files Yet</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Upload your first PSD file to get started with the analysis
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-crd-green to-crd-blue"
          >
            Upload Files
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Project Files</h2>
        <p className="text-muted-foreground">
          Manage and analyze your PSD files • {project.files.length} file{project.files.length !== 1 ? 's' : ''} loaded
        </p>
      </div>

      {/* File Grid */}
      <div className={`grid gap-6 ${
        mode === 'bulk' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'
      }`}>
        {project.files.map((file) => {
          const isSelected = selectedFileId === file.id;
          const psd = file.processedPSD;

          return (
            <Card
              key={file.id}
              className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? 'ring-2 ring-crd-green bg-gradient-to-br from-crd-green/5 to-crd-blue/5'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => onFileSelect(file.id)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/5.6] bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden">
                {file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {/* Selection Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-t from-crd-green/20 to-transparent">
                    <div className="absolute top-3 right-3 w-6 h-6 bg-crd-green rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileSelect(file.id);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    
                    {mode !== 'beginner' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-destructive/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{file.fileName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {file.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusIcon(file.status)}
                    {getStatusBadge(file.status)}
                  </div>
                </div>

                {/* Stats */}
                {file.status === 'ready' && psd && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dimensions</span>
                      <div className="font-medium">{psd.width} × {psd.height}px</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Layers</span>
                      <div className="font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {psd.layers.length}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && (
                  <div className="text-xs text-destructive bg-destructive/10 rounded p-2 mt-2">
                    Failed to process file. Please try uploading again.
                  </div>
                )}

                {/* Action Button */}
                {file.status === 'ready' && (
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`w-full mt-4 ${
                      isSelected ? 'bg-gradient-to-r from-crd-green to-crd-blue' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileSelect(file.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Analyze'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      {mode === 'bulk' && project.files.length > 1 && (
        <Card className="mt-8 p-6 bg-gradient-to-r from-card/80 to-muted/20">
          <h3 className="text-lg font-semibold mb-4">Project Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Files</span>
              <div className="text-2xl font-bold text-crd-green">{project.files.length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Ready</span>
              <div className="text-2xl font-bold text-crd-blue">
                {project.files.filter(f => f.status === 'ready').length}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Layers</span>
              <div className="text-2xl font-bold text-crd-orange">
                {project.files
                  .filter(f => f.status === 'ready')
                  .reduce((sum, f) => sum + f.processedPSD.layers.length, 0)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Size</span>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(
                  project.files
                    .filter(f => f.status === 'ready')
                    .reduce((sum, f) => sum + f.processedPSD.width * f.processedPSD.height, 0) /
                  project.files.filter(f => f.status === 'ready').length / 1000000
                )}MP
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};