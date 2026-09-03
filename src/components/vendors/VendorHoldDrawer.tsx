import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import type { Vendor, HoldVendorPayload } from '../../types/vendor.types';
import { PauseCircle, AlertTriangle, Send, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface VendorHoldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmHold: (vendorId: string | number, payload: HoldVendorPayload) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
  isVendorDetailsOpen?: boolean;
}

export const VendorHoldDrawer: React.FC<VendorHoldDrawerProps> = ({
  isOpen,
  onClose,
  onConfirmHold,
  vendor,
  isLoading = false,
  isVendorDetailsOpen = false,
}) => {
  const { addToast } = useToast();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [subject, setSubject] = useState(
    'Document Correction Required for DigiLocal Registration'
  );
  const [emailContent, setEmailContent] = useState(
    'Please upload a clearer GST Certificate and update your shop address details in settings.'
  );

  const handleCloseTrigger = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      onClose();
    }, 240);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered && !isClosing) {
      setIsClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 240);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (vendor) {
      setSubject(
        vendor.holdEmailSubject ||
          'Document Correction Required for DigiLocal Registration'
      );
      setEmailContent(
        vendor.holdReason ||
          'Please upload a clearer GST Certificate and update your shop address details in settings.'
      );
    }
  }, [vendor, isOpen]);

  if (!isRendered || !vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !emailContent.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        description: 'Please enter both the email subject line and hold instructions content.',
      });
      return;
    }
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
      content:
        'Clear copy of FSSAI Food License and valid GSTIN tax registration certificate required for verification.',
    },
    {
      subject: 'Identity Proof Correction Required',
      content:
        'Government Aadhaar / PAN card identification details are unreadable. Please update your owner profile in settings.',
    },
    {
      subject: 'Store Address & Location Correction Required',
      content:
        'Store front location and registered society address mismatch. Please update shop address in settings.',
    },
    {
      subject: 'Bank Account & Cheque Verification Required',
      content:
        'Bank account details and cancelled cheque proof verification pending. Please re-check account number.',
    },
    {
      subject: 'Shop Front & Storefront Photo Verification',
      content:
        'Storefront facade image or clear sign board photo missing or blurry. Please upload a clear shop storefront photo in settings.',
    },
    {
      subject: 'PAN Card & Aadhaar Name Mismatch',
      content:
        'Owner name registered on PAN Card does not match vendor account details. Please update owner profile and re-upload tax proof.',
    },
    {
      subject: 'Category & Trade Licensing Verification',
      content:
        'Selected shop categories require specialized trade approval or business license verification. Please update business details in settings.',
    },
    {
      subject: 'Cancelled Cheque / Passbook Unreadable',
      content:
        'Bank account number or IFSC code on cancelled cheque proof is unreadable. Please upload a clear cancelled cheque or passbook copy.',
    },
    {
      subject: 'Pincode & Service Area Mapping Mismatch',
      content:
        'Store address pincode does not match registered delivery area or society mapping. Please verify shop number, area, and pincode in settings.',
    },
  ];

  const isReHold = vendor.status === 'on_hold';

  // Z-index hierarchy:
  // Main Drawer backdrop (.drawer-backdrop): z-99999
  // VendorHoldDrawer panel (attached): z-100010 (ABOVE z-99999 backdrop, so it is 100% UNBLURRED and BRIGHT!)
  // VendorDetailsDrawer panel (.drawer-panel): z-100020 (ABOVE VendorHoldDrawer z-100010, so VendorHoldDrawer slides out from behind VendorDetailsDrawer!)
  const wrapperZIndex = isVendorDetailsOpen ? 'z-[100002]' : 'z-[100030]';
  const backdropZIndex = isVendorDetailsOpen ? 'z-[100005]' : 'z-[100035]';
  const panelZIndex = isVendorDetailsOpen ? 'z-[100010]' : 'z-[100040]';

  const drawerPortal = (
    <div className={`fixed inset-0 ${wrapperZIndex} pointer-events-none flex justify-end font-sans`}>
      {/* Backdrop covering main page behind Hold Drawer */}
      {isVendorDetailsOpen ? (
        <div
          className={`fixed top-0 bottom-0 left-0 right-0 xl:right-[980px] bg-black/20 transition-all cursor-pointer pointer-events-auto ${backdropZIndex} ${
            isClosing ? 'drawer-backdrop-closing' : 'animate-fadeIn'
          }`}
          onClick={handleCloseTrigger}
          title="Click outside drawer area to close Hold panel"
        />
      ) : (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-all cursor-pointer pointer-events-auto ${backdropZIndex} ${
            isClosing ? 'drawer-backdrop-closing' : 'animate-fadeIn'
          }`}
          onClick={handleCloseTrigger}
          title="Click outside drawer area to close Hold panel"
        />
      )}

      {/* Emerging Hold Drawer (slides out smoothly from behind VendorDetailsDrawer) */}
      <div
        className={`fixed top-0 bottom-0 max-w-full h-full max-h-screen bg-[#FAF8F5] text-[#211A19] border-l border-r border-[#E7DFD5] shadow-xl flex flex-col pointer-events-auto ${panelZIndex} ${
          isVendorDetailsOpen
            ? `right-0 xl:right-[980px] w-full xl:w-[480px] ${
                isClosing ? 'hold-drawer-emerge-closing' : 'hold-drawer-emerge'
              }`
            : `right-0 w-full xl:w-[520px] ${
                isClosing ? 'hold-drawer-panel-closing' : 'hold-drawer-panel'
              }`
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#6B2732] bg-[#211A19] text-white shrink-0 min-h-[76px]">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <PauseCircle size={18} className="text-[#C8A878]" />
              {isReHold ? 'Re-Hold Vendor Application' : 'Place Application On Hold'}
            </h3>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#A88B58]">
              <span>Store: <strong className="text-white">{vendor.storeName}</strong></span>
              <span>•</span>
              <span>Owner: <strong className="text-white">{vendor.ownerName}</strong></span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseTrigger}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C8A878] hover:text-[#211A19] text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer"
            title="Close Hold Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form (Independently Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 font-sans">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Warning Banner */}
            <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs shadow-2xs">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="font-bold text-amber-950 text-xs">
                  {isReHold ? 'Dispatching Updated Hold Notice' : 'Holding Vendor & Sending Email'}
                </p>
                <p className="leading-relaxed text-[11px] text-amber-900 font-medium">
                  An automated SMTP email will be dispatched to <strong className="font-mono text-amber-950 font-bold">{vendor.email}</strong> instructing the vendor to log into <strong>Vendor Portal → Settings → Vendor Details</strong> to update parameters.
                </p>
              </div>
            </div>

            {/* Quick Preset Reasons */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
                ⚡ Quick Select Preset Reason
              </label>
              <div className="flex flex-col gap-1.5">
                {presetReasons.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSubject(preset.subject);
                      setEmailContent(preset.content);
                    }}
                    className="text-xs font-medium bg-white text-[#211A19] border border-[#E7DFD5] hover:bg-amber-50 hover:border-amber-300 hover:text-amber-950 px-3 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer text-left flex items-center justify-between"
                  >
                    <span>{preset.subject}</span>
                    <span className="text-[10px] text-[#C8A878] font-bold font-mono">Select ⚡</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Subject Line */}
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
                Email Subject Line <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="Subject line sent via SMTP email..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Email Content Body */}
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
                Email Message Content / Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-3 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 font-sans leading-relaxed"
                placeholder="Detailed instructions explaining what the vendor needs to update in settings..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7DFD5] mt-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseTrigger}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="warning"
                size="sm"
                leftIcon={<Send size={14} />}
                isLoading={isLoading}
                className="font-bold shadow-xs"
              >
                {isReHold ? 'Confirm & Dispatch Re-Hold Notice' : 'Confirm & Dispatch Hold Notice'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerPortal, document.body);
};
