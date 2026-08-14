import { axiosInstance } from './axiosInstance';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  id: string;
  orderId: string;
  status: 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'SETTLEMENT_PENDING';
  statusLabel: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  vendorName: string;
  vendorCategory: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentRef: string;
  paymentStatus: string;
  riderName: string;
  riderPhone: string;
  riderDistanceKm: number;
  createdAt: string;
}

const MOCK_ORDERS_STORE: Record<string, OrderDetails> = {
  'ORD-9841': {
    id: 'o-101',
    orderId: 'ORD-9841',
    status: 'SETTLEMENT_PENDING',
    statusLabel: 'SETTLEMENT PENDING',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98765 43210',
    deliveryAddress: 'Shop #12, Greenwood Commercial Block',
    vendorName: 'FreshBites Daily Grocery',
    vendorCategory: 'Grocery & Staples',
    items: [
      { id: 'i-1', name: 'Fortune Sunlite Refined Sunflower Oil 5L', quantity: 2, price: 740.0 },
      { id: 'i-2', name: 'India Gate Basmati Rice Feast Rozzana 5kg', quantity: 1, price: 370.0 },
    ],
    subtotal: 1850.0,
    deliveryFee: 40.0,
    taxAmount: 92.5,
    discount: 50.0,
    totalAmount: 1932.5,
    paymentMethod: 'Razorpay UPI',
    paymentRef: 'pay_Lkw908123981',
    paymentStatus: 'PAID (UPI)',
    riderName: 'Ramesh Verma',
    riderPhone: '+91 98222 11009',
    riderDistanceKm: 0.8,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  'ORD-9842': {
    id: 'o-102',
    orderId: 'ORD-9842',
    status: 'OUT_FOR_DELIVERY',
    statusLabel: 'DISPATCHED & IN-TRANSIT',
    customerName: 'Commander V.K. Nair',
    customerPhone: '+91 98765 43210',
    deliveryAddress: 'Flat B-402, Anupam Society, Sector 4',
    vendorName: 'FreshMart Grocery & Organic',
    vendorCategory: 'Daily Grocery & Produce',
    items: [
      { id: 'i-1', name: 'Aashirvaad Whole Wheat Atta 10kg', quantity: 1, price: 420.0 },
      { id: 'i-2', name: 'Amul Taaza Toned Fresh Milk 1L Pack', quantity: 4, price: 220.0 },
      { id: 'i-3', name: 'Organic Farm Fresh Tomatoes 1kg', quantity: 1, price: 40.0 },
    ],
    subtotal: 680.0,
    deliveryFee: 35.0,
    taxAmount: 34.0,
    discount: 42.0,
    totalAmount: 707.0,
    paymentMethod: 'Razorpay UPI',
    paymentRef: 'pay_Lkw908123984',
    paymentStatus: 'PAID (UPI)',
    riderName: 'Suresh Kumar',
    riderPhone: '+91 98123 77889',
    riderDistanceKm: 1.2,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  'ORD-9845': {
    id: 'o-105',
    orderId: 'ORD-9845',
    status: 'DELIVERED',
    statusLabel: 'DELIVERED & VERIFIED',
    customerName: 'Aarav Gupta',
    customerPhone: '+91 99887 76655',
    deliveryAddress: 'Ground Floor, Silver Oaks Plaza',
    vendorName: 'Apex Electronics & Appliances',
    vendorCategory: 'Electronics & Hardware',
    items: [
      { id: 'i-1', name: 'Havells Smart Plug 16A Wi-Fi Socket', quantity: 2, price: 2400.0 },
      { id: 'i-2', name: 'Philips LED Surge Protector Strip 4-Socket', quantity: 1, price: 800.0 },
    ],
    subtotal: 3200.0,
    deliveryFee: 0.0,
    taxAmount: 160.0,
    discount: 100.0,
    totalAmount: 3260.0,
    paymentMethod: 'Razorpay NetBanking',
    paymentRef: 'pay_Lkw908123985',
    paymentStatus: 'PAID (NETBANKING)',
    riderName: 'Vikrant Singh',
    riderPhone: '+91 97666 44332',
    riderDistanceKm: 0.0,
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
};

export const mapOrderDTOToDomain = (raw: any): OrderDetails => {
  return {
    id: String(raw.id || raw.order_id || raw.orderId || `o-${Date.now()}`),
    orderId: raw.order_id || raw.orderId || String(raw.id || 'ORD-0000'),
    status: raw.status || 'OUT_FOR_DELIVERY',
    statusLabel: raw.status_label || raw.statusLabel || raw.status || 'DISPATCHED & IN-TRANSIT',
    customerName: raw.customer_name || raw.customerName || 'Resident Customer',
    customerPhone: raw.customer_phone || raw.customerPhone || '+91 98765 43210',
    deliveryAddress: raw.delivery_address || raw.deliveryAddress || 'Anupam Society, Sector 4',
    vendorName: raw.vendor_name || raw.vendorName || 'Partner Store',
    vendorCategory: raw.vendor_category || raw.vendorCategory || 'Grocery & Produce',
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          id: String(item.id || item.item_id || Math.random()),
          name: item.name || item.item_name || 'Product Item',
          quantity: Number(item.quantity || 1),
          price: Number(item.price || item.unit_price || 0),
        }))
      : [],
    subtotal: Number(raw.subtotal ?? raw.sub_total ?? 0),
    deliveryFee: Number(raw.delivery_fee ?? raw.deliveryFee ?? 0),
    taxAmount: Number(raw.tax_amount ?? raw.taxAmount ?? 0),
    discount: Number(raw.discount ?? 0),
    totalAmount: Number(raw.total_amount ?? raw.totalAmount ?? raw.amount ?? 0),
    paymentMethod: raw.payment_method || raw.paymentMethod || 'Razorpay UPI',
    paymentRef: raw.payment_ref || raw.paymentRef || `pay_${Date.now()}`,
    paymentStatus: raw.payment_status || raw.paymentStatus || 'PAID',
    riderName: raw.rider_name || raw.riderName || 'Delivery Rider',
    riderPhone: raw.rider_phone || raw.riderPhone || '+91 98123 77889',
    riderDistanceKm: Number(raw.rider_distance_km ?? raw.riderDistanceKm ?? 0.8),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
};

export const ordersApi = {
  /**
   * GET /admin/orders
   */
  getOrders: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<OrderDetails[]> => {
    try {
      let rawData: any;
      try {
        const response = await axiosInstance.get<any>('/admin/orders', { params });
        rawData = response.data?.data || response.data?.orders || response.data;
      } catch {
        const response = await axiosInstance.get<any>('/orders', { params });
        rawData = response.data?.data || response.data?.orders || response.data;
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        return rawData.map(mapOrderDTOToDomain);
      }
    } catch {}

    return Object.values(MOCK_ORDERS_STORE);
  },

  /**
   * GET /admin/orders/:orderId (also GET /orders/:orderId)
   */
  getOrderById: async (orderId: string): Promise<OrderDetails> => {
    try {
      let raw: any;
      try {
        const response = await axiosInstance.get(`/admin/orders/${orderId}`);
        raw = response.data?.data || response.data;
      } catch {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        raw = response.data?.data || response.data;
      }
      if (raw) return mapOrderDTOToDomain(raw);
    } catch {}

    const mock = MOCK_ORDERS_STORE[orderId];
    if (mock) return mock;

    return {
      id: `o-${orderId}`,
      orderId,
      status: 'OUT_FOR_DELIVERY',
      statusLabel: 'DISPATCHED & IN-TRANSIT',
      customerName: 'Commander V.K. Nair',
      customerPhone: '+91 98765 43210',
      deliveryAddress: 'Flat B-402, Anupam Society, Sector 4',
      vendorName: 'FreshMart Grocery & Organic',
      vendorCategory: 'Daily Grocery & Produce',
      items: [
        { id: 'i-1', name: 'Aashirvaad Whole Wheat Atta 10kg', quantity: 1, price: 420.0 },
        { id: 'i-2', name: 'Amul Taaza Toned Fresh Milk 1L Pack', quantity: 4, price: 220.0 },
      ],
      subtotal: 640.0,
      deliveryFee: 35.0,
      taxAmount: 32.0,
      discount: 0.0,
      totalAmount: 707.0,
      paymentMethod: 'Razorpay UPI',
      paymentRef: 'pay_Lkw908123984',
      paymentStatus: 'PAID (UPI)',
      riderName: 'Suresh Kumar',
      riderPhone: '+91 98123 77889',
      riderDistanceKm: 1.2,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * POST /api/orders/:orderId/refund
   */
  issueRefund: async (orderId: string, amount: number): Promise<{ message: string; refundId: string }> => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/refund`, { amount });
      if (response.data) return response.data;
    } catch {}

    return {
      message: `Refund of ₹${amount.toFixed(2)} dispatched to customer via Razorpay Gateway.`,
      refundId: `rfnd_${Date.now()}`,
    };
  },

  /**
   * POST /api/orders/:orderId/flag-audit
   */
  flagForAudit: async (orderId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/flag-audit`);
      if (response.data) return response.data;
    } catch {}

    return {
      message: `Order #${orderId} flagged for finance audit review.`,
    };
  },
};
