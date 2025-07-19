import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Download, 
  Film, 
  Image, 
  Smartphone, 
  Monitor, 
  Instagram,
  FileVideo,
  FileImage,
  Settings,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ExportOptions {
  format: 'mp4' | 'gif' | 'webm' | 'png-sequence' | 'jpg-sequence';
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  resolution: string;
  frameRate: number;
  compression: number;
  includeAudio: boolean;
  transparentBackground: boolean;
  startTime: number;
  endTime: number;
  socialOptimized: boolean;
  watermark: boolean;
}

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  options: Partial<ExportOptions>;
}

interface ExportPanelProps {
  duration: number;
  frameRate: number;
  onExport: (format: string, options: ExportOptions) => void;
  onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  duration,
  frameRate,
  onExport,
  onClose
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp4',
    quality: 'high',
    resolution: '1920x1080',
    frameRate: frameRate,
    compression: 80,
    includeAudio: false,
    transparentBackground: false,
    startTime: 0,
    endTime: duration,
    socialOptimized: false,
    watermark: true
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const exportPresets: ExportPreset[] = [
    {
      id: 'social-instagram',
      name: 'Instagram Story',
      description: '9:16 aspect ratio, optimized for Instagram',
      icon: Instagram,
      options: {
        format: 'mp4',
        quality: 'high',
        resolution: '1080x1920',
        frameRate: 30,
        socialOptimized: true,
        compression: 85
      }
    },
    {
      id: 'social-tiktok',
      name: 'TikTok/Reels',
      description: 'Vertical format for short-form content',
      icon: Smartphone,
      options: {
        format: 'mp4',
        quality: 'high',
        resolution: '1080x1920',
        frameRate: 30,
        socialOptimized: true,
        compression: 90
      }
    },
    {
      id: 'desktop-hd',
      name: 'Desktop HD',
      description: 'Full HD for desktop viewing',
      icon: Monitor,
      options: {
        format: 'mp4',
        quality: 'ultra',
        resolution: '1920x1080',
        frameRate: 60,
        compression: 70
      }
    },
    {
      id: 'gif-loop',
      name: 'Animated GIF',
      description: 'Looping GIF for web use',
      icon: Image,
      options: {
        format: 'gif',
        quality: 'standard',
        resolution: '800x600',
        frameRate: 24,
        compression: 90
      }
    },
    {
      id: 'png-sequence',
      name: 'PNG Sequence',
      description: 'Individual frames for compositing',
      icon: FileImage,
      options: {
        format: 'png-sequence',
        quality: 'ultra',
        resolution: '2048x2048',
        transparentBackground: true
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Highest quality for final delivery',
      icon: Film,
      options: {
        format: 'mp4',
        quality: 'ultra',
        resolution: '3840x2160',
        frameRate: 60,
        compression: 50,
        watermark: false
      }
    }
  ];

  const resolutionOptions = [
    { value: '854x480', label: '480p (SD)' },
    { value: '1280x720', label: '720p (HD)' },
    { value: '1920x1080', label: '1080p (Full HD)' },
    { value: '2560x1440', label: '1440p (2K)' },
    { value: '3840x2160', label: '2160p (4K)' },
    { value: '1080x1920', label: '1080x1920 (Vertical)' },
    { value: '1080x1080', label: '1080x1080 (Square)' }
  ];

  const qualitySettings = {
    draft: { bitrate: '2 Mbps', description: 'Fast preview quality' },
    standard: { bitrate: '5 Mbps', description: 'Good for web sharing' },
    high: { bitrate: '10 Mbps', description: 'Recommended quality' },
    ultra: { bitrate: '25 Mbps', description: 'Maximum quality' }
  };

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: ExportPreset) => {
    setExportOptions(prev => ({ ...prev, ...preset.options }));
  };

  const calculateFileSize = (): string => {
    const { resolution, frameRate, quality, format } = exportOptions;
    const [width, height] = resolution.split('x').map(Number);
    const pixels = width * height;
    const durationSeconds = exportOptions.endTime - exportOptions.startTime;
    
    let estimatedMB = 0;
    
    if (format === 'mp4' || format === 'webm') {
      const qualityMultiplier = {
        draft: 0.1,
        standard: 0.25,
        high: 0.5,
        ultra: 1.0
      }[quality];
      
      estimatedMB = (pixels * frameRate * durationSeconds * qualityMultiplier) / (8 * 1024 * 1024);
    } else if (format === 'gif') {
      estimatedMB = (pixels * frameRate * durationSeconds * 0.1) / (1024 * 1024);
    } else {
      // PNG/JPG sequence
      const frames = Math.floor(durationSeconds * frameRate);
      const bytesPerPixel = format === 'png-sequence' ? 4 : 3;
      estimatedMB = (pixels * bytesPerPixel * frames) / (1024 * 1024);
    }
    
    if (estimatedMB < 1) {
      return `${Math.round(estimatedMB * 1024)} KB`;
    } else if (estimatedMB < 1024) {
      return `${Math.round(estimatedMB)} MB`;
    } else {
      return `${(estimatedMB / 1024).toFixed(1)} GB`;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('processing');
    setExportProgress(0);
    
    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setExportStatus('complete');
          setIsExporting(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Calculate estimated time
    const baseTime = (exportOptions.endTime - exportOptions.startTime) * 2;
    const qualityMultiplier = {
      draft: 0.5,
      standard: 1,
      high: 2,
      ultra: 4
    }[exportOptions.quality];
    
    setEstimatedTime(baseTime * qualityMultiplier);
    
    try {
      // Call the actual export function
      onExport(exportOptions.format, exportOptions);
    } catch (error) {
      setExportStatus('error');
      setIsExporting(false);
      clearInterval(progressInterval);
    }
  };

  return (
    <Card className="h-96 bg-crd-dark border-crd-border border-t-0">
      <div className="flex h-full">
        {/* Presets Sidebar */}
        <div className="w-64 border-r border-crd-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Export Presets</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {exportPresets.map(preset => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="w-full h-auto p-3 flex flex-col items-start"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex items-center gap-2 w-full mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{preset.name}</span>
                  </div>
                  <p className="text-xs text-crd-text-secondary text-left">
                    {preset.description}
                  </p>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Export Settings */}
        <div className="flex-1 p-4">
          <Tabs defaultValue="format" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">Format & Quality</TabsTrigger>
              <TabsTrigger value="timing">Timing & Range</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <Select value={exportOptions.format} onValueChange={(value: any) => updateOption('format', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4 Video</SelectItem>
                      <SelectItem value="webm">WebM Video</SelectItem>
                      <SelectItem value="gif">Animated GIF</SelectItem>
                      <SelectItem value="png-sequence">PNG Sequence</SelectItem>
                      <SelectItem value="jpg-sequence">JPG Sequence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quality</label>
                  <Select value={exportOptions.quality} onValueChange={(value: any) => updateOption('quality', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft ({qualitySettings.draft.bitrate})</SelectItem>
                      <SelectItem value="standard">Standard ({qualitySettings.standard.bitrate})</SelectItem>
                      <SelectItem value="high">High ({qualitySettings.high.bitrate})</SelectItem>
                      <SelectItem value="ultra">Ultra ({qualitySettings.ultra.bitrate})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resolution</label>
                  <Select value={exportOptions.resolution} onValueChange={(value) => updateOption('resolution', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Frame Rate</label>
                  <Select 
                    value={exportOptions.frameRate.toString()} 
                    onValueChange={(value) => updateOption('frameRate', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                      <SelectItem value="120">120 fps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Compression: {exportOptions.compression}%
                </label>
                <Slider
                  value={[exportOptions.compression]}
                  onValueChange={([value]) => updateOption('compression', value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="p-3 bg-crd-darkest rounded-lg">
                <div className="text-sm font-medium mb-1">Export Estimate</div>
                <div className="text-xs text-crd-text-secondary">
                  <div>File Size: {calculateFileSize()}</div>
                  <div>Quality: {qualitySettings[exportOptions.quality].description}</div>
                  {estimatedTime > 0 && (
                    <div>Estimated Time: {Math.ceil(estimatedTime)} seconds</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Export Range</label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-crd-text-secondary">Start Time: {exportOptions.startTime.toFixed(2)}s</label>
                    <Slider
                      value={[exportOptions.startTime]}
                      onValueChange={([value]) => updateOption('startTime', value)}
                      min={0}
                      max={duration}
                      step={0.1}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-crd-text-secondary">End Time: {exportOptions.endTime.toFixed(2)}s</label>
                    <Slider
                      value={[exportOptions.endTime]}
                      onValueChange={([value]) => updateOption('endTime', value)}
                      min={exportOptions.startTime}
                      max={duration}
                      step={0.1}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-crd-darkest rounded-lg">
                <div className="text-sm font-medium mb-1">
                  Export Duration: {(exportOptions.endTime - exportOptions.startTime).toFixed(2)}s
                </div>
                <div className="text-xs text-crd-text-secondary">
                  Total Frames: {Math.floor((exportOptions.endTime - exportOptions.startTime) * exportOptions.frameRate)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transparent"
                    checked={exportOptions.transparentBackground}
                    onCheckedChange={(checked) => updateOption('transparentBackground', checked as boolean)}
                  />
                  <label htmlFor="transparent" className="text-sm">Transparent Background</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="audio"
                    checked={exportOptions.includeAudio}
                    onCheckedChange={(checked) => updateOption('includeAudio', checked as boolean)}
                  />
                  <label htmlFor="audio" className="text-sm">Include Audio</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="social"
                    checked={exportOptions.socialOptimized}
                    onCheckedChange={(checked) => updateOption('socialOptimized', checked as boolean)}
                  />
                  <label htmlFor="social" className="text-sm">Social Media Optimization</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="watermark"
                    checked={exportOptions.watermark}
                    onCheckedChange={(checked) => updateOption('watermark', checked as boolean)}
                  />
                  <label htmlFor="watermark" className="text-sm">Add Watermark</label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Controls */}
          <div className="absolute bottom-4 right-4 left-80">
            {exportStatus === 'processing' && (
              <div className="mb-4 p-3 bg-crd-darkest rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Exporting...</span>
                </div>
                <Progress value={exportProgress} className="w-full" />
                <div className="text-xs text-crd-text-secondary mt-1">
                  {exportProgress.toFixed(0)}% complete
                </div>
              </div>
            )}

            {exportStatus === 'complete' && (
              <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Export completed successfully!</span>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Export failed. Please try again.</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Start Export'}
              </Button>
              
              {isExporting && (
                <Button variant="outline" onClick={() => setIsExporting(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};