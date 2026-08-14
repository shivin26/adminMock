import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { GitMerge, Search, Check, ArrowRight } from 'lucide-react';
import type { SupportTicket } from '../../types/support.types';

export interface SupportMergeTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTicket?: SupportTicket;
  allTickets: SupportTicket[];
  onConfirmMerge: (targetTicketNumber: string) => void;
}

export const SupportMergeTicketModal: React.FC<SupportMergeTicketModalProps> = ({
  isOpen,
  onClose,
  currentTicket,
  allTickets,
  onConfirmMerge,
}) => {
  const [selectedTargetNumber, setSelectedTargetNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const eligibleTickets = allTickets.filter(
    (t) => t.id !== currentTicket?.id && (
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleMerge = () => {
    if (!selectedTargetNumber) return;
    onConfirmMerge(selectedTargetNumber);
    setSelectedTargetNumber('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Merge Ticket ${currentTicket?.ticketNumber || ''}`}
      subtitle="Combine duplicate inquiries into a primary master ticket."
    >
      <div className="flex flex-col gap-4">
        <div className="p-3 bg-[#FEF3C7]/60 border border-[#F59E0B]/30 rounded-xl text-xs text-[#D97706]">
          Merging will combine conversation threads, staff notes, and audit history into the selected target ticket.
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C70]" />
          <input
            type="text"
            placeholder="Search target ticket ID or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs text-[#18281F] outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {eligibleTickets.length === 0 ? (
            <span className="text-xs text-[#6B7C70] p-4 text-center">No other eligible tickets found.</span>
          ) : (
            eligibleTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTargetNumber(t.ticketNumber)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedTargetNumber === t.ticketNumber
                    ? 'bg-[#18281F] text-white border-[#18281F]'
                    : 'bg-[#FAF9F6] text-[#18281F] border-[#E4DCC9] hover:bg-[#EFE8D8]'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-mono text-xs font-bold ${selectedTargetNumber === t.ticketNumber ? 'text-[#C4A066]' : 'text-[#18281F]'}`}>
                    {t.ticketNumber}
                  </span>
                  <span className="text-xs line-clamp-1">{t.subject}</span>
                </div>
                {selectedTargetNumber === t.ticketNumber && <Check size={16} className="text-[#C4A066]" />}
              </div>
            ))
          )}
        </div>

        {/* Ticket Consolidation Flowchart Graph */}
        {selectedTargetNumber && (
          <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
                <GitMerge size={14} className="text-[#C4A066]" /> Ticket Consolidation Map
              </span>
              <span className="text-[11px] font-semibold text-[#6B7C70]">Target Master: #{selectedTargetNumber}</span>
            </div>

            {/* Visual Flowchart Diagram */}
            <div className="p-3 bg-white border border-[#E4DCC9] rounded-xl flex items-center justify-between gap-3 shadow-xs">
              {/* Source Ticket Node */}
              <div className="flex flex-col gap-0.5 p-2 bg-rose-50 border border-rose-200 rounded-lg flex-1 min-w-0">
                <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider">Source (Will Archive)</span>
                <span className="font-mono font-bold text-xs text-[#18281F] truncate">#{currentTicket?.ticketNumber}</span>
                <span className="text-[10px] text-[#6B7C70] truncate">{currentTicket?.subject}</span>
              </div>

              {/* Merge Direction Arrow */}
              <div className="flex flex-col items-center justify-center text-[#C4A066] shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#EFE8D8] flex items-center justify-center border border-[#C4A066]/30">
                  <ArrowRight size={14} className="text-[#C4A066]" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#6B7C70] mt-0.5">MERGES INTO</span>
              </div>

              {/* Target Master Ticket Node */}
              <div className="flex flex-col gap-0.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex-1 min-w-0">
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Primary Master Ticket</span>
                <span className="font-mono font-bold text-xs text-[#18281F] truncate">#{selectedTargetNumber}</span>
                <span className="text-[10px] text-[#6B7C70] truncate">
                  {allTickets.find((t) => t.ticketNumber === selectedTargetNumber)?.subject}
                </span>
              </div>
            </div>

            <span className="text-[11px] text-[#6B7C70] leading-normal">
              ℹ️ All conversation threads, customer replies, staff notes, and audit history from <strong className="text-[#18281F]">#{currentTicket?.ticketNumber}</strong> will be consolidated into <strong className="text-[#18281F]">#{selectedTargetNumber}</strong>.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4DCC9]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedTargetNumber}
            leftIcon={<GitMerge size={14} />}
            onClick={handleMerge}
          >
            Confirm Ticket Merge
          </Button>
        </div>
      </div>
    </Modal>
  );
};
