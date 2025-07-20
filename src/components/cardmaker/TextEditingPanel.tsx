import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Type, Plus, Trash2, Eye, EyeOff, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, Palette 
} from 'lucide-react';
import { toast } from 'sonner';

interface TextElement {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  layer: number;
}

interface TextEditingPanelProps {
  elements: TextElement[];
  selectedElement?: string;
  onAddElement: (element: Omit<TextElement, 'id'>) => void;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  onDeleteElement: (id: string) => void;
  onSelectElement: (id: string) => void;
}

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Playfair Display',
  'Oswald', 'Lato', 'Source Sans Pro', 'Raleway', 'Poppins',
  'Merriweather', 'Dancing Script', 'Bebas Neue', 'Nunito Sans'
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' }
];

const TEXT_PRESETS = [
  {
    name: 'Card Title',
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff'
  },
  {
    name: 'Subtitle',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb'
  },
  {
    name: 'Body Text',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    color: '#d1d5db'
  },
  {
    name: 'Accent Text',
    fontFamily: 'Playfair Display',
    fontSize: 18,
    fontWeight: '600',
    color: '#fbbf24'
  }
];

export const TextEditingPanel: React.FC<TextEditingPanelProps> = ({
  elements,
  selectedElement,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onSelectElement
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'presets'>('add');
  
  const selectedElementData = elements.find(el => el.id === selectedElement);

  const addTextElement = useCallback((preset?: typeof TEXT_PRESETS[0]) => {
    const newElement: Omit<TextElement, 'id'> = {
      content: preset ? 'Sample Text' : 'New Text',
      fontFamily: preset?.fontFamily || 'Inter',
      fontSize: preset?.fontSize || 16,
      fontWeight: preset?.fontWeight || '400',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: preset?.color || '#ffffff',
      textAlign: 'left',
      x: 50,
      y: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      layer: elements.length
    };
    
    onAddElement(newElement);
    toast.success('Text element added');
  }, [elements.length, onAddElement]);

  const updateSelectedElement = useCallback((updates: Partial<TextElement>) => {
    if (selectedElement) {
      onUpdateElement(selectedElement, updates);
    }
  }, [selectedElement, onUpdateElement]);

  const toggleBold = () => {
    const newWeight = selectedElementData?.fontWeight === '700' ? '400' : '700';
    updateSelectedElement({ fontWeight: newWeight });
  };

  const toggleItalic = () => {
    const newStyle = selectedElementData?.fontStyle === 'italic' ? 'normal' : 'italic';
    updateSelectedElement({ fontStyle: newStyle });
  };

  const toggleUnderline = () => {
    const newDecoration = selectedElementData?.textDecoration === 'underline' ? 'none' : 'underline';
    updateSelectedElement({ textDecoration: newDecoration });
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === 'add' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('add')}
          className="flex-1"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
        <Button
          variant={activeTab === 'edit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('edit')}
          className="flex-1"
          disabled={!selectedElement}
        >
          <Type className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          variant={activeTab === 'presets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('presets')}
          className="flex-1"
        >
          <Palette className="w-3 h-3 mr-1" />
          Presets
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Add text elements to your card
          </div>
          
          <Button
            onClick={() => addTextElement()}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Text Element
          </Button>

          <div className="text-xs text-muted-foreground">
            💡 Click on text elements in the preview to select and edit them
          </div>
        </div>
      )}

      {activeTab === 'edit' && selectedElementData && (
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {/* Content */}
            <div>
              <Label className="text-sm">Content</Label>
              <Textarea
                value={selectedElementData.content}
                onChange={(e) => updateSelectedElement({ content: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Typography Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Font Family</Label>
                <Select 
                  value={selectedElementData.fontFamily}
                  onValueChange={(value) => updateSelectedElement({ fontFamily: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(font => (
                      <SelectItem key={font} value={font} className="text-xs">
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Weight</Label>
                <Select 
                  value={selectedElementData.fontWeight}
                  onValueChange={(value) => updateSelectedElement({ fontWeight: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map(weight => (
                      <SelectItem key={weight.value} value={weight.value} className="text-xs">
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Style Controls */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={selectedElementData.fontWeight === '700' ? 'default' : 'outline'}
                onClick={toggleBold}
                className="flex-1"
              >
                <Bold className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant={selectedElementData.fontStyle === 'italic' ? 'default' : 'outline'}
                onClick={toggleItalic}
                className="flex-1"
              >
                <Italic className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant={selectedElementData.textDecoration === 'underline' ? 'default' : 'outline'}
                onClick={toggleUnderline}
                className="flex-1"
              >
                <Underline className="w-3 h-3" />
              </Button>
            </div>

            {/* Alignment */}
            <div>
              <Label className="text-xs">Alignment</Label>
              <div className="flex gap-1 mt-1">
                <Button
                  size="sm"
                  variant={selectedElementData.textAlign === 'left' ? 'default' : 'outline'}
                  onClick={() => updateSelectedElement({ textAlign: 'left' })}
                  className="flex-1"
                >
                  <AlignLeft className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElementData.textAlign === 'center' ? 'default' : 'outline'}
                  onClick={() => updateSelectedElement({ textAlign: 'center' })}
                  className="flex-1"
                >
                  <AlignCenter className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElementData.textAlign === 'right' ? 'default' : 'outline'}
                  onClick={() => updateSelectedElement({ textAlign: 'right' })}
                  className="flex-1"
                >
                  <AlignRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Size and Color */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Size</Label>
                <Slider
                  value={[selectedElementData.fontSize]}
                  onValueChange={([value]) => updateSelectedElement({ fontSize: value })}
                  min={8}
                  max={72}
                  step={1}
                  className="mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedElementData.fontSize}px
                </div>
              </div>

              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  type="color"
                  value={selectedElementData.color}
                  onChange={(e) => updateSelectedElement({ color: e.target.value })}
                  className="h-8 mt-1"
                />
              </div>
            </div>

            {/* Position and Transform */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X Position</Label>
                <Slider
                  value={[selectedElementData.x]}
                  onValueChange={([value]) => updateSelectedElement({ x: value })}
                  min={0}
                  max={300}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Y Position</Label>
                <Slider
                  value={[selectedElementData.y]}
                  onValueChange={([value]) => updateSelectedElement({ y: value })}
                  min={0}
                  max={400}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Opacity and Rotation */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Opacity</Label>
                <Slider
                  value={[selectedElementData.opacity * 100]}
                  onValueChange={([value]) => updateSelectedElement({ opacity: value / 100 })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Rotation</Label>
                <Slider
                  value={[selectedElementData.rotation]}
                  onValueChange={([value]) => updateSelectedElement({ rotation: value })}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSelectedElement({ visible: !selectedElementData.visible })}
                className="flex-1"
              >
                {selectedElementData.visible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                {selectedElementData.visible ? 'Hide' : 'Show'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onDeleteElement(selectedElementData.id);
                  toast.success('Text element deleted');
                }}
                className="flex-1"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </ScrollArea>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Quick text style presets
          </div>
          
          {TEXT_PRESETS.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => addTextElement(preset)}
              className="w-full h-auto p-3 flex flex-col items-start gap-1"
            >
              <div className="text-sm font-medium">{preset.name}</div>
              <div className="text-xs text-muted-foreground">
                {preset.fontFamily} • {preset.fontSize}px • {FONT_WEIGHTS.find(w => w.value === preset.fontWeight)?.label}
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Elements List */}
      {elements.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm">Text Elements</Label>
            <Badge variant="outline" className="text-xs">{elements.length}</Badge>
          </div>
          
          <ScrollArea className="h-24">
            <div className="space-y-1">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedElement === element.id ? 'bg-primary/10 border-primary' : 'bg-muted border-transparent hover:bg-muted/80'
                  }`}
                  onClick={() => onSelectElement(element.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {element.content || 'Empty Text'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {element.fontFamily} • {element.fontSize}px
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateElement(element.id, { visible: !element.visible });
                      }}
                      className="h-6 w-6 p-0"
                    >
                      {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};