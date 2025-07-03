import React, { useState } from 'react';
import { Clock, Zap, Layers, Palette, ArrowRight, Users, Star } from 'lucide-react';
import { UniversalCard, UniversalButton, UniversalBadge } from '@/components/ui/design-system';
import { QuickCRDPath } from './paths/QuickCRDPath';
import { CRDMKRPath } from './paths/CRDMKRPath';
import { CRDFramesPath } from './paths/CRDFramesPath';

export type CreationPath = 'selection' | 'quick-crd' | 'crdmkr' | 'crd-frames';

export const UnifiedCreationFlow: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<CreationPath>('selection');

  const paths = [
    {
      id: 'quick-crd' as const,
      title: 'Quick CRD',
      subtitle: '30 seconds',
      description: 'Smart auto-detection with instant processing',
      features: [
        'Auto-crop & enhance',
        'Bulk operations',
        'Format selection',
        'Optional studio access'
      ],
      targetUsers: 'Beginners & Quick Tasks',
      color: 'from-emerald-500 to-green-600',
      borderColor: 'border-emerald-500/30',
      hoverColor: 'hover:border-emerald-400/50',
      icon: <Zap className="w-8 h-8" />,
      badge: 'Fast'
    },
    {
      id: 'crdmkr' as const,
      title: 'CRDMKR',
      subtitle: '2-5 minutes',
      description: 'Hybrid interface with layer control',
      features: [
        'Frame library',
        'Layer management',
        'Effects panel',
        '3D view modes'
      ],
      targetUsers: 'Intermediate Creators',
      color: 'from-blue-500 to-purple-600',
      borderColor: 'border-blue-500/30',
      hoverColor: 'hover:border-blue-400/50',
      icon: <Layers className="w-8 h-8" />,
      badge: 'Popular'
    },
    {
      id: 'crd-frames' as const,
      title: 'CRD Frames',
      subtitle: '10-30 minutes',
      description: 'Professional template creation',
      features: [
        'PSD import',
        'Element library',
        'Template monetization',
        'Advanced customization'
      ],
      targetUsers: 'Advanced Designers',
      color: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-500/30',
      hoverColor: 'hover:border-purple-400/50',
      icon: <Palette className="w-8 h-8" />,
      badge: 'Pro'
    }
  ];

  const renderPathSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Choose Your{' '}
            <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
              Creation Path
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you want to create a card in 30 seconds or craft a perfect template in 30 minutes, 
            we have the right tools for you.
          </p>
        </div>

        {/* Path Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {paths.map((path) => (
            <UniversalCard
              key={path.id}
              className={`relative p-8 ${path.borderColor} ${path.hoverColor} transition-all duration-300 hover:scale-105 cursor-pointer group`}
              onClick={() => setCurrentPath(path.id)}
            >
              {/* Badge */}
              <div className="absolute top-6 right-6">
                <UniversalBadge variant="outline" size="sm">
                  {path.badge}
                </UniversalBadge>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${path.color} p-3 mb-6 text-white group-hover:scale-110 transition-transform`}>
                {path.icon}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {path.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{path.subtitle}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {path.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {path.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Target Users */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{path.targetUsers}</span>
                  </div>
                </div>

                {/* CTA */}
                <UniversalButton className="w-full mt-6 group-hover:bg-primary/90">
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </UniversalButton>
              </div>
            </UniversalCard>
          ))}
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            Smart Features Across All Paths
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              'Progressive Complexity',
              'Cross-Path Integration',
              'Consistent Design',
              'Export Flexibility'
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPath = () => {
    switch (currentPath) {
      case 'quick-crd':
        return <QuickCRDPath onBack={() => setCurrentPath('selection')} />;
      case 'crdmkr':
        return <CRDMKRPath onBack={() => setCurrentPath('selection')} />;
      case 'crd-frames':
        return <CRDFramesPath onBack={() => setCurrentPath('selection')} />;
      default:
        return renderPathSelection();
    }
  };

  return renderCurrentPath();
};