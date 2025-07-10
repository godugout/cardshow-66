import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudioProject } from '@/pages/PSDStudioPage';
import { ArrowLeft, Settings, Save, Share, Sparkles, Zap, Users } from 'lucide-react';

interface PSDStudioHeaderProps {
  project: StudioProject;
  mode: 'beginner' | 'advanced' | 'bulk';
  onModeChange: (mode: 'beginner' | 'advanced' | 'bulk') => void;
  onBackToLanding: () => void;
  onProjectUpdate: (project: StudioProject) => void;
}

export const PSDStudioHeader: React.FC<PSDStudioHeaderProps> = ({
  project,
  mode,
  onModeChange,
  onBackToLanding,
  onProjectUpdate
}) => {
  const getModeConfig = () => {
    switch (mode) {
      case 'beginner':
        return { icon: Sparkles, color: 'crd-green', label: 'Beginner Mode' };
      case 'advanced':
        return { icon: Zap, color: 'crd-blue', label: 'Advanced Mode' };
      case 'bulk':
        return { icon: Users, color: 'crd-orange', label: 'Bulk Processing' };
    }
  };

  const modeConfig = getModeConfig();
  const ModeIcon = modeConfig.icon;

  const handleSaveProject = () => {
    // In a real app, this would save to localStorage or a backend
    const savedProject = {
      ...project,
      lastModified: new Date()
    };
    onProjectUpdate(savedProject);
    
    // Show toast or notification
    console.log('Project saved:', savedProject);
  };

  return (
    <div className="bg-gradient-to-r from-background via-background/95 to-muted/10 border-b border-border/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLanding}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studio
            </Button>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br from-${modeConfig.color}/20 to-${modeConfig.color}/10 rounded-lg flex items-center justify-center`}>
                <ModeIcon className={`w-4 h-4 text-${modeConfig.color}`} />
              </div>
              
              <div>
                <h1 className="text-lg font-semibold">{project.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {modeConfig.label}
                  </Badge>
                  <span>•</span>
                  <span>{project.files.length} file{project.files.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Modified {project.lastModified.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              {['beginner', 'advanced', 'bulk'].map((m) => {
                const isActive = mode === m;
                const config = m === 'beginner' 
                  ? { icon: Sparkles, label: 'Beginner' }
                  : m === 'advanced'
                  ? { icon: Zap, label: 'Advanced' }
                  : { icon: Users, label: 'Bulk' };
                
                const Icon = config.icon;
                
                return (
                  <Button
                    key={m}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onModeChange(m as any)}
                    className={`text-xs ${isActive ? 'bg-background shadow-sm' : ''}`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              className="text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Share className="w-3 h-3 mr-1" />
              Share
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};