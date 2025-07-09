import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Settings, Layout, LayoutGrid, LayoutPanelLeft, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
interface CreatorHeaderProps {
  layoutMode: 'dual' | 'single-left' | 'single-right';
  onLayoutModeChange: (mode: 'dual' | 'single-left' | 'single-right') => void;
  onSave: () => void;
  onExport: () => void;
}
export const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  layoutMode,
  onLayoutModeChange,
  onSave,
  onExport
}) => {
  return <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-crd-orange to-crd-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          
        </div>
        
        <Badge variant="secondary" className="ml-2">
          Beta
        </Badge>
      </div>

      {/* Center Section - Layout Controls */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Layout className="h-4 w-4" />
              Layout
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={() => onLayoutModeChange('dual')} className={layoutMode === 'dual' ? 'bg-accent' : ''}>
              <LayoutGrid className="h-4 w-4 mr-2" />
              Dual Sidebar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLayoutModeChange('single-left')} className={layoutMode === 'single-left' ? 'bg-accent' : ''}>
              <LayoutPanelLeft className="h-4 w-4 mr-2" />
              Left Sidebar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLayoutModeChange('single-right')} className={layoutMode === 'single-right' ? 'bg-accent' : ''}>
              <Monitor className="h-4 w-4 mr-2" />
              Right Sidebar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
        
        <Button size="sm" onClick={onExport} className="gap-2 bg-gradient-to-r from-crd-orange to-crd-green hover:opacity-90">
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>;
};