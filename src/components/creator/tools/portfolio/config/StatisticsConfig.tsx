import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface StatisticsConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const StatisticsConfig: React.FC<StatisticsConfigProps> = ({ config, onChange }) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const statsOptions = [
    {
      key: 'showTotalCards',
      label: 'Total Cards Created',
      description: 'Show the total number of cards you\'ve created'
    },
    {
      key: 'showTotalViews',
      label: 'Total Profile Views',
      description: 'Display your total profile view count'
    },
    {
      key: 'showFollowers',
      label: 'Follower Count',
      description: 'Show how many people follow you'
    },
    {
      key: 'showJoinDate',
      label: 'Member Since Date',
      description: 'Display when you joined the platform'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-crd-foreground">Statistics to Display</h3>
        <p className="text-sm text-crd-muted">
          Choose which statistics to show on your portfolio
        </p>
      </div>

      <div className="space-y-4">
        {statsOptions.map((option) => (
          <div key={option.key} className="flex items-start space-x-3 p-3 border border-crd-border/50 rounded-lg bg-crd-surface/30">
            <Switch
              id={option.key}
              checked={config[option.key] ?? true}
              onCheckedChange={(checked) => updateConfig(option.key, checked)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor={option.key} className="text-crd-foreground font-medium cursor-pointer">
                {option.label}
              </Label>
              <p className="text-sm text-crd-muted">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};