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
} from 'lucide-react';

import { ImagePreviewModal } from '../common/Modal/ImagePreviewModal';
import { useToast } from '../../context/ToastContext';
import { useTickets } from '../../hooks/useSupport';
import { useUpdateVendorDetails } from '../../hooks/useVendors';
import { SupportTicketStatusBadge } from '../support/SupportTicketStatusBadge';

export interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBlock?: (vendor: Vendor) => void;
  onSelectOwner?: (ownerName: string, vendor: Vendor) => void;
  onApprove?: (vendor: Vendor) => void;
  onConfirmApprove?: (vendorId: string | number) => void;
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
  onHold,
  onReject,
  vendor,
}) => {
  const { addToast } = useToast();
  const { data: allTickets = [] } = useTickets();
  const updateVendorMutation = useUpdateVendorDetails();

  const [isEditMode, setIsEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
        description: (vendor as any).description || 'Grocery & Supermarket daily essentials sourced for DigiLocal residents.',
        status: vendor.status || 'active',
        holdReason: vendor.holdReason || '',
        holdEmailSubject: vendor.holdEmailSubject || '',
        hasResubmitted: Boolean(vendor.hasResubmitted),
        resubmittedAtReadable: vendor.resubmittedAtReadable || '',
      });
      setIsEditMode(false);
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
  }, [vendor?.id, isOpen]);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveVendorDetails = () => {
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
          setIsEditMode(false);
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
      <div className="flex flex-col gap-6 p-1 font-sans">
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
                onClick={handleSaveVendorDetails}
              >
                Save All Changes
              </Button>
            )}

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
            <span className="font-bold flex items-center gap-1 text-amber-950 uppercase tracking-wider font-mono">
              <AlertTriangle size={14} className="text-amber-600" /> Hold Notice &amp; Subject Dispatched to Vendor:
            </span>
            <p className="font-serif italic text-[#211A19] text-sm bg-white p-2.5 rounded-xl border border-amber-200 mt-1">
              "{vendor.holdReason}"
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

        {/* Complete Combined Address Section */}
        {(() => {
          const fullAddressString = [
            formData.shopNumber || vendor.shopNumber,
            formData.area || vendor.area || vendor.locationArea,
            formData.city || vendor.city,
            formData.state || vendor.state,
            (formData.pincode || vendor.pincode) ? `Pincode: ${formData.pincode || vendor.pincode}` : '',
          ].filter(Boolean).join(', ');

          return (
            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col gap-3 font-sans shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-200/80 pb-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-700 shrink-0" /> Complete Combined Registered Address
                </span>
                <Badge variant="success" className="text-[10px] font-mono">
                  ALL ADDRESS API FIELDS COMBINED
                </Badge>
              </div>

              <div className="p-3.5 bg-white border border-emerald-200 rounded-xl flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-bold text-sm text-[#211A19] leading-snug">
                    {fullAddressString || vendor.address || 'No complete address parameters provided'}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C] font-mono mt-1 pt-1.5 border-t border-slate-100">
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
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                2. vendor_name (Owner Name)
              </span>
              {isEditMode ? (
                <Input
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Lovely"
                />
              ) : (
                <span className="font-bold text-[#211A19]">{vendor.ownerName || 'N/A'}</span>
              )}
            </div>

            {/* 3. shop_name */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                3. shop_name (Store Name)
              </span>
              {isEditMode ? (
                <Input
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  placeholder="freshmart"
                />
              ) : (
                <span className="font-bold text-[#211A19]">{vendor.storeName || 'N/A'}</span>
              )}
            </div>

            {/* 4. email */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                4. email
              </span>
              {isEditMode ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="freshmart@gmail.com"
                />
              ) : (
                <span className="font-mono text-[#211A19] truncate">{vendor.email || 'N/A'}</span>
              )}
            </div>

            {/* 5. phone_number */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                5. phone_number
              </span>
              {isEditMode ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="9509512187"
                />
              ) : (
                <span className="font-mono text-[#211A19]">{vendor.phone || 'N/A'}</span>
              )}
            </div>

            {/* 6. gstin */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                6. gstin
              </span>
              {isEditMode ? (
                <Input
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value)}
                  placeholder="ASDFG1234F"
                />
              ) : (
                <span className="font-mono font-bold text-[#211A19]">{vendor.gstin || 'N/A'}</span>
              )}
            </div>

            {/* 7. pan_number */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                7. pan_number
              </span>
              {isEditMode ? (
                <Input
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  placeholder="ASDFG1234F"
                />
              ) : (
                <span className="font-mono font-bold text-[#211A19]">{vendor.panNumber || 'N/A'}</span>
              )}
            </div>

            {/* 8. category */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                8. category
              </span>
              {isEditMode ? (
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Grocery & Supermarket"
                />
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

            {/* 10. shop_number */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                10. shop_number
              </span>
              {isEditMode ? (
                <Input
                  value={formData.shopNumber}
                  onChange={(e) => handleInputChange('shopNumber', e.target.value)}
                  placeholder="Shop # G-12"
                />
              ) : (
                <span className="font-semibold text-[#211A19]">{vendor.shopNumber || 'N/A (Empty)'}</span>
              )}
            </div>

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
                  placeholder="Delhi"
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
                  placeholder="110017"
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
                <span className="font-medium text-[#211A19]">{formData.description}</span>
              )}
            </div>

            {/* 17. status */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                17. status
              </span>
              {isEditMode ? (
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as VendorStatus)}
                  className="w-full p-2 text-xs border border-[#E7DFD5] rounded-lg bg-white font-mono font-bold text-[#211A19]"
                >
                  <option value="active">ACTIVE</option>
                  <option value="pending">PENDING</option>
                  <option value="on_hold">ON_HOLD</option>
                  <option value="rejected">REJECTED</option>
                  <option value="suspended">SUSPENDED</option>
                </select>
              ) : (
                <span className="font-bold text-[#211A19] uppercase">{vendor.status}</span>
              )}
            </div>

            {/* 18. hold_reason */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                18. hold_reason
              </span>
              {isEditMode ? (
                <Input
                  value={formData.holdReason}
                  onChange={(e) => handleInputChange('holdReason', e.target.value)}
                  placeholder="Enter hold reason..."
                />
              ) : (
                <span className="font-medium text-[#211A19]">{vendor.holdReason || 'N/A (None)'}</span>
              )}
            </div>

            {/* 19. hold_email_subject */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                19. hold_email_subject
              </span>
              {isEditMode ? (
                <Input
                  value={formData.holdEmailSubject}
                  onChange={(e) => handleInputChange('holdEmailSubject', e.target.value)}
                  placeholder="Action Required for Vendor Registration"
                />
              ) : (
                <span className="font-medium text-[#211A19]">{vendor.holdEmailSubject || 'N/A (None)'}</span>
              )}
            </div>

            {/* 20. has_resubmitted */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                20. has_resubmitted
              </span>
              {isEditMode ? (
                <label className="flex items-center gap-2 font-mono font-bold cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={formData.hasResubmitted}
                    onChange={(e) => handleInputChange('hasResubmitted', e.target.checked)}
                    className="w-4 h-4 rounded text-[#211A19]"
                  />
                  {formData.hasResubmitted ? 'true' : 'false'}
                </label>
              ) : (
                <span className="font-mono font-bold text-[#211A19]">
                  {vendor.hasResubmitted ? 'true' : 'false'}
                </span>
              )}
            </div>

            {/* 21. resubmitted_at / resubmitted_at_readable */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-mono">
                21. resubmitted_at / readable
              </span>
              {isEditMode ? (
                <Input
                  value={formData.resubmittedAtReadable}
                  onChange={(e) => handleInputChange('resubmittedAtReadable', e.target.value)}
                  placeholder="31 Aug 2026, 07:10 pm IST"
                />
              ) : (
                <span className="font-mono text-[#211A19]">{vendor.resubmittedAtReadable || vendor.resubmittedAt || 'null'}</span>
              )}
            </div>

            {/* 22. created_at / created_at_readable / created_at_time — READ ONLY (IMMUTABLE) */}
            <div className="p-3 bg-amber-50/60 border border-amber-300 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Lock size={12} className="text-amber-700" /> 22. created_at / readable / time
                </span>
                <span className="text-[9px] font-bold font-mono text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-300">
                  SYSTEM READ-ONLY
                </span>
              </div>
              <span className="font-mono font-bold text-[#211A19]">
                {vendor.createdAtReadable || formatDate(vendor.createdAt)}
                {vendor.createdAtTime ? ` (${vendor.createdAtTime})` : ''}
              </span>
              <p className="text-[9px] text-amber-800 font-sans italic mt-0.5">
                Vendor registration creation timestamp is immutable and locked.
              </p>
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
                onClick={handleSaveVendorDetails}
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
        <div className="p-5 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-4 font-sans">
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
