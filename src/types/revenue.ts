// Revenue data types as specified in the detailed requirements

export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  type: 'Sale' | 'Royalty' | 'Adjustment';
  description: string;
  amount: number;
  status: 'Completed' | 'Pending';
}

export interface Payout {
  id: string;
  requestDate: string;
  completionDate?: string;
  amount: number;
  status: 'Pending' | 'In Transit' | 'Completed' | 'Failed';
  transactionId?: string;
}

export interface RevenueSummary {
  balance: number;
  pendingBalance: number;
  hasStripeAccount: boolean;
  earningsHistory: { date: string; earnings: number }[]; // Last 30 days
  recentTransactions: Transaction[]; // Last 10
  payoutHistory: Payout[];
}

// Legacy interface for backward compatibility with current API
export interface LegacyRevenueData {
  balance: number;
  hasStripeAccount: boolean;
  recentTransactions: any[];
  payoutHistory: any[];
  salesAnalytics: any;
}