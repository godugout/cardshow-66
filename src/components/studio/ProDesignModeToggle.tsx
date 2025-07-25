import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Layers, Type, Palette, Sparkles } from 'lucide-react';

interface ProDesignModeToggleProps {
  isProMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ProDesignModeToggle: React.FC<ProDesignModeToggleProps> = ({
  isProMode,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-crd-dark/50 border border-crd-border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-crd-orange to-crd-yellow rounded-lg">
          <Zap className="w-5 h-5 text-black" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm">Pro Design Mode</h3>
            {isProMode && (
              <Badge variant="outline" className="text-crd-orange border-crd-orange text-xs">
                ACTIVE
              </Badge>
            )}
          </div>
          <p className="text-crd-text-secondary text-xs">
            {isProMode 
              ? 'Advanced design tools: Free-form text, layer manipulation, custom effects'
              : 'Enable professional-grade design tools and layer controls'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isProMode && (
          <div className="flex items-center gap-1 text-crd-text-secondary">
            <Layers className="w-3 h-3" />
            <Type className="w-3 h-3" />
            <Palette className="w-3 h-3" />
            <Sparkles className="w-3 h-3" />
          </div>
        )}
        <Switch
          checked={isProMode}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-crd-orange"
        />
      </div>
    </div>
  );
};