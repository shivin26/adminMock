import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { ordersApi } from '../../services/api/orders.api';
import {
  ShoppingBag,
  User,
  Store,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldAlert,
  PhoneCall,
  Package,
} from 'lucide-react';
import type { SupportTicket } from '../../types/support.types';

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
  ticket?: SupportTicket | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  orderId,
  ticket,
}) => {
  const { addToast } = useToast();
  const activeOrderId = orderId || ticket?.orderId || 'ORD-9842';

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['orders', 'detail', activeOrderId],
    queryFn: () => ordersApi.getOrderById(activeOrderId),
    enabled: isOpen && Boolean(activeOrderId),
  });

  if (!isOpen) return null;

  const handleIssueRefund = async () => {
    const res = await ordersApi.issueRefund(activeOrderId, orderData?.totalAmount || 707.0);
    addToast({
      type: 'success',
      title: 'Full Order Refund Dispatched',
      description: res.message,
    });
    onClose();
  };

  const handleFlagFinanceAudit = async () => {
    const res = await ordersApi.flagForAudit(activeOrderId);
    addToast({
      type: 'warning',
      title: 'Order Flagged for Audit',
      description: res.message,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details #${activeOrderId}`}
      subtitle="Complete backend order breakdown, itemized catalog, payment status, and delivery tracking"
      size="lg"
    >
      {isLoading || !orderData ? (
        <div className="p-12 text-center">
          <LoadingSpinner size="md" label="Fetching live order details from backend..." />
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Top Order Status Header */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#18281F] text-[#C4A066] flex items-center justify-center font-bold">
                <ShoppingBag size={22} />
              </div>
              <div>
                <span className="font-mono font-bold text-sm text-[#18281F]">#{orderData.orderId}</span>
                <span className="text-xs text-[#6B7C70] block">Placed on {new Date(orderData.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <Badge variant="warning">{orderData.statusLabel}</Badge>
          </div>

          {/* Customer & Store Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-[#E4DCC9] rounded-xl flex items-start gap-2.5 shadow-xs">
              <User size={16} className="text-[#C4A066] mt-0.5" />
              <div>
                <span className="text-[#6B7C70] block text-[10px] uppercase font-bold">Customer / Resident</span>
                <span className="font-bold text-[#18281F]">{orderData.customerName}</span>
                <span className="text-[11px] text-[#6B7C70] block mt-0.5 flex items-center gap-1">
                  <MapPin size={10} /> {orderData.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#E4DCC9] rounded-xl flex items-start gap-2.5 shadow-xs">
              <Store size={16} className="text-[#C4A066] mt-0.5" />
              <div>
                <span className="text-[#6B7C70] block text-[10px] uppercase font-bold">Fulfilling Vendor Store</span>
                <span className="font-bold text-[#18281F]">{orderData.vendorName}</span>
                <span className="text-[11px] text-[#6B7C70] block mt-0.5">Category: {orderData.vendorCategory}</span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
              <Package size={14} className="text-[#C4A066]" /> Order Items Breakdown ({orderData.items.length})
            </span>

            <div className="border border-[#E4DCC9] rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-[#FAF9F6] p-2.5 font-bold text-[#18281F] border-b border-[#E4DCC9]">
                <span className="col-span-7">Item Name</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Price</span>
              </div>

              {orderData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 p-2.5 border-b border-[#E4DCC9]/60 items-center last:border-0">
                  <span className="col-span-7 font-medium text-[#18281F]">{item.name}</span>
                  <span className="col-span-2 text-center font-mono font-semibold">{item.quantity}</span>
                  <span className="col-span-3 text-right font-mono font-bold">₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Financial Breakdown */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DCC9]">
              <span className="font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#C4A066]" /> Payment &amp; Razorpay Gateway Summary
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {orderData.paymentStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6B7C70]">
              <span>Items Subtotal:</span>
              <span className="font-mono font-semibold text-[#18281F]">₹{orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[#6B7C70]">
              <span>Delivery &amp; Logistics Charge:</span>
              <span className="font-mono font-semibold text-[#18281F]">₹{orderData.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[#6B7C70]">
              <span>Platform Service Tax (GST 5%):</span>
              <span className="font-mono font-semibold text-[#18281F]">₹{orderData.taxAmount.toFixed(2)}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex items-center justify-between text-[#6B7C70]">
                <span>Vendor Promo Discount:</span>
                <span className="font-mono font-semibold text-emerald-700">- ₹{orderData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#E4DCC9] font-bold text-sm text-[#18281F]">
              <span>Total Order Amount:</span>
              <span className="font-mono text-[#C4A066]">₹{orderData.totalAmount.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[#6B7C70] block mt-1">
              Transaction Ref: <strong className="font-mono text-[#18281F]">{orderData.paymentRef}</strong> • Method: {orderData.paymentMethod}
            </span>
          </div>

          {/* Live Delivery Partner Status Tracker */}
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl flex flex-col gap-2.5 shadow-xs">
            <span className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
              <Truck size={14} className="text-[#C4A066]" /> Live Rider Delivery Tracking
            </span>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Truck size={14} className="text-amber-600 animate-pulse" /> Rider: {orderData.riderName} ({orderData.riderPhone})
                </span>
                <span className="text-[11px] text-amber-800">
                  Current Location: {orderData.riderDistanceKm > 0 ? `${orderData.riderDistanceKm} km from delivery destination` : 'Arrived at destination'}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<PhoneCall size={12} />}
                onClick={() =>
                  addToast({
                    type: 'info',
                    title: 'Calling Delivery Rider',
                    description: `Initiating dispatch call to rider ${orderData.riderName}...`,
                  })
                }
              >
                Call Rider
              </Button>
            </div>
          </div>

          {/* Admin Order Action Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E4DCC9]">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldAlert size={14} className="text-amber-600" />}
              onClick={handleFlagFinanceAudit}
            >
              Flag for Audit
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw size={14} className="text-rose-600" />}
              className="text-rose-700 border-rose-200 hover:bg-rose-50 font-bold"
              onClick={handleIssueRefund}
            >
              Issue Full Refund (₹{orderData.totalAmount.toFixed(2)})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
