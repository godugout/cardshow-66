import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Users, CheckCircle } from 'lucide-react';

interface PSDStudioModeSelectorProps {
  selectedMode: 'beginner' | 'advanced' | 'bulk';
  onModeChange: (mode: 'beginner' | 'advanced' | 'bulk') => void;
}

export const PSDStudioModeSelector: React.FC<PSDStudioModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  const modes = [
    {
      id: 'beginner' as const,
      name: 'Beginner',
      description: 'Simple workflow for quick PSD analysis',
      icon: Sparkles,
      color: 'crd-green',
      features: [
        'One-click upload & analysis',
        'Automatic frame suggestions',
        'Guided export process',
        'Perfect for first-time users'
      ],
      badge: 'Recommended'
    },
    {
      id: 'advanced' as const,
      name: 'Advanced',
      description: 'Full-featured analysis with professional tools',
      icon: Zap,
      color: 'crd-blue',
      features: [
        'Detailed layer inspection',
        'Custom frame building',
        'Batch operations',
        'Advanced export options'
      ],
      badge: 'Pro'
    },
    {
      id: 'bulk' as const,
      name: 'Bulk Processing',
      description: 'Handle multiple PSDs with comparison tools',
      icon: Users,
      color: 'crd-orange',
      features: [
        'Multi-file processing',
        'Comparison analytics',
        'Batch frame generation',
        'Enterprise workflows'
      ],
      badge: 'Enterprise'
    }
  ];

  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-semibold mb-3">Choose Your Workflow</h2>
      <p className="text-muted-foreground mb-8">Select the mode that best fits your needs</p>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const IconComponent = mode.icon;
          
          return (
            <Card
              key={mode.id}
              className={`relative p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? `bg-gradient-to-br from-${mode.color}/10 to-${mode.color}/5 border-${mode.color}/30 shadow-lg shadow-${mode.color}/10`
                  : 'hover:border-border/80 hover:shadow-md'
              }`}
              onClick={() => onModeChange(mode.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-crd-green to-crd-blue rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-background to-muted rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 text-${mode.color}`} />
                </div>
                <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                  {mode.badge}
                </Badge>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{mode.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {mode.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {mode.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-3 h-3 text-${mode.color} flex-shrink-0`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full ${
                  isSelected
                    ? `bg-gradient-to-r from-${mode.color} to-${mode.color}/80 hover:from-${mode.color}/90 hover:to-${mode.color}/70`
                    : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onModeChange(mode.id);
                }}
              >
                {isSelected ? 'Selected' : 'Select Mode'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};