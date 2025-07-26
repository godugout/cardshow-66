import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsData {
  date: string;
  earnings: number;
}

interface EarningsLineChartProps {
  data: EarningsData[];
}

export const EarningsLineChart: React.FC<EarningsLineChartProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            labelFormatter={(value) => formatDate(value)}
            formatter={(value: number) => [formatCurrency(value), 'Earnings']}
          />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="hsl(var(--crd-green))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--crd-green))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};