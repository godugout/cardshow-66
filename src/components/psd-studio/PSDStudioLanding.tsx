import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PSDStudioUploadZone } from './PSDStudioUploadZone';
import { PSDStudioModeSelector } from './PSDStudioModeSelector';
import { StudioProject, PSDStudioFile } from '@/pages/PSDStudioPage';
import { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { Layers, Zap, Users, Sparkles, FileImage, Cpu, Download } from 'lucide-react';

interface PSDStudioLandingProps {
  onProjectCreated: (project: StudioProject) => void;
  selectedMode: 'beginner' | 'advanced' | 'bulk';
  onModeChange: (mode: 'beginner' | 'advanced' | 'bulk') => void;
}

export const PSDStudioLanding: React.FC<PSDStudioLandingProps> = ({
  onProjectCreated,
  selectedMode,
  onModeChange
}) => {
  const handleFilesProcessed = useCallback((processedFiles: EnhancedProcessedPSD[]) => {
    const studioFiles: PSDStudioFile[] = processedFiles.map((psd, index) => ({
      id: `file_${Date.now()}_${index}`,
      fileName: psd.metadata?.documentName || `PSD File ${index + 1}`,
      processedPSD: psd,
      status: 'ready' as const,
      thumbnailUrl: psd.extractedImages.thumbnailUrl || '',
      uploadedAt: new Date()
    }));

    const project: StudioProject = {
      id: `project_${Date.now()}`,
      name: `PSD Project ${new Date().toLocaleDateString()}`,
      files: studioFiles,
      created: new Date(),
      lastModified: new Date(),
      mode: selectedMode
    };

    onProjectCreated(project);
  }, [selectedMode, onProjectCreated]);

  const features = [
    {
      icon: Layers,
      title: "Smart Layer Analysis",
      description: "AI-powered layer detection and categorization",
      color: "text-crd-green"
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description: "Process multiple PSDs in seconds with optimization",
      color: "text-crd-blue"
    },
    {
      icon: Download,
      title: "Professional Export",
      description: "Generate CRD frames and assets ready for production",
      color: "text-crd-orange"
    }
  ];

  const stats = [
    { label: "PSDs Processed", value: "10,000+", icon: FileImage },
    { label: "Layers Analyzed", value: "500K+", icon: Layers },
    { label: "Frames Generated", value: "25,000+", icon: Cpu }
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-crd-green/10 to-crd-blue/10 border border-crd-green/20 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-crd-green" />
          <span className="text-sm font-medium text-foreground/80">Professional PSD Analysis Studio</span>
        </div>
        
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-crd-green via-crd-blue to-crd-orange bg-clip-text text-transparent">
          Transform PSDs into CRD Frames
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Professional-grade PSD analysis with AI-powered layer detection, smart frame generation, 
          and seamless CRD integration. From concept to card in minutes.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2">
              <stat.icon className="w-4 h-4 text-crd-green" />
              <span className="text-sm font-medium">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-16">
        <PSDStudioModeSelector 
          selectedMode={selectedMode}
          onModeChange={onModeChange}
        />
      </div>

      {/* Upload Zone */}
      <div className="mb-16">
        <PSDStudioUploadZone 
          mode={selectedMode}
          onFilesProcessed={handleFilesProcessed}
        />
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50 hover:border-crd-green/30 transition-all duration-300 hover:scale-105 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-background to-muted rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Card className="inline-block p-8 bg-gradient-to-r from-crd-green/5 to-crd-blue/5 border-crd-green/20">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Trusted by 1,000+ creators</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>99.9% uptime</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>Enterprise ready</span>
          </div>
        </Card>
      </div>
    </div>
  );
};