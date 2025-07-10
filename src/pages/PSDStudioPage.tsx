import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PSDStudioLanding } from '@/components/psd-studio/PSDStudioLanding';
import { PSDStudioWorkspace } from '@/components/psd-studio/PSDStudioWorkspace';
import { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';

export interface StudioProject {
  id: string;
  name: string;
  files: PSDStudioFile[];
  created: Date;
  lastModified: Date;
  mode: 'beginner' | 'advanced' | 'bulk';
}

export interface PSDStudioFile {
  id: string;
  fileName: string;
  processedPSD: EnhancedProcessedPSD;
  status: 'processing' | 'ready' | 'error';
  thumbnailUrl: string;
  uploadedAt: Date;
}

const PSDStudioPage: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<StudioProject | null>(null);
  const [studioMode, setStudioMode] = useState<'beginner' | 'advanced' | 'bulk'>('beginner');

  const handleProjectCreated = (project: StudioProject) => {
    setCurrentProject(project);
  };

  const handleBackToLanding = () => {
    setCurrentProject(null);
  };

  const handleModeChange = (mode: 'beginner' | 'advanced' | 'bulk') => {
    setStudioMode(mode);
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        mode,
        lastModified: new Date()
      });
    }
  };

  return (
    <MainLayout showNavbar={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        {!currentProject ? (
          <PSDStudioLanding 
            onProjectCreated={handleProjectCreated}
            selectedMode={studioMode}
            onModeChange={handleModeChange}
          />
        ) : (
          <PSDStudioWorkspace 
            project={currentProject}
            onProjectUpdate={setCurrentProject}
            onBackToLanding={handleBackToLanding}
            mode={studioMode}
            onModeChange={handleModeChange}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PSDStudioPage;