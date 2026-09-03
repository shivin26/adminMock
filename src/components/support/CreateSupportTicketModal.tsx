import React, { useState } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import { useCreateSupportTicket } from '../../hooks/useSupport';
import type { TicketCategory, TicketSource, TicketUserType } from '../../types/support.types';
import { Headphones, Mail, Phone, User, Building2, Globe, Smartphone, ShoppingBag } from 'lucide-react';

export interface CreateSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSupportTicketModal: React.FC<CreateSupportTicketModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createTicketMutation = useCreateSupportTicket();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [vendorStoreName, setVendorStoreName] = useState('');
  const [targetEntityName, setTargetEntityName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState<TicketCategory>('billing');
  const [userType, setUserType] = useState<TicketUserType>('user');
  const [source, setSource] = useState<TicketSource>('landing_website');
  const [complaintTarget, setComplaintTarget] = useState<'platform' | 'entity'>('platform');

  const handleUserTypeChange = (newType: TicketUserType) => {
    setUserType(newType);
    if (newType === 'user') {
      setSource('landing_website');
      setCategory('billing');
    } else {
      setSource('vendor_portal');
      setCategory('billing');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !reporterPhone.trim() || !reporterName.trim()) return;

    let finalCategory = category;
    if (complaintTarget === 'entity') {
      finalCategory = userType === 'user' ? 'user_vs_vendor' : 'vendor_vs_user';
    }

    const payload: any = {
      subject,
      description,
      reporterName: reporterName.trim(),
      reporterEmail: reporterEmail.trim() || `${reporterPhone.trim()}@digilocal.in`,
      reporterPhone: reporterPhone.trim(),
      userType,
      source: userType === 'user' ? 'landing_website' : source,
      category: finalCategory,
      orderId: orderId.trim() || undefined,
    };

    if (userType === 'vendor') {
      payload.entityName = vendorStoreName.trim() || 'Vendor Merchant Store';
      payload.vendorStoreName = vendorStoreName.trim() || 'Vendor Merchant Store';
      if (complaintTarget === 'entity') {
        payload.targetResident = targetEntityName.trim();
        payload.reportedPartyName = targetEntityName.trim();
      }
    } else {
      if (complaintTarget === 'entity') {
        payload.targetVendor = targetEntityName.trim();
        payload.entityName = targetEntityName.trim();
        payload.reportedPartyName = targetEntityName.trim();
      } else {
        payload.entityName = 'DigiLocal Network';
      }
    }

    createTicketMutation.mutate(
      payload,
      {
        onSuccess: () => {
          setSubject('');
          setDescription('');
          setReporterPhone('');
          setReporterName('');
          setReporterEmail('');
          setVendorStoreName('');
          setTargetEntityName('');
          setOrderId('');
          onClose();
        },
      }
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Support Ticket"
      subtitle="Log resident complaints, vendor operational tickets, or platform support requests into the CRM."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-xs font-sans">
        {/* User Type Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
            Reporter Category &amp; Account Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleUserTypeChange('user')}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                userType === 'user'
                  ? 'bg-[#541D26] text-white border-[#541D26] shadow-sm'
                  : 'bg-white text-[#211A19] border-[#E7DFD5] hover:border-[#C8A878]'
              }`}
            >
              <User size={20} className={userType === 'user' ? 'text-[#C8A878] shrink-0 mt-0.5' : 'text-[#78716C] shrink-0 mt-0.5'} />
              <div>
                <span className="font-bold block text-xs font-serif">Resident User</span>
                <span className={`text-[11px] block leading-tight mt-0.5 ${userType === 'user' ? 'text-white/80' : 'text-[#78716C]'}`}>
                  Customer / Society Resident (Website Intake Only)
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleUserTypeChange('vendor')}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                userType === 'vendor'
                  ? 'bg-[#541D26] text-white border-[#541D26] shadow-sm'
                  : 'bg-white text-[#211A19] border-[#E7DFD5] hover:border-[#C8A878]'
              }`}
            >
              <Building2 size={20} className={userType === 'vendor' ? 'text-[#C8A878] shrink-0 mt-0.5' : 'text-[#78716C] shrink-0 mt-0.5'} />
              <div>
                <span className="font-bold block text-xs font-serif">Vendor Partner</span>
                <span className={`text-[11px] block leading-tight mt-0.5 ${userType === 'vendor' ? 'text-white/80' : 'text-[#78716C]'}`}>
                  Registered Merchant (Vendor Portal / Vendor Mobile App)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Source System Display & Controls */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
            Origin Source Channel <span className="text-red-500">*</span>
          </label>

          {userType === 'user' ? (
            <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950 shadow-2xs">
              <Globe size={18} className="text-[#C8A878] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xs text-[#211A19]">Resident Website Intake (landing_website)</span>
                <span className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  Residents lodge complaints strictly via the <strong>Website</strong> against the Platform or a Vendor store. (Residents do not have a mobile app).
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'vendor_portal', label: 'Vendor Web Portal (Website)', icon: Globe },
                  { id: 'mobile_app', label: 'Vendor Mobile App', icon: Smartphone },
                ].map((srcItem) => {
                  const IconComp = srcItem.icon;
                  const isSelected = source === srcItem.id;
                  return (
                    <button
                      key={srcItem.id}
                      type="button"
                      onClick={() => setSource(srcItem.id as TicketSource)}
                      className={`p-3 rounded-xl border text-center flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-[#C8A878] text-[#541D26] font-bold shadow-2xs'
                          : 'bg-white border-[#E7DFD5] text-[#78716C] hover:border-[#C8A878]'
                      }`}
                    >
                      <IconComp size={16} />
                      <span className="text-xs">{srcItem.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
                <Building2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <span className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                  Vendors have auto-generated user accounts on the backend. Vendors can lodge complaints via Vendor Portal or Vendor Mobile App against the Platform or against a Resident User who ordered from them.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reporter Contact & Identity Info (Identification via Phone Number) */}
        <div className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex flex-col gap-3">
          <span className="text-[11px] font-bold text-[#541D26] uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Phone size={13} className="text-[#C8A878]" /> Reporter Account Identification
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Reporter Phone Number *"
              type="tel"
              placeholder="e.g. +91 98765 43210 (Account Phone)"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              required
              leftIcon={<Phone size={14} />}
            />
            <Input
              label="Reporter Name *"
              placeholder={userType === 'user' ? 'e.g. Aarushi Sharma (Resident)' : 'e.g. Rajesh Merchant'}
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              required
              leftIcon={<User size={14} />}
            />
            {userType === 'vendor' ? (
              <Input
                label="Vendor Merchant Store Name *"
                placeholder="e.g. Flower's Point Store"
                value={vendorStoreName}
                onChange={(e) => setVendorStoreName(e.target.value)}
                required
                leftIcon={<Building2 size={14} />}
              />
            ) : (
              <Input
                label="Reporter Email"
                type="email"
                placeholder="reporter@example.com (Optional)"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                leftIcon={<Mail size={14} />}
              />
            )}
          </div>
        </div>

        {/* Complaint Target Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
            Complaint Target Entity
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setComplaintTarget('platform')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                complaintTarget === 'platform'
                  ? 'bg-[#211A19] text-white border-[#211A19]'
                  : 'bg-white text-[#78716C] border-[#E7DFD5] hover:border-[#C8A878]'
              }`}
            >
              Against Platform (System / Payout / Bug)
            </button>
            <button
              type="button"
              onClick={() => setComplaintTarget('entity')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                complaintTarget === 'entity'
                  ? 'bg-[#211A19] text-white border-[#211A19]'
                  : 'bg-white text-[#78716C] border-[#E7DFD5] hover:border-[#C8A878]'
              }`}
            >
              {userType === 'user' ? 'Against Vendor Store' : 'Against Resident Customer'}
            </button>
          </div>
        </div>

        {/* Entity / Order Info */}
        {complaintTarget === 'entity' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={userType === 'user' ? 'Target Vendor Store Name *' : 'Target Resident Customer Phone / Name *'}
              placeholder={userType === 'user' ? "e.g. Flower's Point Store" : 'e.g. +91 98765 43210 / Aarushi Resident'}
              value={targetEntityName}
              onChange={(e) => setTargetEntityName(e.target.value)}
              required
              leftIcon={userType === 'user' ? <Building2 size={14} /> : <User size={14} />}
            />
            <Input
              label="Associated Order ID (Optional)"
              placeholder="e.g. ORD-99201"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              leftIcon={<ShoppingBag size={14} />}
            />
          </div>
        )}

        {/* Category Selection */}
        <div className="flex flex-col gap-1">
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
            Ticket Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full p-2.5 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-[#C8A878]"
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
          >
            {userType === 'user' ? (
              <>
                <option value="billing">Order Billing &amp; Payment Refund Issue</option>
                <option value="order_issue">Delivery Order Cancellation / Delay</option>
                <option value="user_vs_vendor">Resident Complaint Against Vendor Store</option>
                <option value="app_bug">Website Technical Feedback</option>
                <option value="general_inquiry">General Platform Inquiry</option>
              </>
            ) : (
              <>
                <option value="billing">Vendor Settlement &amp; Payout Issue</option>
                <option value="vendor_vs_user">Vendor Complaint Against Resident Customer Order</option>
                <option value="onboarding">Store Verification &amp; Document KYC</option>
                <option value="account_access">Vendor App &amp; Portal Login Issue</option>
                <option value="app_bug">Vendor Mobile App / Portal Bug</option>
                <option value="general_inquiry">General Merchant Inquiry</option>
              </>
            )}
          </select>
        </div>

        {/* Subject */}
        <Input
          label="Ticket Summary / Subject *"
          placeholder="Brief title of the issue..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
            Detailed Issue Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            className="w-full p-3 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-[#C8A878] font-sans leading-relaxed"
            placeholder="Provide full details of customer complaint or support request..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5] mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createTicketMutation.isPending}
            leftIcon={<Headphones size={14} />}
          >
            Create Support Ticket
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
