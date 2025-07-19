import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Play, 
  Zap, 
  Star, 
  Sparkles, 
  RotateCw, 
  Eye, 
  Crown,
  Users,
  Waves,
  Cpu,
  ArrowRightLeft,
  Search
} from 'lucide-react';
import type { AnimationMode } from './ProfessionalTimeline';

interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'reveal' | 'showcase' | 'cinematic' | 'social' | 'effects';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  icon: React.ComponentType<any>;
  preview: string;
  tags: string[];
  premium?: boolean;
}

interface AnimationPresetsProps {
  mode: AnimationMode;
  onApplyPreset: (preset: AnimationPreset) => void;
  onClose: () => void;
}

export const AnimationPresets: React.FC<AnimationPresetsProps> = ({
  mode,
  onApplyPreset,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewingPreset, setPreviewingPreset] = useState<string | null>(null);

  const presets: AnimationPreset[] = [
    // Card Reveal Animations
    {
      id: 'card-reveal-fade',
      name: 'Elegant Fade In',
      description: 'Smooth opacity transition with subtle scale',
      category: 'reveal',
      difficulty: 'beginner',
      duration: 1.5,
      icon: Eye,
      preview: 'fade-in-preview.mp4',
      tags: ['fade', 'simple', 'elegant']
    },
    {
      id: 'card-reveal-flip',
      name: 'Dramatic Flip',
      description: 'Card flips from face-down to reveal',
      category: 'reveal',
      difficulty: 'intermediate',
      duration: 2.0,
      icon: RotateCw,
      preview: 'flip-reveal-preview.mp4',
      tags: ['flip', 'dramatic', 'rotation']
    },
    {
      id: 'hero-entrance',
      name: 'Hero Entrance',
      description: 'Cinematic camera movement with lighting',
      category: 'cinematic',
      difficulty: 'advanced',
      duration: 3.5,
      icon: Crown,
      preview: 'hero-entrance-preview.mp4',
      tags: ['cinematic', 'dramatic', 'lighting'],
      premium: true
    },

    // Flip Showcase
    {
      id: 'flip-showcase-smooth',
      name: 'Smooth Flip Showcase',
      description: 'Seamless front-to-back card reveal',
      category: 'showcase',
      difficulty: 'intermediate',
      duration: 2.5,
      icon: ArrowRightLeft,
      preview: 'smooth-flip-preview.mp4',
      tags: ['flip', 'showcase', 'smooth']
    },
    {
      id: 'flip-showcase-bounce',
      name: 'Bouncy Flip',
      description: 'Playful bounce effect during flip',
      category: 'showcase',
      difficulty: 'beginner',
      duration: 2.0,
      icon: Sparkles,
      preview: 'bouncy-flip-preview.mp4',
      tags: ['flip', 'bounce', 'playful']
    },

    // Social Media Optimized
    {
      id: 'social-quick-reveal',
      name: 'Quick Reveal',
      description: 'Fast-paced reveal perfect for social media',
      category: 'social',
      difficulty: 'beginner',
      duration: 1.0,
      icon: Zap,
      preview: 'quick-reveal-preview.mp4',
      tags: ['quick', 'social', 'tiktok', 'instagram']
    },
    {
      id: 'social-swipe-in',
      name: 'Swipe In',
      description: 'Mobile-friendly swipe animation',
      category: 'social',
      difficulty: 'beginner',
      duration: 0.8,
      icon: Users,
      preview: 'swipe-in-preview.mp4',
      tags: ['swipe', 'mobile', 'social']
    },

    // Stadium Wave
    {
      id: 'stadium-wave',
      name: 'Stadium Wave',
      description: 'Crowd-inspired wave effect',
      category: 'effects',
      difficulty: 'advanced',
      duration: 4.0,
      icon: Waves,
      preview: 'stadium-wave-preview.mp4',
      tags: ['wave', 'crowd', 'sports'],
      premium: true
    },

    // Holographic
    {
      id: 'holographic-transform',
      name: 'Holographic Transform',
      description: 'Sci-fi hologram material transition',
      category: 'effects',
      difficulty: 'advanced',
      duration: 3.0,
      icon: Cpu,
      preview: 'holographic-preview.mp4',
      tags: ['holographic', 'sci-fi', 'materials'],
      premium: true
    },

    // Trading Moment
    {
      id: 'trading-moment',
      name: 'Trading Moment',
      description: 'Authentic card exchange animation',
      category: 'cinematic',
      difficulty: 'intermediate',
      duration: 2.8,
      icon: Star,
      preview: 'trading-moment-preview.mp4',
      tags: ['trading', 'authentic', 'exchange']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Presets', count: presets.length },
    { id: 'reveal', name: 'Card Reveal', count: presets.filter(p => p.category === 'reveal').length },
    { id: 'showcase', name: 'Flip Showcase', count: presets.filter(p => p.category === 'showcase').length },
    { id: 'cinematic', name: 'Cinematic', count: presets.filter(p => p.category === 'cinematic').length },
    { id: 'social', name: 'Social Media', count: presets.filter(p => p.category === 'social').length },
    { id: 'effects', name: 'Special Effects', count: presets.filter(p => p.category === 'effects').length }
  ];

  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    
    const matchesMode = mode === 'director' || 
                       (mode === 'pro' && preset.difficulty !== 'advanced') ||
                       (mode === 'beginner' && preset.difficulty === 'beginner');
    
    return matchesSearch && matchesCategory && matchesMode;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handlePresetPreview = (presetId: string) => {
    setPreviewingPreset(presetId);
    // In a real implementation, this would trigger a preview in the 3D viewport
    setTimeout(() => setPreviewingPreset(null), 3000);
  };

  return (
    <Card className="h-80 bg-crd-dark border-crd-border border-t-0">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-crd-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Animation Presets</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-2 top-2 text-crd-text-secondary" />
            <Input
              placeholder="Search presets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                className="w-full justify-between h-8"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="text-xs">{category.name}</span>
                <Badge variant="outline" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Mode Filter Info */}
          <div className="mt-4 p-2 bg-crd-darkest rounded-sm">
            <div className="text-xs text-crd-text-secondary">
              <div className="font-medium mb-1">Current Mode: {mode}</div>
              {mode === 'beginner' && (
                <div>Showing beginner-friendly presets only</div>
              )}
              {mode === 'pro' && (
                <div>Showing beginner and intermediate presets</div>
              )}
              {mode === 'director' && (
                <div>All presets available</div>
              )}
            </div>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex-1 p-4">
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {filteredPresets.map(preset => {
                const Icon = preset.icon;
                const isPreviewingThis = previewingPreset === preset.id;
                
                return (
                  <Card
                    key={preset.id}
                    className={`p-3 cursor-pointer transition-all hover:border-crd-accent group ${
                      isPreviewingThis ? 'border-crd-accent bg-crd-accent/10' : 'border-crd-border'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="p-1 bg-crd-darkest rounded">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <h4 className="text-sm font-medium truncate">{preset.name}</h4>
                          {preset.premium && (
                            <Crown className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-crd-text-secondary line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getDifficultyColor(preset.difficulty)}>
                        {preset.difficulty}
                      </Badge>
                      <span className="text-xs text-crd-text-secondary">
                        {preset.duration}s
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {preset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{preset.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="flex-1 h-7"
                        onClick={() => onApplyPreset(preset)}
                        disabled={preset.premium && mode === 'beginner'}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handlePresetPreview(preset.id)}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>

                    {isPreviewingThis && (
                      <div className="absolute inset-0 bg-crd-accent/20 border border-crd-accent rounded flex items-center justify-center">
                        <div className="text-xs font-medium text-crd-accent">
                          Previewing...
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {filteredPresets.length === 0 && (
              <div className="flex items-center justify-center h-32 text-crd-text-secondary">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No presets found</p>
                  <p className="text-xs">Try adjusting your search or category filter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};