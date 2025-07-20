import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Download, 
  Image, 
  Video, 
  Printer, 
  Globe, 
  Share2,
  Settings,
  FileImage,
  Film,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportFormat {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  formats: string[];
  quality?: string[];
  sizes?: string[];
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'image',
    name: 'Static Image',
    icon: FileImage,
    description: 'High-quality still images',
    formats: ['PNG', 'JPEG', 'WebP', 'SVG'],
    quality: ['Draft', 'Standard', 'High', 'Ultra'],
    sizes: ['Original', '1920x1080', '1080x1080', '1200x1600', 'Custom']
  },
  {
    id: 'animation',
    name: 'Animation',
    icon: Film,
    description: 'Animated sequences',
    formats: ['MP4', 'WebM', 'GIF', 'APNG'],
    quality: ['Draft', 'Standard', 'High', 'Ultra'],
    sizes: ['720p', '1080p', '1440p', '4K']
  },
  {
    id: 'print',
    name: 'Print Ready',
    icon: Package,
    description: 'Physical printing formats',
    formats: ['PDF', 'TIFF', 'PNG (300DPI)'],
    quality: ['Standard', 'Premium', 'Professional'],
    sizes: ['Poker Size', 'Bridge Size', 'Tarot Size', 'Custom']
  }
];

export const ExportPanel: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const [exportSettings, setExportSettings] = useState({
    format: 'PNG',
    quality: 'High',
    size: 'Original',
    transparent: false,
    includeEffects: true,
    includeAnimation: true,
    frameRate: 60,
    duration: 5
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    toast.success(`${selectedFormat.name} export completed!`);
  };

  const handleQuickShare = (platform: string) => {
    toast.success(`Sharing to ${platform}...`);
  };

  const getFileSizeEstimate = () => {
    const baseSize = selectedFormat.id === 'animation' ? 5.2 : 2.1;
    const qualityMultiplier = exportSettings.quality === 'Ultra' ? 2.5 : 
                            exportSettings.quality === 'High' ? 1.5 : 1;
    return (baseSize * qualityMultiplier).toFixed(1);
  };

  return (
    <div className="w-80 bg-crd-dark border-l border-crd-border h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-crd-border">
        <h2 className="text-crd-text text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-crd-darker">
            <TabsTrigger value="export" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export
            </TabsTrigger>
            <TabsTrigger value="share" className="text-xs">
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="p-4 space-y-4">
            {/* Format Selection */}
            <div>
              <Label className="text-sm font-medium text-crd-text mb-3 block">Export Format</Label>
              <div className="space-y-2">
                {EXPORT_FORMATS.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Card
                      key={format.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedFormat.id === format.id 
                          ? 'bg-crd-accent/20 border-crd-accent' 
                          : 'bg-crd-darkest border-crd-border hover:border-crd-accent/50'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-crd-accent" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-crd-text">{format.name}</div>
                          <div className="text-xs text-crd-text-secondary">{format.description}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Format Options */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-crd-text">File Format</Label>
                <Select 
                  value={exportSettings.format} 
                  onValueChange={(value) => setExportSettings(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFormat.formats.map(format => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-crd-text">Quality</Label>
                <Select 
                  value={exportSettings.quality} 
                  onValueChange={(value) => setExportSettings(prev => ({ ...prev, quality: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFormat.quality?.map(quality => (
                      <SelectItem key={quality} value={quality}>
                        {quality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-crd-text">Size</Label>
                <Select 
                  value={exportSettings.size} 
                  onValueChange={(value) => setExportSettings(prev => ({ ...prev, size: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFormat.sizes?.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3 border-t border-crd-border pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-crd-text">Transparent Background</Label>
                  <Switch
                    checked={exportSettings.transparent}
                    onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, transparent: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-crd-text">Include Effects</Label>
                  <Switch
                    checked={exportSettings.includeEffects}
                    onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeEffects: checked }))}
                  />
                </div>

                {selectedFormat.id === 'animation' && (
                  <>
                    <div>
                      <Label className="text-sm text-crd-text">Frame Rate: {exportSettings.frameRate} FPS</Label>
                      <Slider
                        value={[exportSettings.frameRate]}
                        onValueChange={([value]) => setExportSettings(prev => ({ ...prev, frameRate: value }))}
                        max={120}
                        min={24}
                        step={6}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-crd-text">Duration: {exportSettings.duration}s</Label>
                      <Slider
                        value={[exportSettings.duration]}
                        onValueChange={([value]) => setExportSettings(prev => ({ ...prev, duration: value }))}
                        max={30}
                        min={1}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* File Size Estimate */}
              <Card className="p-3 bg-crd-darkest border-crd-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-crd-text-secondary">Estimated Size:</span>
                  <Badge variant="outline">{getFileSizeEstimate()} MB</Badge>
                </div>
              </Card>

              {/* Export Button */}
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {selectedFormat.name}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-crd-text mb-3 block">Quick Share</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleQuickShare('Twitter')}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleQuickShare('Instagram')}
                >
                  <Image className="w-5 h-5" />
                  <span className="text-xs">Instagram</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleQuickShare('Discord')}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs">Discord</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleQuickShare('Gallery')}
                >
                  <Printer className="w-5 h-5" />
                  <span className="text-xs">Gallery</span>
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-crd-text mb-3 block">Public Link</Label>
              <Card className="p-3 bg-crd-darkest border-crd-border">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="https://cardshow.io/studio/share/abc123" 
                    readOnly
                    className="flex-1 bg-transparent text-sm text-crd-text-secondary border-none outline-none"
                  />
                  <Button size="sm" variant="outline">
                    Copy
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              <Label className="text-sm font-medium text-crd-text mb-3 block">Embed Code</Label>
              <Card className="p-3 bg-crd-darkest border-crd-border">
                <textarea 
                  value='<iframe src="https://cardshow.io/embed/abc123" width="400" height="560"></iframe>'
                  readOnly
                  className="w-full h-20 bg-transparent text-xs text-crd-text-secondary border-none outline-none resize-none"
                />
                <Button size="sm" variant="outline" className="mt-2">
                  Copy Embed Code
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};