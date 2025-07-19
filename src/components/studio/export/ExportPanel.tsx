import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Image, 
  Video, 
  FileText, 
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdvancedStudio } from '@/contexts/AdvancedStudioContext';

interface ExportSettings {
  format: 'png' | 'jpg' | 'gif' | 'mp4' | 'webm' | 'obj' | 'glb';
  quality: number;
  width: number;
  height: number;
  duration: number; // for video/gif
  frameRate: number;
  transparent: boolean;
  includeBackground: boolean;
}

export const ExportPanel: React.FC = () => {
  const { state } = useAdvancedStudio();
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 90,
    width: 1920,
    height: 1080,
    duration: 3,
    frameRate: 30,
    transparent: false,
    includeBackground: true
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const formatOptions = [
    { value: 'png', label: 'PNG Image', icon: Image, description: 'High quality with transparency' },
    { value: 'jpg', label: 'JPEG Image', icon: Image, description: 'Smaller file size' },
    { value: 'gif', label: 'Animated GIF', icon: Video, description: 'Animation with small file size' },
    { value: 'mp4', label: 'MP4 Video', icon: Video, description: 'High quality video' },
    { value: 'webm', label: 'WebM Video', icon: Video, description: 'Web optimized video' },
    { value: 'obj', label: '3D Model (OBJ)', icon: FileText, description: '3D model file' },
    { value: 'glb', label: '3D Model (GLB)', icon: FileText, description: 'Compressed 3D model' }
  ];

  const resolutionPresets = [
    { label: 'HD (1280x720)', width: 1280, height: 720 },
    { label: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { label: '4K (3840x2160)', width: 3840, height: 2160 },
    { label: 'Instagram Square (1080x1080)', width: 1080, height: 1080 },
    { label: 'Instagram Story (1080x1920)', width: 1080, height: 1920 },
    { label: 'Twitter Card (1200x675)', width: 1200, height: 675 }
  ];

  const isVideoFormat = ['gif', 'mp4', 'webm'].includes(exportSettings.format);
  const is3DFormat = ['obj', 'glb'].includes(exportSettings.format);

  const handleExport = async () => {
    if (!state.selectedCard) {
      toast.error('No card selected for export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create download link (mock implementation)
      const fileName = `card-${state.selectedCard.id}.${exportSettings.format}`;
      
      toast.success(`Exported ${fileName} successfully!`);
      
      // In a real implementation, this would trigger the actual download
      console.log('Export settings:', exportSettings);
      console.log('Card data:', state.selectedCard);
      
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast.success('Recording started');
    
    // Auto-stop after duration
    setTimeout(() => {
      setIsRecording(false);
      toast.success('Recording completed');
    }, exportSettings.duration * 1000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.success('Recording stopped');
  };

  const applyResolutionPreset = (preset: { width: number; height: number }) => {
    setExportSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height
    }));
  };

  return (
    <div className="w-80 bg-crd-dark border-l border-crd-border h-full overflow-y-auto">
      <div className="p-4 border-b border-crd-border">
        <h2 className="text-crd-text text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Format Selection */}
        <div>
          <Label className="text-sm font-medium text-crd-text mb-3 block">Format</Label>
          <div className="grid gap-2">
            {formatOptions.map(option => (
              <Card
                key={option.value}
                className={`p-3 cursor-pointer transition-colors ${
                  exportSettings.format === option.value
                    ? 'bg-crd-accent/20 border-crd-accent'
                    : 'bg-crd-darker border-crd-border hover:bg-crd-darker/80'
                }`}
                onClick={() => setExportSettings(prev => ({ ...prev, format: option.value as any }))}
              >
                <div className="flex items-center gap-3">
                  <option.icon className="w-4 h-4 text-crd-accent" />
                  <div>
                    <div className="text-sm font-medium text-crd-text">{option.label}</div>
                    <div className="text-xs text-crd-text-secondary">{option.description}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Resolution */}
        {!is3DFormat && (
          <div>
            <Label className="text-sm font-medium text-crd-text mb-2 block">Resolution</Label>
            <Select onValueChange={(value) => {
              const preset = resolutionPresets.find(p => `${p.width}x${p.height}` === value);
              if (preset) applyResolutionPreset(preset);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={`${exportSettings.width}x${exportSettings.height}`} />
              </SelectTrigger>
              <SelectContent>
                {resolutionPresets.map(preset => (
                  <SelectItem key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-crd-text-secondary">Width</Label>
                <input
                  type="number"
                  value={exportSettings.width}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 1920 }))}
                  className="w-full px-2 py-1 text-sm bg-crd-darker border border-crd-border rounded"
                />
              </div>
              <div>
                <Label className="text-xs text-crd-text-secondary">Height</Label>
                <input
                  type="number"
                  value={exportSettings.height}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 1080 }))}
                  className="w-full px-2 py-1 text-sm bg-crd-darker border border-crd-border rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quality */}
        {!is3DFormat && (
          <div>
            <Label className="text-sm text-crd-text">Quality: {exportSettings.quality}%</Label>
            <Slider
              value={[exportSettings.quality]}
              onValueChange={([value]) => setExportSettings(prev => ({ ...prev, quality: value }))}
              max={100}
              min={10}
              step={10}
              className="mt-2"
            />
          </div>
        )}

        {/* Video/GIF Settings */}
        {isVideoFormat && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-crd-text">Duration: {exportSettings.duration}s</Label>
              <Slider
                value={[exportSettings.duration]}
                onValueChange={([value]) => setExportSettings(prev => ({ ...prev, duration: value }))}
                max={30}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm text-crd-text">Frame Rate: {exportSettings.frameRate} fps</Label>
              <Slider
                value={[exportSettings.frameRate]}
                onValueChange={([value]) => setExportSettings(prev => ({ ...prev, frameRate: value }))}
                max={60}
                min={12}
                step={6}
                className="mt-2"
              />
            </div>

            {/* Recording Controls */}
            <Card className="p-3 bg-crd-darker border-crd-border">
              <Label className="text-sm font-medium text-crd-text mb-2 block">Record Animation</Label>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    size="sm"
                    onClick={handleStartRecording}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleStopRecording}
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Stop Recording
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRecording(false)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              {isRecording && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-500">Recording...</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Options */}
        {!is3DFormat && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-crd-text">Options</Label>
            
            {['png', 'gif', 'webm'].includes(exportSettings.format) && (
              <div className="flex items-center justify-between">
                <Label className="text-sm text-crd-text">Transparent Background</Label>
                <Switch
                  checked={exportSettings.transparent}
                  onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, transparent: checked }))}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label className="text-sm text-crd-text">Include Environment</Label>
              <Switch
                checked={exportSettings.includeBackground}
                onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeBackground: checked }))}
              />
            </div>
          </div>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <Label className="text-sm text-crd-text">Exporting...</Label>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-xs text-crd-text-secondary text-center">{exportProgress}% complete</p>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || !state.selectedCard}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Settings className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export {exportSettings.format.toUpperCase()}
            </>
          )}
        </Button>

        {!state.selectedCard && (
          <p className="text-xs text-crd-text-secondary text-center">
            Select a card or apply a template to enable export
          </p>
        )}
      </div>
    </div>
  );
};