// Mock API for admin metrics
// In a real implementation, this would connect to your database

interface MetricsResponse {
  kpis: {
    totalUsers: { value: number; change: string };
    cardsCreated: { value: number; change: string };
    marketplaceVolume: { value: number; change: string };
    dailyActiveUsers: { value: number; change: string };
  };
  userGrowthChart: Array<{ date: string; value: number }>;
}

// Mock function to simulate API endpoint
export const fetchAdminMetrics = async (): Promise<MetricsResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock chart data
  const generateUserGrowthData = () => {
    const days = 30;
    const today = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 200) + 100 + (days - i) * 3
      });
    }
    
    return data;
  };

  // Mock realistic data
  return {
    kpis: {
      totalUsers: { 
        value: 15234, 
        change: '+2.1%' 
      },
      cardsCreated: { 
        value: 7890, 
        change: '+5.5%' 
      },
      marketplaceVolume: { 
        value: 21567.50, 
        change: '-1.2%' 
      },
      dailyActiveUsers: { 
        value: 1203, 
        change: '+10.3%' 
      }
    },
    userGrowthChart: generateUserGrowthData()
  };
};

// This would be the API endpoint in a real backend
// For now, we just export the mock function