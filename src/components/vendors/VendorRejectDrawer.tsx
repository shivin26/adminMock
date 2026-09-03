import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import type { Vendor } from '../../types/vendor.types';
import { XCircle, AlertTriangle, Send, X, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface VendorRejectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (vendorId: string | number, reason: string) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
  isVendorDetailsOpen?: boolean;
}

export const VendorRejectDrawer: React.FC<VendorRejectDrawerProps> = ({
  isOpen,
  onClose,
  onConfirmReject,
  vendor,
  isLoading = false,
  isVendorDetailsOpen = false,
}) => {
  const { addToast } = useToast();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [subject, setSubject] = useState(
    'Rejection of DigiLocal Merchant Registration'
  );
  const [rejectionReason, setRejectionReason] = useState(
    'Incomplete business registration credentials or unverified GSTIN.'
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
      setSubject(`Rejection of DigiLocal Merchant Registration — ${vendor.storeName}`);
      setRejectionReason(
        'Incomplete business registration credentials or unverified GSTIN.'
      );
    }
  }, [vendor, isOpen]);

  if (!isRendered || !vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Required Reason',
        description: 'Please enter a detailed rejection reason for logging and dispatch.',
      });
      return;
    }
    onConfirmReject(vendor.id, rejectionReason.trim());
  };

  const presetReasons = [
    {
      title: 'Incomplete Submission After Hold Notice',
      content: 'Required documents/information were not supplied after holding notification.',
    },
    {
      title: 'Invalid GSTIN / Unverified FSSAI Credentials',
      content: 'Invalid GSTIN tax registration or unverified FSSAI license credentials.',
    },
    {
      title: 'Store Location & Address Unverifiable',
      content: 'Store location or registered business address could not be verified by admin audit.',
    },
    {
      title: 'Duplicate Registration / Fraudulent Details',
      content: 'Duplicate vendor registration or fraudulent details detected during verification.',
    },
    {
      title: 'Owner Identity Proof Failed Authenticity',
      content: 'Government identification proof (PAN / Aadhaar) failed identity verification checks.',
    },
    {
      title: 'Business Trade License Missing',
      content: 'Mandatory local trade license or commercial establishment permit was not supplied.',
    },
  ];

  // Z-index hierarchy matching VendorHoldDrawer:
  // Main Drawer backdrop (.drawer-backdrop): z-99999
  // VendorRejectDrawer panel (attached): z-100010 (ABOVE z-99999 backdrop, so it is 100% UNBLURRED and BRIGHT!)
  // VendorDetailsDrawer panel (.drawer-panel): z-100020 (ABOVE VendorRejectDrawer z-100010, so VendorRejectDrawer slides out from behind VendorDetailsDrawer!)
  const wrapperZIndex = isVendorDetailsOpen ? 'z-[100002]' : 'z-[100030]';
  const backdropZIndex = isVendorDetailsOpen ? 'z-[100005]' : 'z-[100035]';
  const panelZIndex = isVendorDetailsOpen ? 'z-[100010]' : 'z-[100040]';

  const drawerPortal = (
    <div className={`fixed inset-0 ${wrapperZIndex} pointer-events-none flex justify-end font-sans`}>
      {/* Backdrop covering main page behind Reject Drawer */}
      {isVendorDetailsOpen ? (
        <div
          className={`fixed top-0 bottom-0 left-0 right-0 xl:right-[980px] bg-black/25 transition-all cursor-pointer pointer-events-auto ${backdropZIndex} ${
            isClosing ? 'drawer-backdrop-closing' : 'animate-fadeIn'
          }`}
          onClick={handleCloseTrigger}
          title="Click outside drawer area to close Reject panel"
        />
      ) : (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-all cursor-pointer pointer-events-auto ${backdropZIndex} ${
            isClosing ? 'drawer-backdrop-closing' : 'animate-fadeIn'
          }`}
          onClick={handleCloseTrigger}
          title="Click outside drawer area to close Reject panel"
        />
      )}

      {/* Emerging Reject Drawer */}
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
              <XCircle size={18} className="text-red-400" />
              Reject Vendor Onboarding Application
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
            title="Close Reject Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form (Independently Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 font-sans">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Warning Banner */}
            <div className="p-4 bg-rose-50/90 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-950 text-xs shadow-2xs">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="font-bold text-red-950 text-xs">
                  Confirm Application Rejection
                </p>
                <p className="leading-relaxed text-[11px] text-rose-900 font-medium">
                  Are you sure you want to reject the onboarding application for <strong className="font-mono text-red-950 font-bold">{vendor.storeName}</strong>? An automated email will be dispatched to <strong className="font-mono text-red-950 font-bold">{vendor.email}</strong> and the merchant status will be updated to <strong>REJECTED</strong>.
                </p>
              </div>
            </div>

            {/* Previous Hold Reason (If available) */}
            {vendor.holdReason && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col gap-1 text-xs">
                <span className="text-[10px] font-bold text-amber-900 uppercase font-mono tracking-wider flex items-center gap-1">
                  <FileText size={12} className="text-amber-600" /> Previous Hold Reason Dispatched:
                </span>
                <p className="italic text-amber-950 font-serif text-xs bg-white/75 p-2 rounded-lg border border-amber-200/60">
                  "{vendor.holdReason}"
                </p>
              </div>
            )}

            {/* Quick Preset Rejection Reasons */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
                ⚡ Quick Select Rejection Reason
              </label>
              <div className="flex flex-col gap-1.5">
                {presetReasons.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRejectionReason(preset.content);
                    }}
                    className="text-xs font-medium bg-white text-[#211A19] border border-[#E7DFD5] hover:bg-rose-50 hover:border-rose-300 hover:text-red-950 px-3 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer text-left flex items-center justify-between"
                  >
                    <span>{preset.title}</span>
                    <span className="text-[10px] text-red-600 font-bold font-mono">Select ⚡</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Subject Line */}
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
                Email Subject Line
              </label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Rejection email subject line..."
              />
            </div>

            {/* Rejection Reason Textarea */}
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider font-mono">
                Rejection Reason (Logged &amp; Dispatched) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-3 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 font-sans leading-relaxed"
                placeholder="Enter formal rejection reason sent to vendor..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7DFD5] mt-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseTrigger}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                leftIcon={<XCircle size={14} />}
                isLoading={isLoading}
                className="font-bold shadow-xs"
              >
                Confirm Application Rejection
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerPortal, document.body);
};
