// Production Deployment Checklist Component
import React, { useState, useEffect } from 'react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  Server,
  Globe,
  Shield,
  Database,
  Zap,
  Monitor,
  GitBranch,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'warning';
  category: 'environment' | 'domain' | 'security' | 'database' | 'performance' | 'monitoring';
  critical: boolean;
  documentation?: string;
}

export const DeploymentChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    initializeChecklist();
  }, []);

  useEffect(() => {
    const completed = checklist.filter(item => item.status === 'completed').length;
    const percentage = checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0;
    setCompletionPercentage(percentage);
  }, [checklist]);

  const initializeChecklist = () => {
    const items: ChecklistItem[] = [
      // Environment Variables
      {
        id: 'env-supabase',
        title: 'Supabase Environment Variables',
        description: 'SUPABASE_URL and SUPABASE_ANON_KEY configured',
        status: 'completed',
        category: 'environment',
        critical: true,
        documentation: 'https://docs.lovable.dev/deployment/environment-variables'
      },
      {
        id: 'env-stripe',
        title: 'Stripe Production Keys',
        description: 'STRIPE_SECRET_KEY set to production values',
        status: 'completed',
        category: 'environment',
        critical: true
      },
      {
        id: 'env-gemini',
        title: 'Gemini AI API Key',
        description: 'GEMINI_API_KEY configured for production',
        status: 'completed',
        category: 'environment',
        critical: false
      },

      // Domain & DNS
      {
        id: 'domain-main',
        title: 'Main Domain Configuration',
        description: 'www.cardshow.app DNS and SSL configured',
        status: 'pending',
        category: 'domain',
        critical: true,
        documentation: 'https://docs.lovable.dev/deployment/custom-domains'
      },
      {
        id: 'domain-crdmkr',
        title: 'CRDMKR Subdomain',
        description: 'crdmkr.cardshow.app DNS and SSL configured',
        status: 'pending',
        category: 'domain',
        critical: true
      },
      {
        id: 'domain-alt',
        title: 'Alternative Domain',
        description: 'www.crd.show DNS configuration (optional)',
        status: 'pending',
        category: 'domain',
        critical: false
      },

      // Security
      {
        id: 'security-csp',
        title: 'Content Security Policy',
        description: 'CSP headers configured for XSS protection',
        status: 'completed',
        category: 'security',
        critical: true
      },
      {
        id: 'security-cors',
        title: 'CORS Configuration',
        description: 'Proper CORS headers for cross-origin requests',
        status: 'completed',
        category: 'security',
        critical: true
      },
      {
        id: 'security-rate-limit',
        title: 'Rate Limiting',
        description: 'API rate limiting configured',
        status: 'completed',
        category: 'security',
        critical: true
      },
      {
        id: 'security-auth-redirect',
        title: 'Auth Redirect URLs',
        description: 'Supabase auth redirect URLs updated for production',
        status: 'warning',
        category: 'security',
        critical: true,
        documentation: 'https://supabase.com/docs/guides/auth/redirect-urls'
      },

      // Database
      {
        id: 'db-migrations',
        title: 'Database Migrations',
        description: 'All migrations applied to production database',
        status: 'completed',
        category: 'database',
        critical: true
      },
      {
        id: 'db-rls',
        title: 'Row Level Security',
        description: 'RLS policies tested and validated',
        status: 'completed',
        category: 'database',
        critical: true
      },
      {
        id: 'db-backup',
        title: 'Database Backup Strategy',
        description: 'Automated backups configured',
        status: 'pending',
        category: 'database',
        critical: true,
        documentation: 'https://supabase.com/docs/guides/database/backups'
      },
      {
        id: 'db-indexes',
        title: 'Database Indexes',
        description: 'Performance indexes created for key queries',
        status: 'completed',
        category: 'database',
        critical: false
      },

      // Performance
      {
        id: 'perf-cdn',
        title: 'CDN Configuration',
        description: 'Static assets served via CDN for global performance',
        status: 'completed',
        category: 'performance',
        critical: true
      },
      {
        id: 'perf-compression',
        title: 'Asset Compression',
        description: 'Gzip/Brotli compression enabled',
        status: 'completed',
        category: 'performance',
        critical: true
      },
      {
        id: 'perf-caching',
        title: 'Cache Headers',
        description: 'Proper cache headers for static assets',
        status: 'completed',
        category: 'performance',
        critical: true
      },
      {
        id: 'perf-bundle',
        title: 'Bundle Optimization',
        description: 'Code splitting and tree shaking configured',
        status: 'completed',
        category: 'performance',
        critical: false
      },

      // Monitoring
      {
        id: 'monitor-sentry',
        title: 'Error Monitoring',
        description: 'Sentry or equivalent error tracking configured',
        status: 'pending',
        category: 'monitoring',
        critical: true,
        documentation: 'https://docs.sentry.io/platforms/javascript/guides/react/'
      },
      {
        id: 'monitor-analytics',
        title: 'Performance Analytics',
        description: 'Vercel Analytics or equivalent configured',
        status: 'completed',
        category: 'monitoring',
        critical: false
      },
      {
        id: 'monitor-uptime',
        title: 'Uptime Monitoring',
        description: 'Uptime monitoring and alerting configured',
        status: 'pending',
        category: 'monitoring',
        critical: true
      },
      {
        id: 'monitor-logs',
        title: 'Log Aggregation',
        description: 'Centralized logging for debugging',
        status: 'completed',
        category: 'monitoring',
        critical: false
      }
    ];

    setChecklist(items);
  };

  const toggleItemStatus = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: item.status === 'completed' ? 'pending' : 'completed' as const
          }
        : item
    ));
  };

  const getCategoryIcon = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'environment':
        return <Server className="w-5 h-5" />;
      case 'domain':
        return <Globe className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'performance':
        return <Zap className="w-5 h-5" />;
      case 'monitoring':
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-crd-green" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Circle className="w-5 h-5 text-crd-text-dim" />;
    }
  };

  const groupedItems = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const criticalIncomplete = checklist.filter(item => item.critical && item.status !== 'completed');
  const isReadyForDeployment = criticalIncomplete.length === 0;

  return (
    <div className="min-h-screen bg-crd-black text-crd-text p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crd-orange mb-4">
            🚀 Production Deployment Checklist
          </h1>
          <p className="text-xl text-crd-text-dim mb-6">
            Ensure all requirements are met before going live
          </p>
          
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-3xl font-bold">
                {completionPercentage}% Complete
              </div>
              {isReadyForDeployment ? (
                <div className="flex items-center gap-2 text-crd-green">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium">Ready for Deployment!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-500">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-medium">
                    {criticalIncomplete.length} critical items remaining
                  </span>
                </div>
              )}
            </div>
            
            <div className="w-full bg-crd-surface rounded-full h-4">
              <div 
                className={cn(
                  "h-4 rounded-full transition-all duration-500",
                  isReadyForDeployment ? "bg-crd-green" : "bg-crd-orange"
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <CRDCard key={category} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(category as ChecklistItem['category'])}
                <h3 className="text-xl font-bold text-crd-orange capitalize">
                  {category.replace('-', ' ')}
                </h3>
                <div className="ml-auto text-sm text-crd-text-dim">
                  {items.filter(item => item.status === 'completed').length} / {items.length} complete
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors",
                      "bg-crd-surface hover:bg-crd-surface-light",
                      item.status === 'completed' && "ring-1 ring-crd-green/30",
                      item.status === 'warning' && "ring-1 ring-orange-500/30"
                    )}
                    onClick={() => toggleItemStatus(item.id)}
                  >
                    {getStatusIcon(item.status)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.critical && (
                          <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-crd-text-dim mt-1">
                        {item.description}
                      </p>
                    </div>

                    {item.documentation && (
                      <a
                        href={item.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-crd-blue hover:text-crd-blue/80 p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CRDCard>
          ))}
        </div>

        {/* Deployment Instructions */}
        <div className="mt-8">
          <CRDCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-5 h-5 text-crd-orange" />
              <h3 className="text-xl font-bold text-crd-orange">
                Deployment Instructions
              </h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="bg-crd-surface p-4 rounded-lg">
                <h4 className="font-medium mb-2">1. Final Pre-Deployment Checks</h4>
                <ul className="list-disc list-inside space-y-1 text-crd-text-dim">
                  <li>Run full test suite and ensure all tests pass</li>
                  <li>Verify performance metrics meet targets</li>
                  <li>Test all critical user workflows</li>
                  <li>Confirm all environment variables are set</li>
                </ul>
              </div>
              
              <div className="bg-crd-surface p-4 rounded-lg">
                <h4 className="font-medium mb-2">2. Vercel Deployment</h4>
                <ul className="list-disc list-inside space-y-1 text-crd-text-dim">
                  <li>Connect GitHub repository to Vercel</li>
                  <li>Configure custom domains for all subdomains</li>
                  <li>Set environment variables in Vercel dashboard</li>
                  <li>Enable analytics and monitoring</li>
                </ul>
              </div>
              
              <div className="bg-crd-surface p-4 rounded-lg">
                <h4 className="font-medium mb-2">3. Post-Deployment Verification</h4>
                <ul className="list-disc list-inside space-y-1 text-crd-text-dim">
                  <li>Smoke test all major features</li>
                  <li>Verify SSL certificates are working</li>
                  <li>Test cross-subdomain navigation</li>
                  <li>Monitor error logs for any issues</li>
                </ul>
              </div>
            </div>
          </CRDCard>
        </div>

        {isReadyForDeployment && (
          <div className="text-center mt-8">
            <CRDButton 
              className="bg-crd-green hover:bg-crd-green/80 text-crd-black"
              onClick={() => window.open('https://vercel.com/new', '_blank')}
            >
              🚀 Deploy to Production
            </CRDButton>
          </div>
        )}
      </div>
    </div>
  );
};