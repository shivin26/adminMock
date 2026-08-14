import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  PaymentTransaction,
  PaymentQueryParams,
  IssueRefundPayload,
  RevenueDashboardData,
} from '../../types/payment';
import { PaginatedResponse } from '../../types/api';
import { env } from '../../env';

// Mock Payment Transactions Data
let MOCK_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'TXN-9001',
    vendorId: 'vnd_1',
    storeName: 'Artisan Bakery Co.',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    amount: 145.5,
    platformFee: 7.28,
    vendorPayout: 138.22,
    currency: 'USD',
    gatewayMethod: 'stripe',
    gatewayTransactionId: 'ch_3MqwEr2eZvKYlo2C1g9R8kLz',
    status: 'success',
    receiptUrl: '/receipts/TXN-9001.pdf',
    invoiceUrl: '/invoices/TXN-9001.pdf',
    date: '2026-07-28',
    createdAt: '2026-07-28T14:20:00Z',
  },
  {
    id: 'TXN-9002',
    vendorId: 'vnd_2',
    storeName: 'GreenThumb Organics',
    customerName: 'Robert Lang',
    customerEmail: 'robert.lang@example.com',
    amount: 89.0,
    platformFee: 4.45,
    vendorPayout: 84.55,
    currency: 'USD',
    gatewayMethod: 'razorpay',
    gatewayTransactionId: 'pay_Lz98kRqWpQ1029',
    status: 'success',
    receiptUrl: '/receipts/TXN-9002.pdf',
    invoiceUrl: '/invoices/TXN-9002.pdf',
    date: '2026-07-27',
    createdAt: '2026-07-27T10:15:00Z',
  },
  {
    id: 'TXN-9003',
    vendorId: 'vnd_3',
    storeName: 'Metro Pottery Works',
    customerName: 'Michael Chang',
    customerEmail: 'm.chang@example.com',
    amount: 220.0,
    platformFee: 11.0,
    vendorPayout: 209.0,
    currency: 'USD',
    gatewayMethod: 'bank_transfer',
    gatewayTransactionId: 'ACH-889021-US',
    status: 'refunded',
    refundReason: 'Customer returned damaged pottery goods',
    receiptUrl: '/receipts/TXN-9003.pdf',
    invoiceUrl: '/invoices/TXN-9003.pdf',
    date: '2026-07-25',
    createdAt: '2026-07-25T16:45:00Z',
  },
  {
    id: 'TXN-9004',
    vendorId: 'vnd_4',
    storeName: 'Botanical Bloom Co.',
    customerName: 'Emma Watson',
    customerEmail: 'emma.w@example.com',
    amount: 65.0,
    platformFee: 3.25,
    vendorPayout: 61.75,
    currency: 'USD',
    gatewayMethod: 'digiwallet',
    gatewayTransactionId: 'DW-440192',
    status: 'pending',
    date: '2026-07-29',
    createdAt: '2026-07-29T11:00:00Z',
  },
];

const MOCK_REVENUE_DASHBOARD: RevenueDashboardData = {
  totalGrossVolume: 184950,
  netPlatformRevenue: 9247.5,
  totalRefundedAmount: 1420,
  successRate: 98.4,
  dailyVolumeTrend: [
    { date: 'Jul 23', volume: 18200, fee: 910 },
    { date: 'Jul 24', volume: 22400, fee: 1120 },
    { date: 'Jul 25', volume: 19800, fee: 990 },
    { date: 'Jul 26', volume: 25100, fee: 1255 },
    { date: 'Jul 27', volume: 28900, fee: 1445 },
    { date: 'Jul 28', volume: 31200, fee: 1560 },
    { date: 'Jul 29', volume: 34500, fee: 1725 },
  ],
  gatewayDistribution: [
    { name: 'Stripe', count: 850, amount: 115000, color: '#224636' },
    { name: 'Razorpay', count: 420, amount: 48000, color: '#cba358' },
    { name: 'Bank Transfer', count: 110, amount: 16000, color: '#827973' },
    { name: 'DigiWallet', count: 40, amount: 5950, color: '#2a2421' },
  ],
};

class PaymentService extends BaseApiService {
  constructor() {
    super(apiClient, '/payments');
  }

  public async getPayments(params?: PaymentQueryParams): Promise<PaginatedResponse<PaymentTransaction>> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let list = [...MOCK_PAYMENTS];

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.storeName.toLowerCase().includes(query) ||
            p.customerName.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.gatewayTransactionId.toLowerCase().includes(query)
        );
      }

      if (params?.status && params.status !== 'all') {
        list = list.filter((p) => p.status === params.status);
      }

      if (params?.gatewayMethod && params.gatewayMethod !== 'all') {
        list = list.filter((p) => p.gatewayMethod === params.gatewayMethod);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginatedItems = list.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        meta: {
          page,
          limit,
          totalItems: list.length,
          totalPages: Math.ceil(list.length / limit) || 1,
          hasNextPage: page * limit < list.length,
          hasPrevPage: page > 1,
        },
      };
    }

    return this.getPaginated<PaymentTransaction>('', params);
  }

  public async getPaymentById(id: string): Promise<PaymentTransaction> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      const found = MOCK_PAYMENTS.find((p) => p.id === id);
      if (!found) throw new Error('Transaction not found');
      return found;
    }
    return this.get<PaymentTransaction>(`/${id}`);
  }

  public async getRevenueDashboard(): Promise<RevenueDashboardData> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_REVENUE_DASHBOARD;
    }
    return this.get<RevenueDashboardData>('/revenue-dashboard');
  }

  public async issueRefund(payload: IssueRefundPayload): Promise<PaymentTransaction> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      let updated: PaymentTransaction | null = null;
      MOCK_PAYMENTS = MOCK_PAYMENTS.map((p) => {
        if (p.id === payload.transactionId) {
          updated = {
            ...p,
            status: 'refunded',
            refundReason: payload.reason,
          };
          return updated;
        }
        return p;
      });
      if (!updated) throw new Error('Transaction not found');
      return updated;
    }
    return this.post<PaymentTransaction, IssueRefundPayload>(`/${payload.transactionId}/refund`, payload);
  }

  public async downloadReceipt(id: string): Promise<string> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return `/receipts/${id}.pdf`;
    }
    return this.get<string>(`/${id}/receipt`);
  }

  public async downloadInvoice(id: string): Promise<string> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return `/invoices/${id}.pdf`;
    }
    return this.get<string>(`/${id}/invoice`);
  }
}

export const paymentService = new PaymentService();
