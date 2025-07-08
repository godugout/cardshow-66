import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  risk: 'low' | 'medium' | 'high';
}

const MIGRATION_STEPS: MigrationStep[] = [
  // Phase 1: Critical Fixes
  {
    id: 'stripe-payments',
    title: 'Stripe Payment Integration',
    description: 'Implement secure payment processing for subscriptions and card purchases',
    status: 'completed',
    priority: 'high',
    risk: 'medium'
  },
  {
    id: 'real-auth',
    title: 'Real Authentication System',
    description: 'Replace mock auth with secure Supabase authentication',
    status: 'pending',
    priority: 'high',
    risk: 'high'
  },
  {
    id: 'error-boundaries',
    title: 'Error Boundaries',
    description: 'Add comprehensive error handling throughout the app',
    status: 'completed',
    priority: 'high',
    risk: 'low'
  },
  {
    id: 'database-constraints',
    title: 'Database Integrity',
    description: 'Add missing foreign key constraints and validation',
    status: 'pending',
    priority: 'medium',
    risk: 'medium'
  },

  // Phase 2: Enhanced Features
  {
    id: 'feature-flags',
    title: 'Feature Flag System',
    description: 'Implement granular feature control for safe rollouts',
    status: 'completed',
    priority: 'medium',
    risk: 'low'
  },
  {
    id: 'real-time',
    title: 'Real-time Features',
    description: 'Add live updates for trading, comments, and notifications',
    status: 'pending',
    priority: 'medium',
    dependencies: ['real-auth'],
    risk: 'medium'
  },
  {
    id: 'mobile-optimization',
    title: 'Mobile Optimization',
    description: 'Improve mobile responsiveness and touch interactions',
    status: 'in-progress',
    priority: 'medium',
    risk: 'low'
  },

  // Phase 3: Performance & Polish
  {
    id: 'performance-monitoring',
    title: 'Performance Monitoring',
    description: 'Add comprehensive performance tracking and optimization',
    status: 'pending',
    priority: 'low',
    risk: 'low'
  },
  {
    id: 'seo-optimization',
    title: 'SEO Optimization',
    description: 'Implement meta tags, structured data, and search optimization',
    status: 'pending',
    priority: 'low',
    risk: 'low'
  },
  {
    id: 'analytics',
    title: 'Analytics Implementation',
    description: 'Add user behavior tracking and business intelligence',
    status: 'pending',
    priority: 'low',
    risk: 'low'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in-progress': return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'blocked': return <XCircle className="h-5 w-5 text-red-500" />;
    case 'pending': return <AlertCircle className="h-5 w-5 text-gray-500" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'in-progress': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'blocked': return 'bg-red-500/10 text-red-700 border-red-500/20';
    case 'pending': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    default: return '';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-700 border-red-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-700 border-green-500/20';
    default: return '';
  }
};

export const MigrationStatus: React.FC = () => {
  const completedSteps = MIGRATION_STEPS.filter(step => step.status === 'completed').length;
  const totalSteps = MIGRATION_STEPS.length;
  const progress = (completedSteps / totalSteps) * 100;

  const phaseSteps = {
    'Phase 1: Critical Fixes': MIGRATION_STEPS.slice(0, 4),
    'Phase 2: Enhanced Features': MIGRATION_STEPS.slice(4, 7),
    'Phase 3: Performance & Polish': MIGRATION_STEPS.slice(7, 10)
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-foreground font-semibold">Migration Progress</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Overall progress of the Cardshow migration plan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">Progress</span>
              <span className="text-muted-foreground">{completedSteps} of {totalSteps} steps completed</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {Math.round(progress)}% complete
            </p>
          </div>
        </CardContent>
      </Card>

      {Object.entries(phaseSteps).map(([phase, steps]) => (
        <Card key={phase} className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-foreground font-semibold">{phase}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
                  {getStatusIcon(step.status)}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status}
                      </Badge>
                      <Badge className={getPriorityColor(step.priority)}>
                        {step.priority} priority
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    
                    {step.dependencies && (
                      <div className="text-xs text-muted-foreground font-medium">
                        Dependencies: {step.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};