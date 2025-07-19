import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudioState } from '@/hooks/useStudioState';
import { Crown, Users, Gamepad2, Camera, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ComponentType<{ className?: string }>;
  preview: string;
  settings: {
    lighting: any;
    design: any;
    material?: any;
  };
}

const TEMPLATES: Template[] = [
  {
    id: 'premium-sports',
    name: 'Premium Sports',
    category: 'Sports',
    difficulty: 'intermediate',
    icon: Crown,
    preview: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    settings: {
      lighting: {
        preset: 'dramatic',
        ambientIntensity: 20,
        directionalIntensity: 90,
        shadowIntensity: 80
      },
      design: {
        backgroundColor: '#1e3a8a',
        primaryColor: '#3b82f6',
        fontFamily: 'Inter',
        fontWeight: 'bold'
      }
    }
  },
  {
    id: 'social-gaming',
    name: 'Social Gaming',
    category: 'Gaming',
    difficulty: 'beginner',
    icon: Gamepad2,
    preview: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    settings: {
      lighting: {
        preset: 'neon',
        ambientIntensity: 50,
        directionalIntensity: 70,
        shadowIntensity: 60
      },
      design: {
        backgroundColor: '#7c3aed',
        primaryColor: '#a855f7',
        fontFamily: 'Inter',
        fontWeight: 'bold'
      }
    }
  },
  {
    id: 'cinematic-portrait',
    name: 'Cinematic Portrait',
    category: 'Portrait',
    difficulty: 'advanced',
    icon: Camera,
    preview: 'linear-gradient(135deg, #1f2937, #374151)',
    settings: {
      lighting: {
        preset: 'cinematic',
        ambientIntensity: 15,
        directionalIntensity: 95,
        shadowIntensity: 85
      },
      design: {
        backgroundColor: '#1f2937',
        primaryColor: '#f59e0b',
        fontFamily: 'Inter',
        fontWeight: 'normal'
      }
    }
  },
  {
    id: 'community-card',
    name: 'Community Card',
    category: 'Social',
    difficulty: 'beginner',
    icon: Users,
    preview: 'linear-gradient(135deg, #059669, #10b981)',
    settings: {
      lighting: {
        preset: 'soft',
        ambientIntensity: 85,
        directionalIntensity: 60,
        shadowIntensity: 20
      },
      design: {
        backgroundColor: '#059669',
        primaryColor: '#10b981',
        fontFamily: 'Inter',
        fontWeight: 'normal'
      }
    }
  },
  {
    id: 'artistic-showcase',
    name: 'Artistic Showcase',
    category: 'Art',
    difficulty: 'intermediate',
    icon: Palette,
    preview: 'linear-gradient(135deg, #dc2626, #f59e0b, #eab308)',
    settings: {
      lighting: {
        preset: 'studio',
        ambientIntensity: 70,
        directionalIntensity: 80,
        shadowIntensity: 40
      },
      design: {
        backgroundColor: '#dc2626',
        primaryColor: '#f59e0b',
        fontFamily: 'Inter',
        fontWeight: 'normal'
      }
    }
  }
];

export const TemplateLibrary: React.FC = () => {
  const { updateLighting, updateDesign } = useStudioState();

  const applyTemplate = (template: Template) => {
    // Apply lighting settings
    updateLighting(template.settings.lighting);
    
    // Apply design settings
    updateDesign(template.settings.design);
    
    toast.success(`Applied ${template.name} template`);
  };

  const getDifficultyColor = (difficulty: Template['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Templates</h3>
        <Badge variant="outline" className="text-xs">{TEMPLATES.length}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          
          return (
            <Card 
              key={template.id}
              className="aspect-[3/4] bg-crd-darkest border-crd-border hover:border-crd-accent cursor-pointer transition-colors group"
              onClick={() => applyTemplate(template)}
            >
              <div className="w-full h-full p-2 flex flex-col">
                {/* Template Preview */}
                <div 
                  className="flex-1 rounded-sm mb-2 relative overflow-hidden"
                  style={{ background: template.preview }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-center truncate">
                    {template.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {template.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1 py-0 ${getDifficultyColor(template.difficulty)}`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <Button className="w-full" size="sm" variant="outline">
        Browse More Templates
      </Button>
    </div>
  );
};