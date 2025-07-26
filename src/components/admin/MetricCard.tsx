import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
  isLoading: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  isLoading,
  icon,
  description
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isIncrease = changeType === 'increase';
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon className={cn(
              "w-4 h-4",
              isIncrease ? "text-green-600" : "text-red-600"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isIncrease ? "text-green-600" : "text-red-600"
            )}>
              {change}
            </span>
            {description && (
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};