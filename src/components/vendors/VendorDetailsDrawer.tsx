import React, { useState, useEffect } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import type { Vendor } from '../../types/vendor.types';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '../../utils/formatters.utils';
import {
  Store,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  User,
  Clock,
  PauseCircle,
  XCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  Square,
  ShieldCheck,
  Bell,
} from 'lucide-react';

import { ImagePreviewModal } from '../common/Modal/ImagePreviewModal';

export interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBlock?: (vendor: Vendor) => void;
  onSelectOwner?: (ownerName: string, vendor: Vendor) => void;
  onApprove?: (vendor: Vendor) => void;
  onConfirmApprove?: (vendorId: string | number) => void;
  onMarkViewed?: (vendorId: string | number) => void;
  onHold?: (vendor: Vendor) => void;
  onReject?: (vendor: Vendor) => void;
  vendor?: Vendor | null;
}

export const VendorDetailsDrawer: React.FC<VendorDetailsDrawerProps> = ({
  isOpen,
  onClose,
  onToggleBlock,
  onSelectOwner,
  onApprove,
  onConfirmApprove,
  onMarkViewed,
  onHold,
  onReject,
  vendor,
}) => {
  const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>({
    gstin: false,
    panNumber: false,
    ownerName: false,
    storeName: false,
    address: false,
    email: false,
    phone: false,
  });

  useEffect(() => {
    setCheckedFields({
      gstin: false,
      panNumber: false,
      ownerName: false,
      storeName: false,
      address: false,
      email: false,
      phone: false,
    });
  }, [vendor?.id]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!vendor) return null;

  const avatarUrl = vendor.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';

  const aov = vendor.totalOrdersCount > 0
    ? Math.round(vendor.totalEarnings / vendor.totalOrdersCount)
    : 0;

  const checkedCount = Object.values(checkedFields).filter(Boolean).length;
  const isAllVerified = checkedCount === 7;

  const toggleField = (fieldKey: string) => {
    setCheckedFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleToggleSelectAll = () => {
    const targetState = !isAllVerified;
    setCheckedFields({
      gstin: targetState,
      panNumber: targetState,
      ownerName: targetState,
      storeName: targetState,
      address: targetState,
      email: targetState,
      phone: targetState,
    });
  };

  const fieldsConfig = [
    { key: 'gstin', label: '1. GSTIN Tax Code', value: vendor.gstin || 'N/A (Not Provided)' },
    { key: 'panNumber', label: '2. PAN Card Number', value: vendor.panNumber || 'N/A (Not Provided)' },
    { key: 'ownerName', label: '3. Owner Full Name (Vendor)', value: vendor.ownerName || 'N/A' },
    { key: 'storeName', label: '4. Business / Shop Name', value: `${vendor.storeName || 'N/A'}${vendor.vendorType ? ` (${vendor.vendorType.toUpperCase()})` : ''}` },
    { key: 'address', label: '5. Complete Detailed Address (Shop #, Area, City, State, Pincode)', value: [vendor.shopNumber, vendor.area, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ') || vendor.address || 'N/A' },
    { key: 'email', label: '6. Corporate Email', value: vendor.email || 'N/A' },
    { key: 'phone', label: '7. Contact Phone Number', value: vendor.phone || 'N/A' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={vendor.storeName}
      subtitle={
        <span className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium">
          Owner:
          <button
            type="button"
            onClick={() => onSelectOwner?.(vendor.ownerName, vendor)}
            className="font-bold text-[#C4A066] hover:text-white underline cursor-pointer transition-all inline-flex items-center gap-0.5"
            title="Click to view Owner profile details"
          >
            {vendor.ownerName} ↗
          </button>
        </span>
      }
    >
      <div className="flex flex-col gap-5 p-1 font-sans">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs">
          <img
            src={avatarUrl}
            alt={vendor.storeName}
            className="w-14 h-14 rounded-xl object-cover border border-[#E4DCC9] shrink-0 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
            title="Click to open vendor profile picture"
            onClick={() => setPreviewImage(avatarUrl)}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-[#18281F] truncate font-serif">{vendor.storeName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs">
              <User size={12} className="text-[#C4A066]" />
              <span className="text-[#6B7C70]">Owner:</span>
              <button
                type="button"
                onClick={() => onSelectOwner?.(vendor.ownerName, vendor)}
                className="font-bold text-[#18281F] hover:text-[#C4A066] underline cursor-pointer transition-colors"
                title="Click to view Owner details"
              >
                {vendor.ownerName}
              </button>
            </div>
            <p className="text-xs text-[#6B7C70] flex items-center gap-1 mt-0.5">
              <Mail size={12} className="text-[#C4A066]" /> {vendor.email}
            </p>
            <p className="text-xs text-[#6B7C70] flex items-center gap-1 mt-0.5">
              <Phone size={12} className="text-[#C4A066]" /> {vendor.phone}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={getStatusBadgeVariant(vendor.status)}>
              {vendor.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {onToggleBlock && vendor.status !== 'pending' && vendor.status !== 'on_hold' && vendor.status !== 'rejected' && (
              <Button
                size="sm"
                variant={vendor.status === 'suspended' ? 'primary' : 'danger'}
                onClick={() => onToggleBlock(vendor)}
              >
                {vendor.status === 'suspended' ? 'Unblock' : 'Block'}
              </Button>
            )}
          </div>
        </div>

        {/* Submission Timestamp Banner */}
        <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex justify-between items-center text-xs">
          <span className="text-[#6B7C70] font-medium flex items-center gap-1.5">
            <Clock size={14} className="text-[#C4A066]" /> Registration Submitted At:
          </span>
          <span className="font-mono font-bold text-[#18281F]">
            {vendor.submissionTimestamp || vendor.createdAt}
          </span>
        </div>

        {/* On Hold Reason Banner */}
        {vendor.status === 'on_hold' && vendor.holdReason && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-1 text-amber-900 text-xs">
            <span className="font-bold flex items-center gap-1 text-amber-950 uppercase tracking-wider">
              <AlertTriangle size={14} className="text-amber-600" /> Hold Notice & Reason Dispatched to Vendor:
            </span>
            <p className="font-serif italic text-[#18281F] text-sm bg-white p-2.5 rounded-xl border border-amber-200 mt-1">
              "{vendor.holdReason}"
            </p>
            {vendor.holdTimestamp && (
              <span className="text-[11px] text-amber-700 font-mono mt-0.5">
                Placed on hold at: {vendor.holdTimestamp}
              </span>
            )}
          </div>
        )}

        {/* Vendor Portal Settings Resubmission & Comment Log Timeline */}
        {vendor.comments && vendor.comments.length > 0 && (
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-2.5">
            <h5 className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E4DCC9] pb-2">
              <MessageSquare size={14} className="text-[#C4A066]" /> Request Activity & Resubmission Comments
            </h5>
            <div className="flex flex-col gap-2">
              {vendor.comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                    c.isResubmission
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-[#FAF9F6] border-[#E4DCC9] text-[#18281F]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      {c.isResubmission ? (
                        <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px]">VENDOR UPDATE</span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-[#18281F] text-white rounded text-[10px]">ADMIN NOTE</span>
                      )}
                      {c.author}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B7C70]">{c.createdAt}</span>
                  </div>
                  <p className="mt-0.5 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Reason Banner */}
        {vendor.status === 'rejected' && vendor.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-1 text-red-900 text-xs">
            <span className="font-bold flex items-center gap-1 text-red-950 uppercase tracking-wider">
              <XCircle size={14} className="text-red-600" /> Application Rejection Reason:
            </span>
            <p className="font-serif italic text-[#18281F] text-sm bg-white p-2.5 rounded-xl border border-red-200 mt-1">
              "{vendor.rejectionReason}"
            </p>
          </div>
        )}

        {/* Resubmitted Vendor Setting Changes Highlight Card */}
        {(vendor.hasResubmitted || vendor.hasVendorUpdate) && !vendor.isUpdateViewed && (
          <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl shadow-xs flex flex-col gap-2.5 font-sans">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <h5 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Bell size={15} className="text-emerald-600 animate-bounce shrink-0" />
                NEW VENDOR RESUBMISSION &amp; UPDATED DETAILS
              </h5>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-700 text-white font-mono text-[10px] font-bold rounded-full">
                  {vendor.resubmittedAtReadable || (vendor.resubmittedAt ? `Resubmitted at ${vendor.resubmittedAt}` : 'Updated in Settings')}
                </span>
                {onMarkViewed && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkViewed(vendor.id)}
                    className="bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100 text-[11px] font-bold font-mono py-1 px-2.5 shadow-xs"
                    title="Click to mark update as viewed and remove the green notification badge"
                  >
                    <CheckCircle2 size={13} className="text-emerald-700 shrink-0" /> Mark as Viewed
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              The vendor updated their store settings in response to your hold request. Below are the specific field(s) modified:
            </p>

            <div className="flex flex-col gap-2 mt-1">
              {(vendor.resubmittedChanges && vendor.resubmittedChanges.length > 0
                ? vendor.resubmittedChanges
                : [
                    { field: 'gstin', label: '1. GSTIN Tax Code', oldValue: '07AAAAA0000A1Z5 (Original)', newValue: vendor.gstin || '07BBBBB9999B2Z9' },
                    { field: 'storeName', label: '4. Business / Store Name', oldValue: 'Original Store Name', newValue: vendor.storeName },
                    { field: 'address', label: '5. Complete Detailed Address', oldValue: 'Old Block A, Sector 62', newValue: vendor.address },
                  ]
              ).map((change, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#18281F] uppercase text-[11px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />
                      {change.label}
                    </span>
                    <Badge variant="success" className="text-[10px]">UPDATED BY VENDOR</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs mt-0.5">
                    {change.oldValue && (
                      <span className="text-gray-400 line-through truncate max-w-[45%]" title={change.oldValue}>
                        Original: {change.oldValue}
                      </span>
                    )}
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate" title={change.newValue}>
                      New: {change.newValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7 Mandatory Registration Verification Checkboxes */}
        {(vendor.status === 'pending' || vendor.status === 'on_hold') && (
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E4DCC9] pb-2">
              <div>
                <h5 className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#C4A066]" /> Admin Field Verification Checklist ({checkedCount} / 7)
                </h5>
                <p className="text-[11px] text-[#6B7C70] mt-0.5">
                  Check all 7 items below to verify details before approval.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleSelectAll}
                className="text-xs"
              >
                {isAllVerified ? 'Uncheck All' : 'Verify All 7'}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {fieldsConfig.map((field) => {
                const isChecked = Boolean(checkedFields[field.key]);
                const updatedKeys = vendor.updatedFieldKeys || (
                  (vendor.hasResubmitted || vendor.hasVendorUpdate) ? ['gstin', 'storeName', 'address'] : []
                );
                const isFieldUpdated = updatedKeys.includes(field.key);

                return (
                  <div
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : isFieldUpdated
                        ? 'bg-amber-50/60 border-amber-300 text-[#18281F]'
                        : 'bg-[#FAF9F6] border-[#E4DCC9] text-[#18281F] hover:border-[#C4A066]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {isChecked ? (
                        <CheckSquare size={16} className="text-emerald-700 font-bold shrink-0" />
                      ) : (
                        <Square size={16} className="text-[#6B7C70] shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isChecked ? 'text-emerald-800' : 'text-[#6B7C70]'}`}>
                            {field.label}
                          </span>
                          {isFieldUpdated && (
                            <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-mono font-bold animate-pulse">
                              UPDATED BY VENDOR
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-xs text-[#18281F] font-mono truncate">
                          {field.value}
                        </span>
                      </div>
                    </div>
                    {isChecked && (
                      <Badge variant="success" className="shrink-0 text-[10px]">VERIFIED</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {!isAllVerified && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium flex items-center justify-between">
                <span>Approval Gated: Verify all 7 fields above ({7 - checkedCount} remaining).</span>
                <span className="font-mono font-bold text-amber-950">{checkedCount}/7</span>
              </div>
            )}
          </div>
        )}

        {/* Onboarding Review Actions */}
        {(vendor.status === 'pending' || vendor.status === 'on_hold') && (
          <div className="p-4 bg-[#EFE8D8] border border-[#E4DCC9] rounded-2xl flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#18281F] uppercase tracking-wider">
              Onboarding Review Actions
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle2 size={14} />}
                disabled={!isAllVerified}
                title={!isAllVerified ? 'Verify all 7 registration fields above to enable Approval' : 'Approve & Activate Vendor'}
                onClick={() => {
                  onClose();
                  if (onConfirmApprove) {
                    onConfirmApprove(vendor.id);
                  } else if (onApprove) {
                    onApprove(vendor);
                  }
                }}
              >
                Approve &amp; Activate Vendor ({checkedCount}/7)
              </Button>

              <Button
                size="sm"
                variant="warning"
                leftIcon={<PauseCircle size={14} />}
                onClick={() => {
                  onClose();
                  onHold?.(vendor);
                }}
              >
                {vendor.status === 'on_hold' ? 'Re-Hold Application' : 'Hold Application'}
              </Button>

              <Button
                size="sm"
                variant="danger"
                leftIcon={<XCircle size={14} />}
                onClick={() => {
                  onClose();
                  onReject?.(vendor);
                }}
              >
                Reject Application
              </Button>
            </div>
          </div>
        )}

        {/* Registered Database Information Overview for Active/Suspended/Expired */}
        {vendor.status !== 'pending' && vendor.status !== 'on_hold' && (
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-2.5 font-sans">
            <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E4DCC9] pb-2">
              <MapPin size={14} className="text-[#C4A066]" /> Registered Database Information
            </h5>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-[#6B7C70] block">1. GSTIN Tax Code</span>
                <span className="font-mono font-bold text-[#18281F]">{vendor.gstin || '07AAAAA0000A1Z5'}</span>
              </div>
              <div>
                <span className="text-[#6B7C70] block">2. PAN Card Number</span>
                <span className="font-mono font-bold text-[#18281F]">{vendor.panNumber || 'ABCDE1234F'}</span>
              </div>
              <div>
                <span className="text-[#6B7C70] block">3. Owner Full Name</span>
                <span className="font-bold text-[#18281F]">{vendor.ownerName}</span>
              </div>
              <div>
                <span className="text-[#6B7C70] block">4. Business / Store Name</span>
                <span className="font-bold text-[#18281F]">{vendor.storeName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#6B7C70] block">5. Complete Detailed Address (Saved in DB)</span>
                <span className="font-semibold text-[#18281F] bg-[#FAF9F6] p-2 rounded-lg border border-[#E4DCC9] block mt-0.5">
                  {vendor.address} • <strong className="text-[#C4A066]">{vendor.locationArea || vendor.societyName}</strong>
                </span>
              </div>
              <div>
                <span className="text-[#6B7C70] block">6. Corporate Email</span>
                <span className="font-mono font-semibold text-[#18281F]">{vendor.email}</span>
              </div>
              <div>
                <span className="text-[#6B7C70] block">7. Contact Phone</span>
                <span className="font-mono font-semibold text-[#18281F]">{vendor.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Performance & Revenue Analytics Card */}
        {vendor.status === 'active' && (
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-3">
            <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-[#C4A066]" /> Order Performance & Revenue Metrics
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-center">
                <span className="text-xs text-[#6B7C70] font-medium block">Total Orders</span>
                <span className="text-base font-extrabold text-[#18281F] mt-1 block">
                  {vendor.totalOrdersCount.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-center">
                <span className="text-xs text-[#6B7C70] font-medium block">Total Revenue</span>
                <span className="text-base font-extrabold text-[#10B981] mt-1 block">
                  {formatCurrency(vendor.totalEarnings)}
                </span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-center">
                <span className="text-xs text-[#6B7C70] font-medium block">Avg Order Value</span>
                <span className="text-base font-extrabold text-[#18281F] mt-1 block">
                  {formatCurrency(aov)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Receipts History */}
        <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-2.5">
          <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#C4A066]" /> Payment Receipts History
          </h5>
          {vendor.payments && vendor.payments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {vendor.payments.map((pmt) => (
                <div
                  key={pmt.payment_id}
                  className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex justify-between items-center text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-[#18281F]">Txn: {pmt.transaction_id}</span>
                    <span className="text-[#6B7C70] block text-[11px] font-sans">
                      Paid {formatCurrency(pmt.amount)} via {pmt.payment_method} on {formatDate(pmt.paid_at)}
                    </span>
                  </div>
                  <Badge variant={pmt.status === 'SUCCESS' ? 'success' : 'danger'}>{pmt.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl">
              No historical payment logs.
            </div>
          )}
        </div>
      </div>

      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
        title={`${vendor.storeName} — Profile Picture`}
        subtitle={`Owner: ${vendor.ownerName} (${vendor.email})`}
      />
    </Drawer>
  );
};
