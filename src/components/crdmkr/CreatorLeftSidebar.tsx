import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Upload, Image, Layers, FileImage, Search, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
interface CreatorLeftSidebarProps {
  isOpen: boolean;
  selectedFrame: string;
  uploadedImage?: string;
  onFrameSelect: (frameId: string) => void;
  onImageUpload: (imageUrl: string) => void;
}
const frameTemplates = [{
  id: 'classic-sports',
  name: 'Classic Sports',
  category: 'Sports',
  popular: true,
  preview: '🏈'
}, {
  id: 'modern-holographic',
  name: 'Holographic',
  category: 'Premium',
  popular: true,
  preview: '✨'
}, {
  id: 'vintage-ornate',
  name: 'Vintage Ornate',
  category: 'Vintage',
  popular: false,
  preview: '🎭'
}, {
  id: 'chrome-edition',
  name: 'Chrome Edition',
  category: 'Premium',
  popular: true,
  preview: '⚡'
}, {
  id: 'donruss-rookie',
  name: 'Donruss Rookie',
  category: 'Sports',
  popular: false,
  preview: '🌟'
}, {
  id: 'minimal-modern',
  name: 'Minimal Modern',
  category: 'Modern',
  popular: false,
  preview: '📱'
}];
const templateCategories = [{
  id: 'popular',
  name: 'Popular',
  icon: TrendingUp
}, {
  id: 'sports',
  name: 'Sports',
  icon: Star
}, {
  id: 'premium',
  name: 'Premium',
  icon: Layers
}, {
  id: 'vintage',
  name: 'Vintage',
  icon: FileImage
}];
export const CreatorLeftSidebar: React.FC<CreatorLeftSidebarProps> = ({
  isOpen,
  selectedFrame,
  uploadedImage,
  onFrameSelect,
  onImageUpload
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [uploadOpen, setUploadOpen] = useState(true);
  const [framesOpen, setFramesOpen] = useState(true);
  const filteredFrames = frameTemplates.filter(frame => {
    const matchesSearch = frame.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'popular' ? frame.popular : frame.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    // Create object URL for immediate preview
    const objectUrl = URL.createObjectURL(file);
    onImageUpload(objectUrl);
  };

  const handleBrowseClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    };
    input.click();
  };
  if (!isOpen) {
    return <div className="w-14 flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Upload className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Layers className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <FileImage className="h-5 w-5" />
        </Button>
      </div>;
  }
  return <div className="w-80 flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Design Tools</h2>
        <p className="text-sm text-muted-foreground">Upload images and select frames</p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 pb-4">
          {/* Upload Section */}
          <Collapsible open={uploadOpen} onOpenChange={setUploadOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">Upload Image</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className={cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors", "hover:border-crd-orange/50 hover:bg-crd-orange/5", uploadedImage ? "border-crd-green/50 bg-crd-green/5" : "border-border")} onDrop={handleImageDrop} onDragOver={e => e.preventDefault()}>
                {uploadedImage ? <div className="space-y-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-crd-green/20 to-crd-blue/20 rounded-lg mx-auto flex items-center justify-center">
                      <Image className="h-8 w-8 text-crd-green" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Image Uploaded</p>
                    <Button size="sm" variant="outline" onClick={() => onImageUpload('')}>
                      Change Image
                    </Button>
                  </div> : <div className="space-y-3">
                    <div className="w-20 h-20 bg-muted rounded-lg mx-auto flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Drop image here</p>
                      <p className="text-xs text-muted-foreground">or click to browse</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleBrowseClick}>
                      Browse Files
                    </Button>
                  </div>}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Frame Selection */}
          <Collapsible open={framesOpen} onOpenChange={setFramesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="font-medium">CRD Frames</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search frames..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 gap-2">
                {templateCategories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category.id)} className="justify-start gap-2">
                    <category.icon className="h-3 w-3" />
                    {category.name}
                  </Button>)}
              </div>

              {/* Frame Grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredFrames.map(frame => <div key={frame.id} className={cn("relative aspect-[2/3] rounded-lg border-2 cursor-pointer transition-all group overflow-hidden", selectedFrame === frame.id ? "border-crd-orange shadow-lg shadow-crd-orange/20" : "border-border hover:border-crd-orange/50")} onClick={() => onFrameSelect(frame.id)}>
                    {/* Frame Preview */}
                    <div className="w-full h-full bg-gradient-to-br from-background to-card flex items-center justify-center text-2xl">
                      {frame.preview}
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-white truncate">{frame.name}</p>
                          <p className="text-xs text-white/70">{frame.category}</p>
                        </div>
                        {frame.popular && <Badge variant="secondary" className="h-4 px-1 text-xs">
                            <Star className="h-2 w-2" />
                          </Badge>}
                      </div>
                    </div>
                  </div>)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>;
};