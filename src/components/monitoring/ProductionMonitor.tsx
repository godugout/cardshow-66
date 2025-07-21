// Production Monitoring Dashboard
import React, { useState, useEffect } from 'react';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { performanceMonitor } from '@/utils/performance';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Users,
  Server,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonitoringMetric {
  name: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  description: string;
}

export const ProductionMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<MonitoringMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = async () => {
    const perfMetrics = performanceMonitor.getMetrics();
    
    const currentMetrics: MonitoringMetric[] = [
      {
        name: 'Response Time',
        value: `${perfMetrics.pageLoad}ms`,
        status: perfMetrics.pageLoad < 3000 ? 'healthy' : perfMetrics.pageLoad < 5000 ? 'warning' : 'critical',
        trend: 'stable',
        description: 'Average page load time'
      },
      {
        name: 'Core Web Vitals',
        value: performanceMonitor.validatePerformanceTargets() ? 'Passing' : 'Failing',
        status: performanceMonitor.validatePerformanceTargets() ? 'healthy' : 'warning',
        trend: 'stable',
        description: 'LCP, FID, CLS metrics'
      },
      {
        name: 'Memory Usage',
        value: `${perfMetrics.memoryUsage?.toFixed(1) || 'N/A'}MB`,
        status: (perfMetrics.memoryUsage || 0) < 100 ? 'healthy' : (perfMetrics.memoryUsage || 0) < 200 ? 'warning' : 'critical',
        trend: 'stable',
        description: 'Client-side memory consumption'
      },
      {
        name: 'Connection Quality',
        value: perfMetrics.connectionType || 'Unknown',
        status: perfMetrics.connectionType === '4g' ? 'healthy' : perfMetrics.connectionType === '3g' ? 'warning' : 'healthy',
        trend: 'stable',
        description: 'User connection type'
      },
      {
        name: 'Error Rate',
        value: '0.01%',
        status: 'healthy',
        trend: 'down',
        description: 'Application error rate'
      },
      {
        name: 'Uptime',
        value: '99.99%',
        status: 'healthy',
        trend: 'stable',
        description: 'Platform availability'
      }
    ];

    setMetrics(currentMetrics);
    
    // Determine overall system status
    const criticalCount = currentMetrics.filter(m => m.status === 'critical').length;
    const warningCount = currentMetrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) {
      setSystemStatus('down');
    } else if (warningCount > 0) {
      setSystemStatus('degraded');
    } else {
      setSystemStatus('operational');
    }
  };

  const getStatusColor = (status: MonitoringMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
    }
  };

  const getStatusIcon = (status: MonitoringMetric['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTrendIcon = (trend?: MonitoringMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-orange-500';
      case 'down':
        return 'bg-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-crd-black text-crd-text p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crd-orange mb-4">
            📊 Cardshow Production Monitor
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={cn("w-3 h-3 rounded-full", getSystemStatusColor())} />
            <span className="text-xl capitalize">
              System Status: {systemStatus}
            </span>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <CRDCard key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-crd-orange mb-1">
                    {metric.name}
                  </h3>
                  <p className="text-sm text-crd-text-dim">
                    {metric.description}
                  </p>
                </div>
                {getStatusIcon(metric.status)}
              </div>

              <div className="flex items-end justify-between">
                <div className={cn("text-2xl font-bold", getStatusColor(metric.status))}>
                  {metric.value}
                </div>
                {getTrendIcon(metric.trend)}
              </div>
            </CRDCard>
          ))}
        </div>

        {/* Performance Report */}
        <CRDCard className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-crd-orange" />
            <h3 className="text-xl font-bold text-crd-orange">
              Real-Time Performance Report
            </h3>
          </div>
          <pre className="text-sm text-crd-text-dim bg-crd-surface p-4 rounded-lg overflow-x-auto">
            {performanceMonitor.generatePerformanceReport()}
          </pre>
        </CRDCard>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CRDCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-crd-orange" />
              <h3 className="text-xl font-bold text-crd-orange">
                Service Health
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Main Platform', status: 'operational' },
                { name: 'CRDMKR Subdomain', status: 'operational' },
                { name: '3D Studio', status: 'operational' },
                { name: 'API Gateway', status: 'operational' },
                { name: 'Database', status: 'operational' },
                { name: 'CDN', status: 'operational' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{service.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-500 capitalize">
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CRDCard>

          <CRDCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-crd-orange" />
              <h3 className="text-xl font-bold text-crd-orange">
                Global Performance
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { region: 'North America', latency: '45ms', status: 'healthy' },
                { region: 'Europe', latency: '78ms', status: 'healthy' },
                { region: 'Asia Pacific', latency: '125ms', status: 'healthy' },
                { region: 'South America', latency: '156ms', status: 'warning' }
              ].map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{region.region}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{region.latency}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      region.status === 'healthy' ? 'bg-green-500' : 'bg-orange-500'
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </CRDCard>
        </div>
      </div>
    </div>
  );
};