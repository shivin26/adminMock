import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import { useCreateSupportTicket } from '../../hooks/useSupport';
import type { TicketCategory, TicketSource, TicketUserType } from '../../types/support.types';
import { Headphones, Mail, User, Building2, Globe, Smartphone, ShoppingBag } from 'lucide-react';

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
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [entityName, setEntityName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState<TicketCategory>('billing');
  const [userType, setUserType] = useState<TicketUserType>('user');
  const [source, setSource] = useState<TicketSource>('landing_website');

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
    if (!subject.trim() || !description.trim() || !reporterName.trim() || !reporterEmail.trim()) return;

    createTicketMutation.mutate(
      {
        subject,
        description,
        reporterName,
        reporterEmail,
        entityName: (userType === 'vendor' || userType === 'user_vendor') ? (entityName.trim() || undefined) : undefined,
        category,
        priority: 'medium',
        userType,
        source: userType === 'user' ? 'landing_website' : source,
      },
      {
        onSuccess: () => {
          setSubject('');
          setDescription('');
          setReporterName('');
          setReporterEmail('');
          setEntityName('');
          setOrderId('');
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log New Support Ticket"
      subtitle="Manually log a support ticket for a user or vendor account."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 1. Ticket Subject */}
        <Input
          label="Ticket Subject"
          placeholder="Brief summary of inquiry or issue..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        {/* 2 & 3. Reporter Name and Email */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Reporter Name"
            placeholder="John Doe"
            leftIcon={<User size={14} />}
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            required
          />

          <Input
            label="Reporter Email"
            type="email"
            placeholder="john@example.com"
            leftIcon={<Mail size={14} />}
            value={reporterEmail}
            onChange={(e) => setReporterEmail(e.target.value)}
            required
          />
        </div>

        {/* 4. Reporter Type & Channel Source */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#18281F] uppercase tracking-wider">
              Reporter Type
            </label>
            <select
              value={userType}
              onChange={(e) => handleUserTypeChange(e.target.value as TicketUserType)}
              className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
            >
              <option value="user">User (Customer / Resident)</option>
              <option value="vendor">Vendor Store Owner</option>
              <option value="user_vendor">User &amp; Vendor (Dual Role)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1">
              {userType === 'user' ? <Globe size={12} className="text-[#D97706]" /> : <Smartphone size={12} className="text-[#C4A066]" />}
              Channel Source
            </label>
            {userType === 'user' ? (
              <div className="w-full p-2.5 bg-[#FEF3C7]/60 border border-[#F59E0B]/40 rounded-xl text-xs font-bold text-[#D97706] flex items-center gap-1.5">
                <Globe size={13} /> Website Intake (User Portal)
              </div>
            ) : (
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as TicketSource)}
                className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
              >
                <option value="vendor_portal">Vendor Web Portal</option>
                <option value="mobile_app">Vendor Mobile App</option>
              </select>
            )}
          </div>
        </div>

        {/* Intake Channel Rules Info Callout */}
        <div className="p-3 bg-[#EFE8D8]/70 border border-[#C4A066]/40 rounded-xl text-xs text-[#18281F]">
          {userType === 'user' ? (
            <span className="leading-snug block">
              ℹ️ <strong>User Intake Rules:</strong> Users <strong>cannot lodge complaints from an app</strong> as there is NO app for users. Users lodge complaints strictly via the Website for orders.
            </span>
          ) : (
            <span className="leading-snug block">
              ℹ️ <strong>Vendor Intake Rules:</strong> Mobile app is built exclusively for vendors. Vendors can lodge complaints for anything on the platform via Vendor Mobile App or Vendor Web Portal.
            </span>
          )}
        </div>

        {/* 5. Account / Entity Name - ONLY for Vendor / Dual Role */}
        {(userType === 'vendor' || userType === 'user_vendor') && (
          <Input
            label="Vendor Store / Account Entity Name"
            placeholder="FreshBites Grocery & Organics Store..."
            leftIcon={<Building2 size={14} />}
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            required
          />
        )}

        {/* 6. Associated Order ID Input Section (Replaces Complaint Regarding Vendor) */}
        <Input
          label="Associated Order ID (Optional)"
          placeholder="e.g. ORD-9842 (Admin can click View Order Details to inspect full order breakdown)"
          leftIcon={<ShoppingBag size={14} className="text-[#C4A066]" />}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        {/* 7. Category Dropdown - Changes Dynamically per Reporter Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center justify-between">
            <span>Ticket Category</span>
            <span className="text-[10px] text-[#C4A066] font-normal">
              {userType === 'user'
                ? '(User Categories)'
                : userType === 'vendor'
                ? '(Vendor Categories)'
                : '(Dual Role - All Categories Available)'}
            </span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer focus:border-[#C4A066]"
          >
            {userType === 'user' && (
              <>
                <option value="billing">Order Issue &amp; Refunds</option>
                <option value="technical">Delivery &amp; Tracking Issue</option>
                <option value="general">General Customer Support</option>
              </>
            )}

            {userType === 'vendor' && (
              <>
                <option value="billing">Payouts &amp; Payment Gateway Settlements</option>
                <option value="technical">Store Catalog &amp; Product Sync</option>
                <option value="onboarding">Vendor Onboarding &amp; KYC</option>
                <option value="general">Platform Operations</option>
              </>
            )}

            {userType === 'user_vendor' && (
              <>
                <option value="billing">Order Issue / Payout Settlement</option>
                <option value="technical">Delivery / Catalog Product Sync</option>
                <option value="onboarding">Vendor Onboarding &amp; KYC Verification</option>
                <option value="general">General Support &amp; Operations</option>
              </>
            )}
          </select>
        </div>

        {/* Issue Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#18281F] uppercase tracking-wider">
            Issue Description
          </label>
          <textarea
            rows={3}
            placeholder="Detailed description of the issue or request..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs text-[#18281F] outline-none focus:border-[#C4A066] resize-none"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DCC9]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createTicketMutation.isPending}
            leftIcon={<Headphones size={14} />}
          >
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
