export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export type PaymentGatewayMethod = 'stripe' | 'razorpay' | 'bank_transfer' | 'digiwallet';

export interface PaymentTransaction {
  id: string;
  vendorId: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  platformFee: number;
  vendorPayout: number;
  currency: string;
  gatewayMethod: PaymentGatewayMethod;
  gatewayTransactionId: string;
  status: PaymentStatus;
  refundReason?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  date: string;
  createdAt: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus | 'all';
  gatewayMethod?: PaymentGatewayMethod | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface IssueRefundPayload {
  transactionId: string;
  refundAmount: number;
  reason: string;
}

export interface RevenueDashboardData {
  totalGrossVolume: number;
  netPlatformRevenue: number;
  totalRefundedAmount: number;
  successRate: number;
  dailyVolumeTrend: Array<{ date: string; volume: number; fee: number }>;
  gatewayDistribution: Array<{ name: string; count: number; amount: number; color: string }>;
}
