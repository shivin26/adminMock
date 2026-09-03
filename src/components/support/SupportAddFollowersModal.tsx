import React, { useState } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Button } from '../common/Button/Button';
import { UserPlus, Check, User } from 'lucide-react';

export interface SupportAddFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber?: string;
  currentFollowers: string[];
  onAddFollower: (followerName: string) => void;
}

const AVAILABLE_STAFF = [
  { name: 'Super Admin', role: 'System Administrator' },
  { name: 'Vikram Mehta', role: 'Tier-2 Technical Escalations' },
  { name: 'Ananya Sharma', role: 'Vendor Onboarding & KYC Lead' },
  { name: 'Rahul Verma', role: 'Billing & Financial Payout Lead' },
  { name: 'Priya Sundaram', role: 'Resident Operations Support' },
];

export const SupportAddFollowersModal: React.FC<SupportAddFollowersModalProps> = ({
  isOpen,
  onClose,
  ticketNumber,
  currentFollowers,
  onAddFollower,
}) => {
  const [selectedStaff, setSelectedStaff] = useState('');

  const handleAdd = () => {
    if (!selectedStaff) return;
    onAddFollower(selectedStaff);
    setSelectedStaff('');
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Staff Follower to ${ticketNumber || 'Ticket'}`}
      subtitle="Followers receive real-time notifications for updates and SLA alerts."
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {AVAILABLE_STAFF.map((staff) => {
            const isAlreadyFollowing = currentFollowers.includes(staff.name);
            const isSelected = selectedStaff === staff.name;

            return (
              <div
                key={staff.name}
                onClick={() => !isAlreadyFollowing && setSelectedStaff(staff.name)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isAlreadyFollowing
                    ? 'bg-[#FAF8F5] border-[#E7DFD5] opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#211A19] text-white border-[#211A19] cursor-pointer'
                    : 'bg-[#FAF8F5] text-[#211A19] border-[#E7DFD5] hover:bg-[#EEE5DA] cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#EEE5DA] text-[#211A19]">
                    <User size={14} />
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-bold">{staff.name}</span>
                    <span className={isSelected ? 'text-[#C8A878]' : 'text-[#78716C]'}>{staff.role}</span>
                  </div>
                </div>

                {isAlreadyFollowing ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E7DFD5] text-[#78716C]">
                    FOLLOWING
                  </span>
                ) : isSelected ? (
                  <Check size={16} className="text-[#C8A878]" />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedStaff}
            leftIcon={<UserPlus size={14} />}
            onClick={handleAdd}
          >
            Add as Follower
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
