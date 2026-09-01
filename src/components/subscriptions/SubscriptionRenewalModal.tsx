import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import type { Subscription } from '../../types/subscription.types';
import { formatDate } from '../../utils/formatters.utils';
import { RefreshCw, Calendar, Store } from 'lucide-react';

export interface SubscriptionRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRenew: (id: string | number, months: number) => void;
  subscription?: Subscription | null;
  isLoading?: boolean;
}

export const SubscriptionRenewalModal: React.FC<SubscriptionRenewalModalProps> = ({
  isOpen,
  onClose,
  onConfirmRenew,
  subscription,
  isLoading = false,
}) => {
  const [durationMonths, setDurationMonths] = useState<number>(12);

  if (!subscription) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Renew Vendor Subscription"
      subtitle={`Store: ${subscription.storeName}`}
      size="md"
    >
      <div className="flex flex-col gap-5">
        {/* Vendor Summary Bento Card */}
        <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211A19] text-[#A88B58] flex items-center justify-center shrink-0">
              <Store size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#211A19] font-serif">{subscription.storeName}</h4>
              <p className="text-xs text-[#78716C]">Enclave: {subscription.societyName}</p>
            </div>
          </div>
          <Badge variant={subscription.tier === 'enterprise' ? 'primary' : 'success'}>
            {subscription.tier.toUpperCase()} TIER
          </Badge>
        </div>

        {/* Expiry Date & Renewal Duration Section */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
            Current Expiry & Extension Duration
          </label>

          <div className="p-3.5 bg-[#EEE5DA] border border-[#E7DFD5] rounded-xl flex items-center justify-between text-sm">
            <span className="text-[#211A19] font-semibold flex items-center gap-2">
              <Calendar size={18} className="text-[#C8A878]" /> Current Renewal Expiry:
            </span>
            <span className="font-extrabold text-[#211A19]">
              {formatDate(subscription.renewalDate)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-1">
            {[
              { label: '+1 Month', value: 1 },
              { label: '+6 Months', value: 6 },
              { label: '+12 Months (1 Year)', value: 12 },
            ].map((option) => {
              const isSelected = durationMonths === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#211A19] border-[#C8A878] text-[#A88B58] shadow-sm'
                      : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#211A19] hover:bg-[#EEE5DA]'
                  }`}
                  onClick={() => setDurationMonths(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E7DFD5]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<RefreshCw size={16} />}
            isLoading={isLoading}
            onClick={() => onConfirmRenew(subscription.id, durationMonths)}
          >
            Confirm Renewal Extension
          </Button>
        </div>
      </div>
    </Modal>
  );
};
