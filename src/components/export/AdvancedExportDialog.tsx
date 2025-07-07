import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Image, 
  FileText, 
  Printer, 
  Share2, 
  Settings, 
  CheckCircle,
  Loader2,
  Monitor,
  Smartphone,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  description: string;
  maxResolution: number;
  supportsTransparency: boolean;
}

interface ExportPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  format: string;
  resolution: { width: number; height: number };
  quality: number;
  description: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    icon: <Image className="w-4 h-4" />,
    description: 'High quality with transparency',
    maxResolution: 8192,
    supportsTransparency: true
  },
  {
    id: 'jpg',
    name: 'JPEG',
    extension: 'jpg',
    icon: <Image className="w-4 h-4" />,
    description: 'Smaller file size, good for sharing',
    maxResolution: 8192,
    supportsTransparency: false
  },
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    icon: <FileText className="w-4 h-4" />,
    description: 'Print-ready with vector elements',
    maxResolution: 0, // Vector format
    supportsTransparency: true
  },
  {
    id: 'webp',
    name: 'WebP',
    extension: 'webp',
    icon: <Image className="w-4 h-4" />,
    description: 'Modern format, smaller file size',
    maxResolution: 4096,
    supportsTransparency: true
  }
];

const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'desktop-wallpaper',
    name: 'Desktop Wallpaper',
    icon: <Monitor className="w-4 h-4" />,
    format: 'png',
    resolution: { width: 1920, height: 1080 },
    quality: 95,
    description: '1920×1080 PNG for desktop backgrounds'
  },
  {
    id: 'mobile-wallpaper',
    name: 'Mobile Wallpaper',
    icon: <Smartphone className="w-4 h-4" />,
    format: 'png',
    resolution: { width: 1080, height: 1920 },
    quality: 90,
    description: '1080×1920 PNG for mobile backgrounds'
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    icon: <Instagram className="w-4 h-4" />,
    format: 'jpg',
    resolution: { width: 1080, height: 1080 },
    quality: 85,
    description: '1080×1080 square format'
  },
  {
    id: 'twitter-header',
    name: 'Twitter Header',
    icon: <Twitter className="w-4 h-4" />,
    format: 'jpg',
    resolution: { width: 1500, height: 500 },
    quality: 85,
    description: '1500×500 header format'
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    icon: <Facebook className="w-4 h-4" />,
    format: 'jpg',
    resolution: { width: 1200, height: 630 },
    quality: 85,
    description: '1200×630 cover format'
  },
  {
    id: 'print-ready',
    name: 'Print Ready',
    icon: <Printer className="w-4 h-4" />,
    format: 'pdf',
    resolution: { width: 3508, height: 4961 }, // A4 at 300 DPI
    quality: 100,
    description: 'High-res PDF with bleed margins'
  }
];

interface AdvancedExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: any;
  onExport: (options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  format: string;
  resolution: { width: number; height: number };
  quality: number;
  includeEffects: boolean;
  includeWatermark: boolean;
  backgroundColor: string;
  dpi: number;
  bleedMargin: number;
}

export const AdvancedExportDialog: React.FC<AdvancedExportDialogProps> = ({
  isOpen,
  onClose,
  cardData,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [customResolution, setCustomResolution] = useState({ width: 2048, height: 2867 });
  const [quality, setQuality] = useState(90);
  const [includeEffects, setIncludeEffects] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [dpi, setDpi] = useState(300);
  const [bleedMargin, setBleedMargin] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('quick');

  const handlePresetSelect = (preset: ExportPreset) => {
    setSelectedFormat(preset.format);
    setCustomResolution(preset.resolution);
    setQuality(preset.quality);
    toast.success(`Applied ${preset.name} preset`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const exportOptions: ExportOptions = {
        format: selectedFormat,
        resolution: customResolution,
        quality,
        includeEffects,
        includeWatermark,
        backgroundColor,
        dpi,
        bleedMargin
      };

      await onExport(exportOptions);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
        toast.success('Card exported successfully!');
      }, 1000);

    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
      toast.error('Export failed. Please try again.');
    }
  };

  const selectedFormatData = EXPORT_FORMATS.find(f => f.id === selectedFormat);
  const estimatedFileSize = Math.round((customResolution.width * customResolution.height * (quality / 100) * 3) / 1024 / 1024);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Advanced Export Options
          </DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <div className="py-8">
            <div className="text-center mb-6">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-crd-green" />
              <h3 className="text-lg font-semibold mb-2">Exporting Your Card</h3>
              <p className="text-muted-foreground">
                Processing at {customResolution.width}×{customResolution.height} resolution...
              </p>
            </div>
            <Progress value={exportProgress} className="w-full mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              {exportProgress}% complete
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Export</TabsTrigger>
              <TabsTrigger value="custom">Custom Settings</TabsTrigger>
              <TabsTrigger value="batch">Batch Export</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EXPORT_PRESETS.map((preset) => (
                  <Card 
                    key={preset.id}
                    className="cursor-pointer hover:border-crd-green/50 transition-colors"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {preset.icon}
                        <span className="font-medium text-sm">{preset.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {preset.description}
                      </p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {preset.format.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {preset.resolution.width}×{preset.resolution.height}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Format Settings
                  </h3>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Export Format</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPORT_FORMATS.map((format) => (
                        <Card 
                          key={format.id}
                          className={`cursor-pointer transition-colors ${
                            selectedFormat === format.id 
                              ? 'border-crd-green bg-crd-green/10' 
                              : 'hover:border-crd-green/50'
                          }`}
                          onClick={() => setSelectedFormat(format.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              {format.icon}
                              <span className="font-medium text-sm">{format.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Width (px)</Label>
                      <input
                        type="number"
                        value={customResolution.width}
                        onChange={(e) => setCustomResolution(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Height (px)</Label>
                      <input
                        type="number"
                        value={customResolution.height}
                        onChange={(e) => setCustomResolution(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      />
                    </div>
                  </div>

                  {selectedFormat !== 'pdf' && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Quality: {quality}%
                      </Label>
                      <Slider
                        value={[quality]}
                        onValueChange={([value]) => setQuality(value)}
                        min={1}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Advanced Options</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Include 3D Effects</Label>
                      <Switch
                        checked={includeEffects}
                        onCheckedChange={setIncludeEffects}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Add Watermark</Label>
                      <Switch
                        checked={includeWatermark}
                        onCheckedChange={setIncludeWatermark}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Background</Label>
                      <Select value={backgroundColor} onValueChange={setBackgroundColor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transparent">Transparent</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="custom">Custom Color</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFormat === 'pdf' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            DPI: {dpi}
                          </Label>
                          <Slider
                            value={[dpi]}
                            onValueChange={([value]) => setDpi(value)}
                            min={72}
                            max={600}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Bleed Margin: {bleedMargin}px
                          </Label>
                          <Slider
                            value={[bleedMargin]}
                            onValueChange={([value]) => setBleedMargin(value)}
                            min={0}
                            max={50}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Resolution: {customResolution.width} × {customResolution.height}</p>
                      <p>Format: {selectedFormatData?.name}</p>
                      <p>Estimated size: ~{estimatedFileSize}MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="text-center py-8">
                <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Batch Export</h3>
                <p className="text-muted-foreground mb-4">
                  Export multiple cards or variations at once
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!isExporting && (
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-crd-green hover:bg-crd-green/90">
              <Download className="w-4 h-4 mr-2" />
              Export Card
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};