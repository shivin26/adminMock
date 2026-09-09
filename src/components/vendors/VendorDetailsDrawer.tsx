import React, { useState, useEffect } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import type { Vendor, VendorStatus } from '../../types/vendor.types';
import { formatDate, getStatusBadgeVariant } from '../../utils/formatters.utils';
import {
  FileText,
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Lock,
  MessageSquare,
  AlertTriangle,
  PauseCircle,
  XCircle,
  CheckCircle2,
  CheckSquare,
  Square,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  Package,
  ExternalLink,
  CreditCard,
  Store,
  Send,
} from 'lucide-react';

import { ImagePreviewModal } from '../common/Modal/ImagePreviewModal';
import { VendorReapplicationDiffCard } from './VendorReapplicationDiffCard';
import { Modal } from '../common/Modal/Modal';
import { OrderDetailsModal } from '../support/OrderDetailsModal';
import { VendorHoldDrawer } from './VendorHoldDrawer';
import { VendorRejectDrawer } from './VendorRejectDrawer';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { isPhoneMatch } from '../../utils/phone.utils';
import { useToast } from '../../context/ToastContext';
import { useTickets } from '../../hooks/useSupport';
import { useUpdateVendorDetails, useVendorOrders, useHoldVendor } from '../../hooks/useVendors';
import { SupportTicketStatusBadge } from '../support/SupportTicketStatusBadge';
import { axiosInstance } from '../../services/api/axiosInstance';
import { formatDateTime } from '../../utils/formatters.utils';
import type { HoldVendorPayload } from '../../types/vendor.types';

import { Bell } from 'lucide-react';

export interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBlock?: (vendor: Vendor) => void;
  onSelectOwner?: (ownerName: string, vendor: Vendor) => void;
  onApprove?: (vendor: Vendor) => void;
  onConfirmApprove?: (vendorId: string | number) => void;
  onConfirmHold?: (vendorId: string | number, payload: HoldVendorPayload) => void;
  onMarkViewed?: (vendorId: string | number) => void;
  onHold?: (vendor: Vendor) => void;
  onReject?: (vendor: Vendor) => void;
  vendor?: Vendor | null;
  initialOpenHoldForm?: boolean;
}

export const VendorDetailsDrawer: React.FC<VendorDetailsDrawerProps> = ({
  isOpen,
  onClose,
  onToggleBlock,
  onSelectOwner,
  onApprove,
  onConfirmApprove,
  onConfirmHold,
  onMarkViewed,
  onHold,
  onReject,
  vendor,
  initialOpenHoldForm = false,
}) => {
  const { addToast } = useToast();
  const { data: allTickets = [] } = useTickets();
  const updateVendorMutation = useUpdateVendorDetails();
  const { data: vendorOrders = [], isLoading: isOrdersLoading } = useVendorOrders(vendor?.id);

  const DEFAULT_VENDOR_CATEGORIES = [
    'Fresh Flowers, Bouquets & Puja Floral Supplies',
    'Grocery & Supermarket',
    'Organic Fruits & Vegetables',
    'Bakery, Sweets & Snacks',
    'Home & Living Essentials',
    'Dairy & Milk Products',
    'Pharmacy & Health Care',
    'Services & Repairs',
    'General Store & Provisions',
    'Fashion & Apparel',
    'Electronics & Mobile Accessories',
  ];

  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_VENDOR_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    axiosInstance
      .get('/categories')
      .then((res) => {
        const raw = res.data?.data || res.data?.categories || res.data;
        if (Array.isArray(raw) && raw.length > 0 && isMounted) {
          const fetchedNames = raw
            .map((c: any) => (typeof c === 'string' ? c : c.name || c.category_name || c.title))
            .filter(Boolean);
          if (fetchedNames.length > 0) {
            setCategoriesList(Array.from(new Set([...fetchedNames, ...DEFAULT_VENDOR_CATEGORIES])));
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets'>('profile');
  const [selectedOrderIdForModal, setSelectedOrderIdForModal] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Form State matching API fields
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    gstin: '',
    panNumber: '',
    category: '',
    vendorType: 'product',
    shopNumber: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    avatarUrl: '',
    description: '',
    status: 'active' as VendorStatus,
    holdReason: '',
    holdEmailSubject: '',
    hasResubmitted: false,
    resubmittedAtReadable: '',
  });

  const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>({
    gstin: false,
    panNumber: false,
    ownerName: false,
    storeName: false,
    address: false,
    email: false,
    phone: false,
  });

  const holdVendorMutation = useHoldVendor();
  const [isHoldFormOpen, setIsHoldFormOpen] = useState(initialOpenHoldForm);
  const [holdSubject, setHoldSubject] = useState(
    'Document Correction Required for DigiLocal Registration'
  );
  const [holdContent, setHoldContent] = useState('');
  const [isHoldSubmitting, setIsHoldSubmitting] = useState(false);

  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);
  const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);

  const handleRejectFormSubmit = async (vendorId: string | number, reason: string) => {
    if (!vendor) return;
    setIsRejectSubmitting(true);
    try {
      if (onReject) {
        onReject(vendor);
      }
      setIsRejectFormOpen(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        description: err?.message || 'Failed to process application rejection.',
      });
    } finally {
      setIsRejectSubmitting(false);
    }
  };

  useEffect(() => {
    if (vendor) {
      setFormData({
        storeName: vendor.storeName || '',
        ownerName: vendor.ownerName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        gstin: vendor.gstin || '',
        panNumber: vendor.panNumber || '',
        category: vendor.category || '',
        vendorType: vendor.vendorType || 'product',
        shopNumber: vendor.shopNumber || '',
        area: vendor.area || vendor.locationArea || '',
        city: vendor.city || '',
        state: vendor.state || '',
        pincode: vendor.pincode || '',
        avatarUrl: vendor.avatarUrl || '',
        description: vendor.description || '',
        status: vendor.status || 'active',
        holdReason: vendor.holdReason || '',
        holdEmailSubject: vendor.holdEmailSubject || '',
        hasResubmitted: Boolean(vendor.hasResubmitted),
        resubmittedAtReadable: vendor.resubmittedAtReadable || '',
      });
      setIsEditMode(false);
      setIsHoldFormOpen(initialOpenHoldForm);
      setHoldSubject(vendor.holdEmailSubject || 'Document Correction Required for DigiLocal Registration');
      setHoldContent(vendor.holdReason || 'Please upload a clearer GST Certificate and update your shop address details in settings.');
      setCheckedFields({
        gstin: false,
        panNumber: false,
        ownerName: false,
        storeName: false,
        address: false,
        email: false,
        phone: false,
      });
    }
  }, [vendor?.id, isOpen, initialOpenHoldForm]);

  const handleHoldFormSubmit = async (
    vendorIdParam?: string | number,
    payloadParam?: HoldVendorPayload
  ) => {
    if (!vendor) return;

    const subjectToUse = (payloadParam?.subject || payloadParam?.hold_email_subject || holdSubject).trim();
    const contentToUse = (payloadParam?.email_content || payloadParam?.hold_reason || payloadParam?.reason || holdContent).trim();

    if (!subjectToUse || !contentToUse) {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        description: 'Please enter both email subject line and hold reason content.',
      });
      return;
    }

    setIsHoldSubmitting(true);
    try {
      const payload: HoldVendorPayload = {
        subject: subjectToUse,
        email_content: contentToUse,
        hold_email_subject: subjectToUse,
        hold_reason: contentToUse,
        reason: contentToUse,
        remarks: contentToUse,
      };
      const targetVendorId = vendorIdParam || vendor.id;
      if (onConfirmHold) {
        await onConfirmHold(targetVendorId, payload);
      } else {
        await holdVendorMutation.mutateAsync({
          vendorId: targetVendorId,
          ...payload,
        });
      }
      addToast({
        type: 'warning',
        title: 'Vendor Application On Hold',
        description: `SMTP notice dispatched to ${vendor.email}. Status set to ON_HOLD.`,
      });
      setIsHoldFormOpen(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Hold Action Failed',
        description: err?.message || 'Failed to dispatch hold email notice.',
      });
    } finally {
      setIsHoldSubmitting(false);
    }
  };

  const vendorTickets = React.useMemo(() => {
    if (!vendor) return [];
    const sName = (vendor.storeName || '').toLowerCase();
    const oName = (vendor.ownerName || '').toLowerCase();
    const vEmail = (vendor.email || '').toLowerCase();
    const vPhone = vendor.phone || vendor.phoneNumber || vendor.mobile;
    const vWhatsapp = vendor.whatsappNumber || vendor.whatsapp_number;

    return allTickets.filter((t) => {
      const tEmail = (t.reporterEmail || '').toLowerCase();
      const tName = (t.reporterName || '').toLowerCase();
      const tEntity = (t.entityName || '').toLowerCase();
      const tSubj = (t.subject || '').toLowerCase();
      const tTarget = (t.targetVendor || '').toLowerCase();
      const tPhone = t.reporterPhone;

      // Primary Identification: Strict Phone & WhatsApp matching
      const isPhoneBy = isPhoneMatch(vPhone, tPhone) || isPhoneMatch(vWhatsapp, tPhone);
      const isPhoneOn = isPhoneMatch(vPhone, t.targetVendor) || isPhoneMatch(vWhatsapp, t.targetVendor);

      // Secondary Identification: Email & Name / Store Name matching
      const isByVendor = isPhoneBy || (vEmail && tEmail === vEmail) || (oName && tName.includes(oName));
      const isOnVendor = isPhoneOn || (sName && (tEntity.includes(sName) || tTarget.includes(sName) || tSubj.includes(sName)));

      return isByVendor || isOnVendor;
    });
  }, [vendor, allTickets]);

  if (!vendor) return null;

  const generatedByVendorCount = vendorTickets.filter(
    (t) => (vendor.email && t.reporterEmail?.toLowerCase() === vendor.email.toLowerCase()) ||
           (vendor.ownerName && t.reporterName?.toLowerCase().includes(vendor.ownerName.toLowerCase()))
  ).length;

  const reportedOnVendorCount = vendorTickets.length - generatedByVendorCount;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const triggerSaveVendorPrompt = () => {
    setShowSaveConfirm(true);
  };

  const confirmSaveVendorDetails = () => {
    updateVendorMutation.mutate(
      {
        vendorId: vendor.id,
        payload: {
          ...formData,
          // Address combination helper
          address: [formData.shopNumber, formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ') || vendor.address,
          locationArea: formData.area || vendor.locationArea,
          societyName: formData.area || vendor.societyName,
        },
      },
      {
        onSuccess: () => {
          setShowSaveConfirm(false);
          setIsEditMode(false);
          onRefetch?.();
          addToast({
            type: 'success',
            title: 'Vendor Details Updated',
            description: `Store details for "${formData.storeName || vendor.storeName}" have been updated and page refreshed.`,
          });
        },
        onError: () => {
          setShowSaveConfirm(false);
          addToast({
            type: 'error',
            title: 'Update Failed',
            description: 'Could not update vendor store details. Please try again.',
          });
        },
      }
    );
  };

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

  const updatedKeys = vendor.status === 'active'
    ? []
    : (vendor.updatedFieldKeys && vendor.updatedFieldKeys.length > 0)
    ? vendor.updatedFieldKeys
    : (vendor.resubmittedChanges && vendor.resubmittedChanges.length > 0)
    ? vendor.resubmittedChanges.map((c) => c.field)
    : [];

  const getResubmittedChange = (fieldKey: string) => {
    if (!vendor.resubmittedChanges) return null;
    return vendor.resubmittedChanges.find((c) => c.field === fieldKey);
  };

  const currentAvatar = formData.avatarUrl || vendor.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';

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
            className="font-bold text-[#C8A878] hover:text-white underline cursor-pointer transition-all inline-flex items-center gap-0.5"
            title="Click to view Owner profile details"
          >
            {vendor.ownerName} ↗
          </button>
        </span>
      }
    >
      <div className="relative flex flex-col gap-6 p-1 font-sans">
        {/* Profile Card & Admin Actions */}
        <div className="flex items-center gap-4 p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex-wrap">
          <img
            src={currentAvatar}
            alt={vendor.storeName}
            className="w-16 h-16 rounded-xl object-cover border border-[#E7DFD5] shrink-0 cursor-pointer hover:opacity-80 transition-all"
            title="Click to preview shop image"
            onClick={() => setPreviewImage(currentAvatar)}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-[#211A19] truncate font-serif">{vendor.storeName}</h4>
            <div className="flex items-center gap-4 mt-1 text-xs flex-wrap">
              <span className="flex items-center gap-1 text-[#78716C]">
                <User size={13} className="text-[#C8A878]" /> Owner:
                <button
                  type="button"
                  onClick={() => onSelectOwner?.(vendor.ownerName, vendor)}
                  className="font-bold text-[#211A19] hover:text-[#C8A878] underline cursor-pointer transition-colors ml-0.5"
                >
                  {vendor.ownerName}
                </button>
              </span>
              <span className="text-[#78716C] flex items-center gap-1">
                <Mail size={13} className="text-[#C8A878]" /> {vendor.email}
              </span>
              <span className="text-[#78716C] flex items-center gap-1">
                <Phone size={13} className="text-[#C8A878]" /> {vendor.phone}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant={isEditMode ? 'secondary' : 'outline'}
              leftIcon={isEditMode ? <X size={14} /> : <Edit3 size={14} />}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? 'Cancel Edit' : 'Edit Vendor Details ✏️'}
            </Button>

            {isEditMode && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Save size={14} />}
                isLoading={updateVendorMutation.isPending}
                onClick={triggerSaveVendorPrompt}
              >
                Save All Changes
              </Button>
            )}

            <Badge variant={getStatusBadgeVariant(vendor.status)}>
              {vendor.status.replace('_', ' ').toUpperCase()}
            </Badge>

            {Boolean(vendor.hasResubmitted) && !vendor.isUpdateViewed && (
              <Badge variant="success" className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                RESUBMITTED
              </Badge>
            )}

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

        {/* Tab Navigation Header */}
        <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 font-sans text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#541D26] text-white shadow-xs'
                : 'bg-white text-[#78716C] border border-[#E7DFD5] hover:border-[#C8A878] hover:text-[#211A19]'
            }`}
          >
            <Store size={15} /> Store Profile &amp; Audit
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#541D26] text-white shadow-xs'
                : 'bg-white text-[#78716C] border border-[#E7DFD5] hover:border-[#C8A878] hover:text-[#211A19]'
            }`}
          >
            <ShoppingBag size={15} /> Received Orders Log ({vendorOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-[#541D26] text-white shadow-xs'
                : 'bg-white text-[#78716C] border border-[#E7DFD5] hover:border-[#C8A878] hover:text-[#211A19]'
            }`}
          >
            <MessageSquare size={15} /> Support Complaints ({vendorTickets.length})
          </button>
        </div>

        {/* TAB 1: STORE PROFILE & AUDIT */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 animate-fadeIn">

        {/* Resubmitted Vendor Setting Changes Highlight Card (ONLY WHEN NOT YET APPROVED) */}
        {vendor.status !== 'active' && (vendor.hasResubmitted || vendor.hasVendorUpdate || vendor.status === 'on_hold') && (
          <VendorReapplicationDiffCard
            vendorId={vendor.id}
            fallbackChanges={vendor.resubmittedChanges}
            fallbackHoldReason={vendor.holdReason}
          />
        )}

        {/* On Hold Reason Banner (Shown below update section and above fields section) */}
        {(vendor.holdReason || vendor.status === 'on_hold') && (
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex flex-col gap-2 text-amber-900 text-xs shadow-2xs font-sans">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 flex-wrap gap-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-950 uppercase tracking-wider font-mono text-[11px]">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" /> Hold Reason &amp; Dispatched Notice:
              </span>
              <Badge variant="warning" className="text-[10px] font-mono bg-amber-200/70 text-amber-950 border border-amber-300">
                HOLD REASON
              </Badge>
            </div>
            {vendor.holdEmailSubject && (
              <span className="font-bold text-[#211A19] text-xs mt-0.5">
                Email Subject: <span className="font-medium text-[#541D26]">{vendor.holdEmailSubject}</span>
              </span>
            )}
            <p className="font-serif italic text-[#211A19] text-sm bg-white p-3 rounded-xl border border-amber-200 mt-1 shadow-2xs leading-relaxed">
              "{vendor.holdReason || vendor.comments?.[vendor.comments.length - 1]?.text || 'Documentation correction or updated proof required.'}"
            </p>
          </div>
        )}

        {/* Rejection Reason Banner */}
        {vendor.status === 'rejected' && vendor.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-1 text-red-900 text-xs">
            <span className="font-bold flex items-center gap-1 text-red-950 uppercase tracking-wider font-mono">
              <XCircle size={14} className="text-red-600" /> Application Rejection Reason:
            </span>
            <p className="font-serif italic text-[#211A19] text-sm bg-white p-2.5 rounded-xl border border-red-200 mt-1">
              "{vendor.rejectionReason}"
            </p>
          </div>
        )}

        {/* Complete Address Section */}
        {(() => {
          const fullAddressString = [
            formData.shopNumber || vendor.shopNumber,
            formData.area || vendor.area || vendor.locationArea,
            formData.city || vendor.city,
            formData.state || vendor.state,
            (formData.pincode || vendor.pincode) ? `Pincode: ${formData.pincode || vendor.pincode}` : '',
          ].filter(Boolean).join(', ');

          return (
            <div className="p-5 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-3 font-sans shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E7DFD5] pb-2.5">
                <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#C8A878] shrink-0" /> Complete Address
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-[#E7DFD5] text-[#78716C] bg-[#FAF8F5]">
                  ALL ADDRESS API FIELDS COMBINED
                </Badge>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-white text-[#541D26] border border-[#E7DFD5] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <MapPin size={18} className="text-[#C8A878]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-bold text-sm text-[#211A19] leading-snug">
                    {fullAddressString || vendor.address || 'No complete address parameters provided'}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C] font-mono mt-1 pt-1.5 border-t border-[#E7DFD5]/60">
                    <span>shop_number: <strong className="text-[#211A19]">{formData.shopNumber || vendor.shopNumber || '(Empty)'}</strong></span>
                    <span>area: <strong className="text-[#C8A878]">{formData.area || vendor.area || vendor.locationArea || 'N/A'}</strong></span>
                    <span>city: <strong className="text-[#211A19]">{formData.city || vendor.city || 'N/A'}</strong></span>
                    <span>state: <strong className="text-[#211A19]">{formData.state || vendor.state || 'N/A'}</strong></span>
                    <span>pincode: <strong className="text-[#211A19]">{formData.pincode || vendor.pincode || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Backend API Fields Section (ONLY API Response Fields) */}
        <div className="p-5 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-4 font-sans">
          <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3 flex-wrap gap-2">
            <div>
              <h5 className="text-sm font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <FileText size={16} className="text-[#C8A878]" /> Vendor Backend API Response Parameters
              </h5>
              <p className="text-xs text-[#78716C] mt-0.5">
                {isEditMode
                  ? 'Edit all vendor parameters below (except immutable creation timestamp).'
                  : 'Displaying exact API fields returned from vendor endpoint.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="text-xs font-mono">
                vendor_id: {vendor.id}
              </Badge>
              {isEditMode && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                  EDIT MODE ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* 1. vendor_id / id (Read Only System Key) */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                1. vendor_id / id
              </span>
              <span className="font-mono font-bold text-[#211A19]">{vendor.id}</span>
            </div>

            {/* 2. vendor_name */}
            {(() => {
              const isUpdated = updatedKeys.includes('ownerName') || updatedKeys.includes('vendor_name');
              const change = getResubmittedChange('ownerName') || getResubmittedChange('vendor_name');
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      2. vendor_name (Owner Name)
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="Lovely"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through font-mono truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`font-bold ${isUpdated ? 'text-emerald-900' : 'text-[#211A19]'}`}>
                        {vendor.ownerName || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. shop_name */}
            {(() => {
              const isUpdated = updatedKeys.includes('storeName') || updatedKeys.includes('shop_name');
              const change = getResubmittedChange('storeName') || getResubmittedChange('shop_name');
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      3. shop_name (Store Name)
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      placeholder="freshmart"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through font-mono truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`font-bold ${isUpdated ? 'text-emerald-900' : 'text-[#211A19]'}`}>
                        {vendor.storeName || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 4. email */}
            {(() => {
              const isUpdated = updatedKeys.includes('email');
              const change = getResubmittedChange('email');
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      4. email
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="freshmart@gmail.com"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5 font-mono">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`truncate ${isUpdated ? 'font-bold text-emerald-900' : 'text-[#211A19]'}`}>
                        {vendor.email || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 5. phone_number */}
            {(() => {
              const isUpdated = updatedKeys.includes('phone') || updatedKeys.includes('phone_number');
              const change = getResubmittedChange('phone') || getResubmittedChange('phone_number');
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      5. phone_number
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="9509512187"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5 font-mono">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`${isUpdated ? 'font-bold text-emerald-900' : 'text-[#211A19]'}`}>
                        {vendor.phone || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 6. gstin */}
            {(() => {
              const isUpdated = updatedKeys.includes('gstin');
              const change = getResubmittedChange('gstin');
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      6. gstin
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      value={formData.gstin}
                      onChange={(e) => handleInputChange('gstin', e.target.value)}
                      placeholder="ASDFG1234F"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5 font-mono">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`font-bold ${isUpdated ? 'font-bold text-emerald-900' : 'text-[#211A19]'}`}>
                        {vendor.gstin || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 7. pan_number */}
            {(() => {
              const isUpdated = updatedKeys.includes('panNumber') || updatedKeys.includes('pan_number');
              const change = getResubmittedChange('panNumber') || getResubmittedChange('pan_number');
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      7. pan_number
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value)}
                      placeholder="ASDFG1234F"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5 font-mono">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`font-bold ${isUpdated ? 'text-emerald-900' : 'text-[#211A19]'}`}>
                        {vendor.panNumber || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 8. category */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                8. category
              </span>
              {isEditMode ? (
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2 text-xs border border-[#E7DFD5] rounded-lg bg-white font-medium text-[#211A19]"
                >
                  <option value="">Select Category...</option>
                  {Array.from(new Set([...(formData.category ? [formData.category] : []), ...categoriesList])).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-[#211A19]">{vendor.category || 'N/A'}</span>
              )}
            </div>

            {/* 9. vendor_type */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                9. vendor_type
              </span>
              {isEditMode ? (
                <select
                  value={formData.vendorType}
                  onChange={(e) => handleInputChange('vendorType', e.target.value)}
                  className="w-full p-2 text-xs border border-[#E7DFD5] rounded-lg bg-white font-mono text-[#211A19]"
                >
                  <option value="product">product</option>
                  <option value="service">service</option>
                  <option value="both">both</option>
                </select>
              ) : (
                <span className="font-semibold text-[#211A19] capitalize">{vendor.vendorType || 'product'}</span>
              )}
            </div>

            {/* 10. shop_number / shop_no */}
            {(() => {
              const isUpdated = updatedKeys.includes('shopNumber') || updatedKeys.includes('shop_number') || updatedKeys.includes('shop_no');
              const change = getResubmittedChange('shopNumber') || getResubmittedChange('shop_number') || getResubmittedChange('shop_no');
              const currentShopNo = vendor.shopNumber || (vendor as any).shop_no || 'N/A (Empty)';
              return (
                <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isUpdated ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' : 'bg-[#FAF8F5] border-[#E7DFD5]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isUpdated ? 'text-emerald-950' : 'text-[#78716C]'
                    }`}>
                      10. shop_number / shop_no
                    </span>
                    {isUpdated && <Badge variant="success" className="text-[9px]">UPDATED BY VENDOR</Badge>}
                  </div>
                  {isEditMode ? (
                    <Input
                      value={formData.shopNumber}
                      onChange={(e) => handleInputChange('shopNumber', e.target.value)}
                      placeholder="Shop 101"
                    />
                  ) : (
                    <div className="flex flex-col gap-0.5 font-mono">
                      {change?.oldValue && (
                        <span className="text-[11px] text-gray-400 line-through truncate" title={`Original: ${change.oldValue}`}>
                          Original: {change.oldValue}
                        </span>
                      )}
                      <span className={`font-bold ${isUpdated ? 'text-emerald-900' : 'text-[#211A19]'}`}>
                        {currentShopNo}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 11. area */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                11. area
              </span>
              {isEditMode ? (
                <Input
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Anupam Apartments"
                />
              ) : (
                <span className="font-bold text-[#C8A878]">{vendor.area || vendor.locationArea || 'N/A'}</span>
              )}
            </div>

            {/* 12. city */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                12. city
              </span>
              {isEditMode ? (
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="South Delhi"
                />
              ) : (
                <span className="font-semibold text-[#211A19]">{vendor.city || 'N/A'}</span>
              )}
            </div>

            {/* 13. state */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                13. state
              </span>
              {isEditMode ? (
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Rajasthan"
                />
              ) : (
                <span className="font-semibold text-[#211A19]">{vendor.state || 'N/A'}</span>
              )}
            </div>

            {/* 14. pincode */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                14. pincode
              </span>
              {isEditMode ? (
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="302022"
                />
              ) : (
                <span className="font-mono font-semibold text-[#211A19]">{vendor.pincode || 'N/A'}</span>
              )}
            </div>

            {/* 15. shop_image */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                15. shop_image
              </span>
              {isEditMode ? (
                <Input
                  value={formData.avatarUrl}
                  onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                  placeholder="Image URL or Base64 String"
                />
              ) : (
                <span className="font-mono text-[#211A19] truncate text-[11px]">
                  {vendor.avatarUrl ? `${vendor.avatarUrl.substring(0, 35)}...` : 'N/A'}
                </span>
              )}
            </div>

            {/* 16. description */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1 md:col-span-2 lg:col-span-3">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                16. description
              </span>
              {isEditMode ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full p-2 text-xs border border-[#E7DFD5] rounded-lg bg-white text-[#211A19]"
                  placeholder="Vendor store description..."
                />
              ) : (
                <span className="font-medium text-[#211A19]">{formData.description || vendor.description || 'N/A (Not Provided)'}</span>
              )}
            </div>

            {/* 17. status */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                17. status
              </span>
              <span className="font-bold text-[#211A19] uppercase">{vendor.status}</span>
            </div>

            {/* 18. hold_reason */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                18. hold_reason
              </span>
              <span className="font-medium text-[#211A19]">{vendor.holdReason || 'N/A (None)'}</span>
            </div>

            {/* 19. hold_email_subject */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                19. hold_email_subject
              </span>
              <span className="font-medium text-[#211A19]">{vendor.holdEmailSubject || 'N/A (None)'}</span>
            </div>

            {/* 20. has_resubmitted */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                20. has_resubmitted
              </span>
              <span className="font-mono font-bold text-[#211A19]">
                {vendor.hasResubmitted ? 'true' : 'false'}
              </span>
            </div>

            {/* 21. resubmitted_at / resubmitted_at_readable */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                21. resubmitted_at / readable
              </span>
              <span className="font-mono text-[#211A19]">{vendor.resubmittedAtReadable || vendor.resubmittedAt || 'null'}</span>
            </div>

            {/* 22. created_at / created_at_readable / created_at_time */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                22. created_at / readable / time
              </span>
              <span className="font-mono font-bold text-[#211A19]">
                {(() => {
                  const bracketTime = vendor.createdAtTime
                    ? String(vendor.createdAtTime).replace(/[()]/g, '').trim()
                    : undefined;

                  let rawReadable = vendor.createdAtReadable || '';
                  const matchInReadable = rawReadable.match(/\(([^)]+)\)/);
                  const finalBracketTime = bracketTime || (matchInReadable ? matchInReadable[1].trim() : undefined);

                  if (finalBracketTime) {
                    let dateStr = rawReadable
                      .replace(/\s*\([^)]*\)/g, '')
                      .replace(/,\s*\d{1,2}:\d{2}\s*(?:am|pm)?\s*(?:IST)?/gi, '')
                      .trim();

                    if (!dateStr || dateStr.length < 4) {
                      dateStr = formatDate(vendor.createdAt);
                    }
                    return `${dateStr}, ${finalBracketTime}`;
                  }

                  if (rawReadable) {
                    return rawReadable.replace(/,\s*\d{1,2}:\d{2}\s*(?:am|pm)?\s*IST/gi, '').replace(/\s*IST/gi, '').trim();
                  }

                  return formatDate(vendor.createdAt);
                })()}
              </span>
            </div>
          </div>

          {isEditMode && (
            <div className="flex justify-end gap-3 pt-3 border-t border-[#E7DFD5]">
              <Button size="sm" variant="secondary" onClick={() => setIsEditMode(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Save size={14} />}
                isLoading={updateVendorMutation.isPending}
                onClick={triggerSaveVendorPrompt}
              >
                Save All Changes
              </Button>
            </div>
          )}
        </div>

        {/* Verification Checklist */}
        {(vendor.status === 'pending' || vendor.status === 'on_hold') && (
          <div className="p-5 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2">
              <div>
                <h5 className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <ShieldCheck size={16} className="text-[#C8A878]" /> Admin Field Verification Checklist ({checkedCount} / 7)
                </h5>
                <p className="text-[11px] text-[#78716C] mt-0.5">
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
                return (
                  <div
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#211A19] hover:border-[#C8A878]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {isChecked ? (
                        <CheckSquare size={16} className="text-emerald-700 font-bold shrink-0" />
                      ) : (
                        <Square size={16} className="text-[#78716C] shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                          {field.label}
                        </span>
                        <span className="font-semibold text-xs text-[#211A19] font-mono truncate mt-0.5">
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
          <div className="p-4 bg-[#EEE5DA] border border-[#E7DFD5] rounded-2xl flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider font-serif">
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
                  setActiveTab('profile');
                  setIsRejectFormOpen(false);
                  setIsHoldFormOpen(!isHoldFormOpen);
                }}
              >
                {vendor.status === 'on_hold' ? 'Re-Hold Application' : 'Hold Application'}
              </Button>

              <Button
                size="sm"
                variant="danger"
                leftIcon={<XCircle size={14} />}
                onClick={() => {
                  setActiveTab('profile');
                  setIsHoldFormOpen(false);
                  setIsRejectFormOpen(!isRejectFormOpen);
                }}
              >
                Reject Application
              </Button>
            </div>
          </div>
        )}
        </div>
        )}

        {/* TAB 2: VENDOR RECEIVED ORDERS LOG */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4 text-xs font-sans animate-fadeIn">
            <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#541D26] text-white flex items-center justify-center font-bold">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[#211A19] font-serif text-sm">
                    Orders Fulfilled by {vendor.storeName}
                  </h4>
                  <span className="text-[#78716C] block text-[11px]">
                    Live order queue dispatches and store transactions ({vendorOrders.length} orders total)
                  </span>
                </div>
              </div>
              <Badge variant="primary">STORE MERCHANT ORDERS</Badge>
            </div>

            {isOrdersLoading ? (
              <div className="p-12 text-center bg-white border border-[#E7DFD5] rounded-2xl">
                <LoadingSpinner size="md" label="Fetching vendor orders from backend API..." />
              </div>
            ) : vendorOrders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {vendorOrders.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-3 shadow-xs hover:border-[#C8A878] transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#C8A878] bg-[#FAF8F5] px-2 py-0.5 border border-[#E7DFD5] rounded-lg text-xs">
                          #{ord.orderId || ord.id}
                        </span>
                        <span className="font-bold text-[#211A19] text-sm">Customer: {ord.customerName}</span>
                        {ord.customerPhone && (
                          <span className="text-xs text-[#78716C] font-mono">({ord.customerPhone})</span>
                        )}
                      </div>
                      <Badge variant="success">{ord.status}</Badge>
                    </div>

                    <span className="text-[10px] text-[#78716C] font-mono">
                      Order Placed: <strong>{formatDateTime(ord.createdAt || ord.created_at)}</strong>
                    </span>

                    {/* Itemized Catalog Table (Unit Price & Item Total) */}
                    {Array.isArray(ord.items) && ord.items.length > 0 ? (
                      <div className="border border-[#E7DFD5] rounded-xl overflow-hidden text-xs bg-[#FAF8F5]">
                        <div className="grid grid-cols-12 bg-[#EEE5DA] px-3 py-1.5 font-bold text-[#211A19] border-b border-[#E7DFD5]">
                          <span className="col-span-5">Product Item</span>
                          <span className="col-span-2 text-center">Qty</span>
                          <span className="col-span-2 text-right">Unit Price</span>
                          <span className="col-span-3 text-right">Total</span>
                        </div>
                        {ord.items.map((item: any, idx: number) => {
                          const uPrice = Number(item.unitPrice ?? item.price ?? item.unit_price ?? 0);
                          const qty = Number(item.quantity || item.qty || 1);
                          const iTotal = Number(item.itemTotal ?? item.item_total ?? (uPrice * qty));
                          return (
                            <div key={item.id || idx} className="grid grid-cols-12 px-3 py-1.5 border-b border-[#E7DFD5]/50 items-center last:border-0">
                              <span className="col-span-5 font-medium text-[#211A19] truncate">{item.name || item.item_name || 'Product Item'}</span>
                              <span className="col-span-2 text-center font-mono text-[#78716C] font-semibold">{qty}</span>
                              <span className="col-span-2 text-right font-mono text-[#78716C]">₹{uPrice.toFixed(2)}</span>
                              <span className="col-span-3 text-right font-mono font-bold text-[#211A19]">₹{iTotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#78716C] flex items-center gap-1.5">
                        <Package size={14} className="text-[#C8A878]" /> Ordered Items
                      </div>
                    )}

                    {/* Financial Breakdown & Address */}
                    <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1.5 text-xs">
                      {ord.subtotal > 0 && (
                        <div className="flex items-center justify-between text-[#78716C]">
                          <span>Subtotal:</span>
                          <span className="font-mono text-[#211A19]">₹{ord.subtotal.toFixed(2)}</span>
                        </div>
                      )}
                      {ord.deliveryFee > 0 && (
                        <div className="flex items-center justify-between text-[#78716C]">
                          <span>Delivery Charge:</span>
                          <span className="font-mono text-[#211A19]">₹{ord.deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      {ord.taxAmount > 0 && (
                        <div className="flex items-center justify-between text-[#78716C]">
                          <span>Platform Tax:</span>
                          <span className="font-mono text-[#211A19]">₹{ord.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {ord.discount > 0 && (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span>Discount:</span>
                          <span className="font-mono">- ₹{ord.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-bold text-sm text-[#211A19] pt-1.5 border-t border-[#E7DFD5]">
                        <span>Order Total Amount:</span>
                        <span className="font-mono text-emerald-700">₹{(ord.totalAmount || ord.total || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E7DFD5]/60 text-[#78716C]">
                        <span>Payment: <strong className="text-[#211A19]">{ord.paymentMethod}</strong> ({ord.paymentStatus || 'PAID'})</span>
                        <span className="truncate max-w-[200px]" title={ord.deliveryAddress}>📍 {ord.deliveryAddress || 'Registered Address'}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ExternalLink size={12} />}
                        onClick={() => setSelectedOrderIdForModal(ord.id)}
                      >
                        Inspect Order Details ↗
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#78716C] bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl font-medium">
                No orders currently recorded for this vendor store.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VENDOR SUPPORT TICKETS & COMPLAINTS */}
        {activeTab === 'tickets' && (
          <div className="p-5 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-4 font-sans animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3 flex-wrap gap-2">
            <div>
              <h5 className="text-sm font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <MessageSquare size={16} className="text-[#C8A878]" /> Support Tickets &amp; Vendor Complaints ({vendorTickets.length})
              </h5>
              <p className="text-xs text-[#78716C] mt-0.5">
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
                        <span className="font-mono font-bold text-xs text-[#211A19]">
                          #{t.ticketNumber || t.id}
                        </span>
                        <Badge variant={isGeneratedByVendor ? 'info' : 'warning'} className="text-[10px] uppercase">
                          {isGeneratedByVendor ? 'GENERATED BY VENDOR' : 'REPORTED ON VENDOR (COMPLAINT)'}
                        </Badge>
                        <span className="text-[10px] uppercase font-bold text-[#78716C] bg-white px-2 py-0.5 rounded border border-[#E7DFD5]">
                          {t.category}
                        </span>
                      </div>
                      <SupportTicketStatusBadge status={t.status} />
                    </div>

                    <div>
                      <h6 className="font-bold text-xs text-[#211A19] leading-snug">{t.subject}</h6>
                      <p className="text-[11px] text-[#78716C] mt-0.5 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1.5 border-t border-black/5 font-mono">
                      <span>Reporter: {t.reporterName} ({t.reporterRole || t.reporterEmail})</span>
                      <span>Created: {formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#78716C] bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl font-medium">
              No support tickets or complaints currently registered for or by this vendor.
            </div>
          )}
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

      {/* Save Changes Confirmation Warning Modal */}
      <Modal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="⚠️ Confirm Vendor Details Update"
        subtitle={`Target Store: ${formData.storeName || vendor.storeName}`}
        size="sm"
      >
        <div className="flex flex-col gap-4 p-4 text-xs font-sans">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to save these store details for <strong>{formData.storeName || vendor.storeName}</strong>?
              This action will update the vendor parameters directly in the backend database and refresh the page view.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              isLoading={updateVendorMutation.isPending}
              onClick={confirmSaveVendorDetails}
            >
              Yes, Save Changes 💾
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Inspection Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrderIdForModal)}
        onClose={() => setSelectedOrderIdForModal(null)}
        orderId={selectedOrderIdForModal}
      />

      {/* Separate Hold Side Drawer emerging beside Vendor Details Drawer */}
      <VendorHoldDrawer
        isOpen={isHoldFormOpen}
        onClose={() => setIsHoldFormOpen(false)}
        onConfirmHold={handleHoldFormSubmit}
        vendor={vendor}
        isLoading={isHoldSubmitting}
        isVendorDetailsOpen={true}
      />

      {/* Separate Reject Side Drawer emerging beside Vendor Details Drawer */}
      <VendorRejectDrawer
        isOpen={isRejectFormOpen}
        onClose={() => setIsRejectFormOpen(false)}
        onConfirmReject={handleRejectFormSubmit}
        vendor={vendor}
        isLoading={isRejectSubmitting}
        isVendorDetailsOpen={true}
      />
    </Drawer>
  );
};
