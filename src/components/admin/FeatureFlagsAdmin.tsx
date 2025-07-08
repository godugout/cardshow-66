import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlags, FeatureFlags } from '@/hooks/useFeatureFlags';
import { AlertTriangle, Zap, Sparkles, FlaskConical } from 'lucide-react';
import { AuthMigrationPanel } from '@/components/auth/AuthMigrationPanel';

interface FeatureFlagInfo {
  key: keyof FeatureFlags;
  title: string;
  description: string;
  category: 'core' | 'advanced' | 'experimental' | 'performance';
  risk: 'low' | 'medium' | 'high';
  dependencies?: Array<keyof FeatureFlags>;
}

const FEATURE_FLAGS_CONFIG: FeatureFlagInfo[] = [
  // Core Features
  {
    key: 'REAL_AUTH',
    title: 'Real Authentication',
    description: 'Switch from mock auth to real Supabase authentication',
    category: 'core',
    risk: 'high'
  },
  {
    key: 'STRIPE_PAYMENTS',
    title: 'Stripe Payments',
    description: 'Enable credit card payments and subscriptions',
    category: 'core',
    risk: 'medium'
  },
  {
    key: 'REAL_TIME_FEATURES',
    title: 'Real-time Features',
    description: 'Live updates for trading, comments, and notifications',
    category: 'core',
    risk: 'medium',
    dependencies: ['REAL_AUTH']
  },

  // Advanced Features
  {
    key: 'ADVANCED_3D_FEATURES',
    title: 'Advanced 3D Features',
    description: 'Enhanced 3D card viewer with advanced effects',
    category: 'advanced',
    risk: 'low'
  },
  {
    key: 'AR_FEATURES',
    title: 'Augmented Reality',
    description: 'AR card preview and placement features',
    category: 'advanced',
    risk: 'medium',
    dependencies: ['ADVANCED_3D_FEATURES']
  },
  {
    key: 'AI_RECOMMENDATIONS',
    title: 'AI Recommendations',
    description: 'AI-powered card suggestions and market insights',
    category: 'advanced',
    risk: 'medium'
  },

  // Experimental Features
  {
    key: 'VOICE_COMMANDS',
    title: 'Voice Commands',
    description: 'Voice-controlled card creation and navigation',
    category: 'experimental',
    risk: 'high'
  },
  {
    key: 'HAPTIC_FEEDBACK',
    title: 'Haptic Feedback',
    description: 'Touch vibrations for mobile interactions',
    category: 'experimental',
    risk: 'low'
  },
  {
    key: 'COLLABORATION_TOOLS',
    title: 'Collaboration Tools',
    description: 'Real-time collaborative card editing',
    category: 'experimental',
    risk: 'high',
    dependencies: ['REAL_TIME_FEATURES']
  },

  // Performance Features
  {
    key: 'PERFORMANCE_MONITORING',
    title: 'Performance Monitoring',
    description: 'Advanced performance metrics and monitoring',
    category: 'performance',
    risk: 'low'
  },
  {
    key: 'ADVANCED_CACHING',
    title: 'Advanced Caching',
    description: 'Intelligent caching for better performance',
    category: 'performance',
    risk: 'medium'
  },

  // Legacy
  {
    key: 'OAK_FEATURES',
    title: 'OAK Features (Legacy)',
    description: 'Legacy OAK template features',
    category: 'core',
    risk: 'low'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'core': return <Zap className="h-4 w-4" />;
    case 'advanced': return <Sparkles className="h-4 w-4" />;
    case 'experimental': return <FlaskConical className="h-4 w-4" />;
    case 'performance': return <AlertTriangle className="h-4 w-4" />;
    default: return null;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'core': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'advanced': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
    case 'experimental': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    case 'performance': return 'bg-green-500/10 text-green-700 border-green-500/20';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'high': return 'bg-red-500/10 text-red-700 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

export const FeatureFlagsAdmin: React.FC = () => {
  const { featureFlags, updateFeatureFlag, isLoading } = useFeatureFlags();

  const checkDependencies = (flagConfig: FeatureFlagInfo): boolean => {
    if (!flagConfig.dependencies) return true;
    return flagConfig.dependencies.every(dep => featureFlags[dep]);
  };

  const groupedFlags = FEATURE_FLAGS_CONFIG.reduce((acc, flag) => {
    if (!acc[flag.category]) acc[flag.category] = [];
    acc[flag.category].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlagInfo[]>);

  if (isLoading) {
    return <div>Loading feature flags...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Authentication Migration Panel */}
      <AuthMigrationPanel />
      
      {/* Feature Flags */}
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground">
          Safely control feature rollouts and manage experimental functionality
        </p>
      </div>

      {Object.entries(groupedFlags).map(([category, flags]) => (
        <Card key={category} className="border-editor-border bg-editor-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getCategoryIcon(category)}
              {category} Features
            </CardTitle>
            <CardDescription>
              {category === 'core' && 'Essential features for basic functionality'}
              {category === 'advanced' && 'Enhanced features for power users'}
              {category === 'experimental' && 'Cutting-edge features in development'}
              {category === 'performance' && 'Features for monitoring and optimization'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {flags.map((flagConfig) => {
              const dependenciesMet = checkDependencies(flagConfig);
              const isEnabled = featureFlags[flagConfig.key];
              
              return (
                <div 
                  key={flagConfig.key}
                  className="flex items-start justify-between p-4 rounded-lg border border-editor-border bg-editor-darker"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{flagConfig.title}</h3>
                      <Badge className={getCategoryColor(flagConfig.category)}>
                        {flagConfig.category}
                      </Badge>
                      <Badge className={getRiskColor(flagConfig.risk)}>
                        {flagConfig.risk} risk
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {flagConfig.description}
                    </p>
                    
                    {flagConfig.dependencies && (
                      <div className="text-xs text-muted-foreground">
                        Dependencies: {flagConfig.dependencies.join(', ')}
                        {!dependenciesMet && (
                          <span className="text-red-500 ml-2">
                            (Not all dependencies met)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => {
                      if (!checked || dependenciesMet) {
                        updateFeatureFlag(flagConfig.key, checked);
                      }
                    }}
                    disabled={!dependenciesMet && !isEnabled}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};