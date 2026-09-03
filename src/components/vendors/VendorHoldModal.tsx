import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { Badge } from '../common/Badge/Badge';
import type { Vendor, HoldVendorPayload } from '../../types/vendor.types';
import { PauseCircle, Mail, AlertTriangle, FileText, Send } from 'lucide-react';

export interface VendorHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmHold: (vendorId: string | number, payload: HoldVendorPayload) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
}

export const VendorHoldModal: React.FC<VendorHoldModalProps> = ({
  isOpen,
  onClose,
  onConfirmHold,
  vendor,
  isLoading = false,
}) => {
  const [subject, setSubject] = useState(
    'Document Correction Required for DigiLocal Registration'
  );
  const [emailContent, setEmailContent] = useState(
    'Please upload a clearer GST Certificate and update your shop address details in settings.'
  );

  if (!vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !emailContent.trim()) return;
    onConfirmHold(vendor.id, {
      subject: subject.trim(),
      email_content: emailContent.trim(),
      hold_email_subject: subject.trim(),
      hold_reason: emailContent.trim(),
      reason: emailContent.trim(),
      remarks: emailContent.trim(),
    });
  };

  const presetReasons = [
    {
      subject: 'GST & FSSAI Verification Required',
      content: 'Clear copy of FSSAI Food License and valid GSTIN tax registration certificate required for verification.',
    },
    {
      subject: 'Identity Proof Correction',
      content: 'Government Aadhaar / PAN card identification details are unreadable. Please update your owner profile.',
    },
    {
      subject: 'Store Address & Location Correction',
      content: 'Store front location and registered society address mismatch. Please update shop address in settings.',
    },
    {
      subject: 'Bank Account & Cheque Verification Required',
      content: 'Bank account details and cancelled cheque proof verification pending. Please re-check account number.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Place Onboarding Request On Hold & Dispatch SMTP Email"
      subtitle={`Store: ${vendor.storeName} (${vendor.ownerName})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
        {/* Warning Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Holding Vendor Application & Sending SMTP Mail</p>
            <p>
              An automated email will be dispatched to <span className="font-mono font-bold">{vendor.email}</span> instructing the vendor to log into the <strong>Vendor Portal → Settings → Vendor Details</strong> section to update required details.
            </p>
            <p className="mt-1 text-[11px] text-amber-800 font-medium">
              💡 When the vendor updates settings and clicks <strong>"Resubmit Request"</strong>, a green <strong>"NEW UPDATES RESUBMITTED"</strong> badge will alert you in the On Hold queue!
            </p>
          </div>
        </div>

        {/* Vendor Quick Info */}
        <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex justify-between items-center text-xs">
          <div>
            <span className="text-[#78716C] block font-semibold">Vendor / Store</span>
            <span className="font-bold text-[#211A19] text-sm font-serif">{vendor.storeName}</span>
          </div>
          <div className="text-right">
            <span className="text-[#78716C] block font-semibold">Submitted At</span>
            <span className="font-mono text-[#211A19] font-semibold">{vendor.submissionTimestamp || vendor.createdAt}</span>
          </div>
        </div>

        {/* SMTP Email Subject Line */}
        <div>
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
            Email Subject Line <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full p-2.5 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 font-sans font-medium"
            placeholder="Subject line sent via SMTP email..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* SMTP Email Content Body */}
        <div>
          <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
            Email Message Content (Instructions for Vendor) <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            className="w-full p-3 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 font-sans"
            placeholder="Detailed instructions explaining what the vendor needs to update in settings..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
        </div>

        {/* Preset Quick Select Reasons */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1">
            <FileText size={12} /> Preset Revision Templates (Click to insert):
          </span>
          <div className="flex flex-col gap-1">
            {presetReasons.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(preset.subject);
                  setEmailContent(preset.content);
                }}
                className="text-left text-xs p-2 bg-[#FAF8F5] hover:bg-[#EEE5DA] border border-[#E7DFD5] rounded-lg text-[#211A19] transition-all cursor-pointer"
              >
                • <strong className="text-[#211A19]">{preset.subject}:</strong> {preset.content}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-[#E7DFD5]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="warning"
            leftIcon={<Send size={15} />}
            isLoading={isLoading}
          >
            Send Email & Put on Hold
          </Button>
        </div>
      </form>
    </Modal>
  );
};
