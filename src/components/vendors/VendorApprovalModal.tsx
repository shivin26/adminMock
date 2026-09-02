import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import type { Vendor } from '../../types/vendor.types';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import {
  CreditCard,
  Store,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  MapPin,
  Building,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertTriangle,
  Bell,
} from 'lucide-react';

import { ImagePreviewModal } from '../common/Modal/ImagePreviewModal';

export interface VendorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (vendorId: string | number) => void;
  onHoldRequest?: (vendor: Vendor) => void;
  onRejectRequest?: (vendor: Vendor) => void;
  onMarkViewed?: (vendorId: string | number) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
}

export const VendorApprovalModal: React.FC<VendorApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirmApprove,
  onHoldRequest,
  onRejectRequest,
  onMarkViewed,
  vendor,
  isLoading = false,
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

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!vendor) return null;

  const avatarUrl = vendor.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';

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
    { key: 'email', label: '6. Corporate Email Address', value: vendor.email || 'N/A' },
    { key: 'phone', label: '7. Contact Phone Number', value: vendor.phone || 'N/A' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Registration Field Verification & Approval Review"
      subtitle={`Store: ${vendor.storeName} (${vendor.ownerName})`}
      size="lg"
    >
      <div className="flex flex-col gap-5 font-sans">
        {/* Vendor Header */}
        <div className="flex items-start gap-4 p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl">
          <img
            src={avatarUrl}
            alt={vendor.storeName}
            className="w-16 h-16 rounded-xl object-cover border border-[#E7DFD5] shrink-0 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
            title="Click to open vendor profile picture"
            onClick={() => setPreviewImage(avatarUrl)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-base font-bold text-[#211A19] font-serif truncate">{vendor.storeName}</h4>
              <Badge variant={vendor.status === 'on_hold' ? 'warning' : 'primary'}>
                {vendor.status === 'on_hold' ? 'ON HOLD' : 'PENDING APPROVAL'}
              </Badge>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">
              Category: <strong className="text-[#211A19]">{vendor.category}</strong>
            </p>
            <p className="text-xs text-[#78716C] flex items-center gap-1.5 mt-1 font-mono font-semibold text-[#C8A878]">
              <Clock size={13} /> Submitted at: {vendor.submissionTimestamp || vendor.createdAt}
            </p>
          </div>
        </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {(vendor.resubmittedChanges && vendor.resubmittedChanges.length > 0
                ? vendor.resubmittedChanges
                : (vendor.updatedFieldKeys && vendor.updatedFieldKeys.length > 0
                    ? vendor.updatedFieldKeys.map((key) => {
                        const match = fieldsConfig.find((f) => f.key === key);
                        return {
                          field: key,
                          label: match?.label || key,
                          oldValue: undefined,
                          newValue: (vendor as any)[key] || '',
                        };
                      })
                    : (vendor.gstin ? [{ field: 'gstin', label: '1. GSTIN Tax Code', oldValue: undefined, newValue: vendor.gstin }] : [])
                  )
              ).map((change, idx) => (
                <div key={idx} className={`p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex flex-col gap-1 ${change.field === 'address' ? 'sm:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#211A19] uppercase text-[11px] flex items-center gap-1">
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

        {/* 7 Mandatory Registration Fields Checklist */}
        <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2.5">
            <div>
              <h5 className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#C8A878]" /> Admin Field Verification Checklist ({checkedCount} / 7 Verified)
              </h5>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Admin must check and verify all 7 submitted registration items below to unlock the <strong>Approve</strong> button.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSelectAll}
              className="text-xs"
            >
              {isAllVerified ? 'Uncheck All' : 'Verify All 7 Fields'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fieldsConfig.map((field) => {
              const isChecked = Boolean(checkedFields[field.key]);
              const updatedKeys = (vendor.updatedFieldKeys && vendor.updatedFieldKeys.length > 0)
                ? vendor.updatedFieldKeys
                : (vendor.resubmittedChanges && vendor.resubmittedChanges.length > 0)
                ? vendor.resubmittedChanges.map((c) => c.field)
                : ['gstin'];
              const isFieldUpdated = updatedKeys.includes(field.key);

              return (
                <div
                  key={field.key}
                  onClick={() => toggleField(field.key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : isFieldUpdated
                      ? 'bg-amber-50/60 border-amber-300 text-[#211A19]'
                      : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#211A19] hover:border-[#C8A878]'
                  } ${field.key === 'address' ? 'sm:col-span-2' : ''}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare size={18} className="text-emerald-700 font-bold" />
                    ) : (
                      <Square size={18} className="text-[#78716C]" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isChecked ? 'text-emerald-800' : 'text-[#78716C]'}`}>
                        {field.label}
                      </span>
                      {isFieldUpdated && (
                        <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-mono font-bold animate-pulse">
                          UPDATED BY VENDOR
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-xs mt-0.5 font-mono text-[#211A19] break-words">
                      {field.value}
                    </span>
                  </div>

                  {isChecked && (
                    <Badge variant="success" className="ml-auto shrink-0 text-[10px]">
                      VERIFIED
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval Gating Status Notice */}
        {!isAllVerified && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 font-medium">
            <span className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>
                Approval Gated: <strong>{7 - checkedCount} field(s)</strong> remaining to be checked before Approval is enabled.
              </span>
            </span>
            <span className="font-mono font-bold px-2 py-0.5 bg-amber-200 text-amber-950 rounded-md">
              {checkedCount} / 7 Verified
            </span>
          </div>
        )}

        {/* Payment History Verification Card */}
        <div className="flex flex-col gap-2">
          <h5 className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={15} className="text-[#C8A878]" /> Onboarding Subscription Payment Receipt
          </h5>
          {vendor.payments && vendor.payments.length > 0 ? (
            vendor.payments.map((pmt) => (
              <div
                key={pmt.payment_id}
                className="p-3 bg-[#EEE5DA] border border-[#E7DFD5] rounded-xl flex justify-between items-center text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-[#211A19]">Txn ID: {pmt.transaction_id}</span>
                  <span className="text-[#78716C] block text-[11px] font-sans">
                    Paid {formatCurrency(pmt.amount)} via {pmt.payment_method} on {formatDate(pmt.paid_at)}
                  </span>
                </div>
                <Badge variant={pmt.status === 'SUCCESS' ? 'success' : 'danger'}>{pmt.status}</Badge>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-[#78716C] bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl">
              No subscription payment receipts attached.
            </div>
          )}
        </div>

        {/* Action Controls: Hold & Reject always enabled, Approve gated */}
        <div className="flex flex-wrap justify-between items-center gap-3 mt-2 pt-4 border-t border-[#E7DFD5]">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {onRejectRequest && (
              <Button
                variant="danger"
                leftIcon={<XCircle size={15} />}
                onClick={() => {
                  onClose();
                  onRejectRequest(vendor);
                }}
              >
                Reject Application
              </Button>
            )}

            {onHoldRequest && (
              <Button
                variant="warning"
                leftIcon={<PauseCircle size={15} />}
                onClick={() => {
                  onClose();
                  onHoldRequest(vendor);
                }}
              >
                {vendor.status === 'on_hold' ? 'Re-Hold Application' : 'Hold Application'}
              </Button>
            )}

            <Button
              variant="primary"
              leftIcon={<CheckCircle2 size={16} />}
              isLoading={isLoading}
              disabled={!isAllVerified}
              title={!isAllVerified ? 'All 7 registration items must be checked by Admin to approve' : 'Approve & Activate Vendor'}
              onClick={() => onConfirmApprove(vendor.id)}
            >
              Approve & Activate Vendor ({checkedCount}/7)
            </Button>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
        title={`${vendor.storeName} — Profile Picture`}
        subtitle={`Owner: ${vendor.ownerName} (${vendor.email})`}
      />
    </Modal>
  );
};
