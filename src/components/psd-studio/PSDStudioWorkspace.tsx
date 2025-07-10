import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudioProject } from '@/pages/PSDStudioPage';
import { PSDStudioHeader } from './PSDStudioHeader';
import { PSDStudioFileBrowser } from './PSDStudioFileBrowser';
import { PSDStudioAnalysisView } from './PSDStudioAnalysisView';
import { PSDStudioFrameBuilder } from './PSDStudioFrameBuilder';
import { PSDStudioExportCenter } from './PSDStudioExportCenter';
import { FileText, Layers, Frame, Download } from 'lucide-react';

interface PSDStudioWorkspaceProps {
  project: StudioProject;
  onProjectUpdate: (project: StudioProject) => void;
  onBackToLanding: () => void;
  mode: 'beginner' | 'advanced' | 'bulk';
  onModeChange: (mode: 'beginner' | 'advanced' | 'bulk') => void;
}

export const PSDStudioWorkspace: React.FC<PSDStudioWorkspaceProps> = ({
  project,
  onProjectUpdate,
  onBackToLanding,
  mode,
  onModeChange
}) => {
  const [activeTab, setActiveTab] = useState('files');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    project.files.length > 0 ? project.files[0].id : null
  );

  const selectedFile = selectedFileId 
    ? project.files.find(f => f.id === selectedFileId)
    : null;

  const tabs = [
    {
      id: 'files',
      label: 'Files',
      icon: FileText,
      description: 'Manage your PSD files',
      available: true
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: Layers,
      description: 'Deep dive into layers',
      available: !!selectedFile
    },
    {
      id: 'frames',
      label: 'Frame Builder',
      icon: Frame,
      description: 'Create CRD frames',
      available: !!selectedFile && mode !== 'beginner'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      description: 'Download results',
      available: project.files.length > 0
    }
  ];

  const availableTabs = tabs.filter(tab => tab.available);

  // Auto-navigate to analysis if file is selected and on files tab
  React.useEffect(() => {
    if (selectedFile && activeTab === 'files' && mode === 'beginner') {
      setActiveTab('analysis');
    }
  }, [selectedFile, activeTab, mode]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <PSDStudioHeader
        project={project}
        mode={mode}
        onModeChange={onModeChange}
        onBackToLanding={onBackToLanding}
        onProjectUpdate={onProjectUpdate}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-card/50 backdrop-blur-sm border-b border-border/50">
            <div className="container mx-auto px-6">
              <TabsList className="bg-transparent p-0 h-auto">
                <div className="flex space-x-1">
                  {availableTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={`flex items-center gap-2 px-4 py-3 text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-crd-green/10 to-crd-blue/10 border-b-2 border-crd-green text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                        {mode === 'beginner' && tab.id === 'frames' && (
                          <Badge variant="secondary" className="text-xs ml-1">Pro</Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </div>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="files" className="h-full m-0">
              <PSDStudioFileBrowser
                project={project}
                selectedFileId={selectedFileId}
                onFileSelect={setSelectedFileId}
                onProjectUpdate={onProjectUpdate}
                mode={mode}
              />
            </TabsContent>

            <TabsContent value="analysis" className="h-full m-0">
              {selectedFile ? (
                <PSDStudioAnalysisView
                  file={selectedFile}
                  mode={mode}
                  onFileUpdate={(updatedFile) => {
                    const updatedProject = {
                      ...project,
                      files: project.files.map(f => f.id === updatedFile.id ? updatedFile : f),
                      lastModified: new Date()
                    };
                    onProjectUpdate(updatedProject);
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Card className="p-8 text-center max-w-md mx-auto">
                    <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No File Selected</h3>
                    <p className="text-muted-foreground">
                      Select a PSD file from the Files tab to begin analysis
                    </p>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="frames" className="h-full m-0">
              {selectedFile ? (
                <PSDStudioFrameBuilder
                  file={selectedFile}
                  mode={mode}
                  onFileUpdate={(updatedFile) => {
                    const updatedProject = {
                      ...project,
                      files: project.files.map(f => f.id === updatedFile.id ? updatedFile : f),
                      lastModified: new Date()
                    };
                    onProjectUpdate(updatedProject);
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Card className="p-8 text-center max-w-md mx-auto">
                    <Frame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No File Selected</h3>
                    <p className="text-muted-foreground">
                      Select a PSD file to start building frames
                    </p>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="export" className="h-full m-0">
              <PSDStudioExportCenter
                project={project}
                mode={mode}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};