import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Eye, Users, Calendar } from 'lucide-react';
import { StatisticsConfig } from '@/types/portfolio';

interface StatisticsComponentProps {
  config: StatisticsConfig;
}

export const StatisticsComponent: React.FC<StatisticsComponentProps> = ({ config }) => {
  const { showTotalCards, showTotalViews, showFollowers, showJoinDate } = config;

  const stats = [
    {
      key: 'totalCards',
      show: showTotalCards,
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Total Cards',
      value: '24',
      color: 'text-crd-orange'
    },
    {
      key: 'totalViews',
      show: showTotalViews,
      icon: <Eye className="w-5 h-5" />,
      label: 'Total Views',
      value: '12.5K',
      color: 'text-crd-blue'
    },
    {
      key: 'followers',
      show: showFollowers,
      icon: <Users className="w-5 h-5" />,
      label: 'Followers',
      value: '1,234',
      color: 'text-crd-green'
    },
    {
      key: 'joinDate',
      show: showJoinDate,
      icon: <Calendar className="w-5 h-5" />,
      label: 'Member Since',
      value: 'Jan 2023',
      color: 'text-crd-yellow'
    }
  ];

  const visibleStats = stats.filter(stat => stat.show);

  if (visibleStats.length === 0) {
    return (
      <Card className="p-6 bg-crd-surface/20 border-crd-border">
        <div className="text-center py-4">
          <p className="text-sm text-crd-muted">
            Configure this module to display your statistics.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-crd-surface/20 border-crd-border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-crd-foreground">
          My Stats
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleStats.map((stat) => (
            <Card key={stat.key} className="p-4 bg-crd-surface/30 border-crd-border text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-current/20 mb-2 ${stat.color}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-crd-foreground mb-1">
                {stat.value}
              </div>
              
              <div className="text-sm text-crd-muted">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};