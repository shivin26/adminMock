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
import { useToast } from '../../context/ToastContext';
import { useTickets } from '../../hooks/useSupport';
import { SupportTicketStatusBadge } from '../support/SupportTicketStatusBadge';

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
  const { addToast } = useToast();
  const { data: allTickets = [] } = useTickets();
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
  const [showRawJson, setShowRawJson] = useState(false);

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

  const vendorTickets = React.useMemo(() => {
    if (!vendor) return [];
    const sName = (vendor.storeName || '').toLowerCase();
    const oName = (vendor.ownerName || '').toLowerCase();
    const vEmail = (vendor.email || '').toLowerCase();

    return allTickets.filter((t) => {
      const tEmail = (t.reporterEmail || '').toLowerCase();
      const tName = (t.reporterName || '').toLowerCase();
      const tEntity = (t.entityName || '').toLowerCase();
      const tSubj = (t.subject || '').toLowerCase();
      const tTarget = (t.targetVendor || '').toLowerCase();

      const isByVendor = (vEmail && tEmail === vEmail) || (oName && tName.includes(oName));
      const isOnVendor = (sName && (tEntity.includes(sName) || tTarget.includes(sName) || tSubj.includes(sName)));

      return isByVendor || isOnVendor;
    });
  }, [vendor, allTickets]);

  if (!vendor) return null;

  const generatedByVendorCount = vendorTickets.filter(
    (t) => (vendor.email && t.reporterEmail?.toLowerCase() === vendor.email.toLowerCase()) ||
           (vendor.ownerName && t.reporterName?.toLowerCase().includes(vendor.ownerName.toLowerCase()))
  ).length;

  const reportedOnVendorCount = vendorTickets.length - generatedByVendorCount;

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
      size="xl"
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
      <div className="flex flex-col gap-6 p-1 font-sans">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs">
          <img
            src={avatarUrl}
            alt={vendor.storeName}
            className="w-16 h-16 rounded-xl object-cover border border-[#E4DCC9] shrink-0 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
            title="Click to open vendor profile picture"
            onClick={() => setPreviewImage(avatarUrl)}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-[#18281F] truncate font-serif">{vendor.storeName}</h4>
            <div className="flex items-center gap-4 mt-1 text-xs">
              <span className="flex items-center gap-1 text-[#6B7C70]">
                <User size={13} className="text-[#C4A066]" /> Owner:
                <button
                  type="button"
                  onClick={() => onSelectOwner?.(vendor.ownerName, vendor)}
                  className="font-bold text-[#18281F] hover:text-[#C4A066] underline cursor-pointer transition-colors ml-0.5"
                  title="Click to view Owner details"
                >
                  {vendor.ownerName}
                </button>
              </span>
              <span className="text-[#6B7C70] flex items-center gap-1">
                <Mail size={13} className="text-[#C4A066]" /> {vendor.email}
              </span>
              <span className="text-[#6B7C70] flex items-center gap-1">
                <Phone size={13} className="text-[#C4A066]" /> {vendor.phone}
              </span>
            </div>
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

        {/* On Hold Reason Banner */}
        {vendor.status === 'on_hold' && vendor.holdReason && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-1 text-amber-900 text-xs">
            <span className="font-bold flex items-center gap-1 text-amber-950 uppercase tracking-wider">
              <AlertTriangle size={14} className="text-amber-600" /> Hold Notice &amp; Reason Dispatched to Vendor:
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

        {/* Dynamic API Response Data Fields Grid */}
        <div className="p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-4 font-sans">
          <div className="flex items-center justify-between border-b border-[#E4DCC9] pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <FileText size={16} className="text-[#C4A066]" /> Vendor Profile &amp; Backend API Fields
              </h5>
              <p className="text-xs text-[#6B7C70] mt-0.5">
                Live backend record parameters returned from vendor endpoints.
              </p>
            </div>
            <Badge variant="primary" className="text-xs font-mono">
              ID: {vendor.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Vendor System ID</span>
              <span className="font-mono font-bold text-[#18281F]">{vendor.id || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Store / Business Name</span>
              <span className="font-bold text-[#18281F]">{vendor.storeName || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Owner Full Name</span>
              <span className="font-bold text-[#18281F]">{vendor.ownerName || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Category</span>
              <span className="font-semibold text-[#18281F]">{vendor.category || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Vendor Type</span>
              <span className="font-semibold text-[#18281F] capitalize">{vendor.vendorType || 'Product'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Account Status</span>
              <span className="font-bold text-[#18281F] uppercase">{vendor.status}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Corporate Email</span>
              <span className="font-mono text-[#18281F] truncate">{vendor.email || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Contact Phone</span>
              <span className="font-mono text-[#18281F]">{vendor.phone || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">GSTIN Tax Code</span>
              <span className="font-mono font-bold text-[#18281F]">{vendor.gstin || 'N/A (Not Provided)'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">PAN Card Number</span>
              <span className="font-mono font-bold text-[#18281F]">{vendor.panNumber || 'N/A (Not Provided)'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">FSSAI License #</span>
              <span className="font-mono font-bold text-[#18281F]">{vendor.fssaiNumber || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Location Area / Society</span>
              <span className="font-bold text-[#C4A066]">{vendor.locationArea || vendor.societyName || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Society System ID</span>
              <span className="font-mono font-bold text-[#18281F]">{vendor.societyId || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Shop Number</span>
              <span className="font-semibold text-[#18281F]">{vendor.shopNumber || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Area / Enclave</span>
              <span className="font-semibold text-[#18281F]">{vendor.area || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">City</span>
              <span className="font-semibold text-[#18281F]">{vendor.city || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">State</span>
              <span className="font-semibold text-[#18281F]">{vendor.state || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Pincode</span>
              <span className="font-mono font-semibold text-[#18281F]">{vendor.pincode || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1 md:col-span-2 lg:col-span-3">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Full Registered Address</span>
              <span className="font-semibold text-[#18281F]">{vendor.address || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Subscription Tier</span>
              <span className="font-bold text-[#18281F] uppercase">{vendor.subscriptionTier || 'PRO'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Subscription Renewal</span>
              <span className="font-mono font-semibold text-[#18281F]">
                {vendor.subscriptionRenewalDate ? formatDate(vendor.subscriptionRenewalDate) : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Total Revenue</span>
              <span className="font-bold text-emerald-700">{formatCurrency(vendor.totalEarnings || 0)}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Total Orders Count</span>
              <span className="font-bold text-[#18281F]">{(vendor.totalOrdersCount || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Submission Timestamp</span>
              <span className="font-mono text-[#18281F]">{vendor.submissionTimestamp || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Created At</span>
              <span className="font-mono text-[#18281F]">{vendor.createdAt || 'N/A'}</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#6B7C70] uppercase tracking-wider">Updated At</span>
              <span className="font-mono text-[#18281F]">{vendor.updatedAt || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 7 Mandatory Registration Verification Checkboxes */}
        {(vendor.status === 'pending' || vendor.status === 'on_hold') && (
          <div className="p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E4DCC9] pb-2">
              <div>
                <h5 className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5 font-serif">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
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
                        </div>
                        <span className="font-semibold text-xs text-[#18281F] font-mono truncate mt-0.5">
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
          </div>
        )}

        {/* Onboarding Review Actions */}
        {(vendor.status === 'pending' || vendor.status === 'on_hold') && (
          <div className="p-4 bg-[#EFE8D8] border border-[#E4DCC9] rounded-2xl flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#18281F] uppercase tracking-wider font-serif">
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

        {/* Vendor Support Tickets & Complaints Log Section */}
        <div className="p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-4 font-sans">
          <div className="flex items-center justify-between border-b border-[#E4DCC9] pb-3 flex-wrap gap-2">
            <div>
              <h5 className="text-sm font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <MessageSquare size={16} className="text-[#C4A066]" /> Support Tickets &amp; Vendor Complaints ({vendorTickets.length})
              </h5>
              <p className="text-xs text-[#6B7C70] mt-0.5">
                History of tickets generated by this vendor or reported on this vendor by customers.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-cyan-50 text-cyan-900 border border-cyan-200 rounded-lg font-bold">
                Generated By Vendor: {generatedByVendorCount}
              </span>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-bold">
                Reported On Vendor: {reportedOnVendorCount}
              </span>
            </div>
          </div>

          {vendorTickets.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {vendorTickets.map((t) => {
                const isGeneratedByVendor =
                  (vendor.email && t.reporterEmail?.toLowerCase() === vendor.email.toLowerCase()) ||
                  (vendor.ownerName && t.reporterName?.toLowerCase().includes(vendor.ownerName.toLowerCase()));

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                      isGeneratedByVendor
                        ? 'bg-cyan-50/40 border-cyan-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#18281F]">
                          #{t.ticketNumber || t.id}
                        </span>
                        <Badge variant={isGeneratedByVendor ? 'info' : 'warning'} className="text-[10px] uppercase">
                          {isGeneratedByVendor ? 'GENERATED BY VENDOR' : 'REPORTED ON VENDOR (COMPLAINT)'}
                        </Badge>
                        <span className="text-[10px] uppercase font-bold text-[#6B7C70] bg-white px-2 py-0.5 rounded border border-[#E4DCC9]">
                          {t.category}
                        </span>
                      </div>
                      <SupportTicketStatusBadge status={t.status} />
                    </div>

                    <div>
                      <h6 className="font-bold text-xs text-[#18281F] leading-snug">{t.subject}</h6>
                      <p className="text-[11px] text-[#6B7C70] mt-0.5 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6B7C70] pt-1.5 border-t border-black/5 font-mono">
                      <span>Reporter: {t.reporterName} ({t.reporterRole || t.reporterEmail})</span>
                      <span>Created: {formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl font-medium">
              No support tickets or complaints currently registered for or by this vendor.
            </div>
          )}
        </div>

        {/* Payment Receipts History */}
        {vendor.payments && vendor.payments.length > 0 && (
          <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-xs flex flex-col gap-2.5">
            <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <CreditCard size={14} className="text-[#C4A066]" /> Payment Receipts History
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
          </div>
        )}
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
