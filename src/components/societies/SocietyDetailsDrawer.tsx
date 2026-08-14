import React from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Badge } from '../common/Badge/Badge';
import { useSocietyVendors } from '../../hooks/useSocieties';
import { useVendors } from '../../hooks/useVendors';
import type { Society } from '../../types/society.types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Store, Mail, MapPin, Building2, User } from 'lucide-react';
import { isSocietyMatch } from '../../utils/society.utils';

export interface SocietyDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  society?: Society | null;
}

export const SocietyDetailsDrawer: React.FC<SocietyDetailsDrawerProps> = ({
  isOpen,
  onClose,
  society,
}) => {
  const { data: allVendors = [] } = useVendors();
  const { data: societyVendors = [], isLoading } = useSocietyVendors(society?.id);

  const effectiveVendors = React.useMemo(() => {
    let sourceList: any[] = [];
    if (societyVendors && societyVendors.length > 0) {
      sourceList = societyVendors;
    } else if (society && allVendors.length > 0) {
      const matched = allVendors.filter((v) =>
        isSocietyMatch(v.societyId, v.societyName, society.id, society.name)
      );

      const uniqueMap = new Map<string, typeof matched[0]>();
      for (const v of matched) {
        if (!uniqueMap.has(v.id)) uniqueMap.set(v.id, v);
      }
      sourceList = Array.from(uniqueMap.values());
    }

    // Filter to ONLY ACTIVE vendors
    return sourceList.filter((v) => {
      const st = String(v.status || 'active').toLowerCase();
      return st === 'active' || st === 'approved';
    });
  }, [societyVendors, allVendors, society]);

  if (!society) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={society.name}
      subtitle={`Public ID: ${society.code}`}
    >
      <div className="flex flex-col gap-5 p-1">
        {/* Society Header & Name Card */}
        <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#18281F] text-[#E6C35C] flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider block">Residential Society</span>
            <h3 className="text-lg font-bold text-[#18281F] font-serif">{society.name}</h3>
            <span className="text-xs text-[#6B7C70]">Code: {society.code}</span>
          </div>
        </div>

        {/* Society Metadata Bento Card */}
        <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm border-b border-[#E4DCC9]/60 pb-2">
            <span className="text-[#6B7C70] font-medium">Society Enclave:</span>
            <span className="font-bold text-[#18281F]">{society.name}</span>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-[#E4DCC9]/60 pb-2">
            <span className="text-[#6B7C70] font-medium">Location Address:</span>
            <span className="font-semibold text-[#18281F] flex items-center gap-1">
              <MapPin size={14} className="text-[#C4A066]" />
              {society.address}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-[#E4DCC9]/60 pb-2">
            <span className="text-[#6B7C70] font-medium">City / State:</span>
            <span className="font-semibold text-[#18281F]">
              {society.city}, {society.state}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6B7C70] font-medium">Vendors Onboarded:</span>
            <Badge variant="primary">{effectiveVendors.length} Active Vendors</Badge>
          </div>
        </div>

        {/* Vendor List Inside Society */}
        <div>
          <h4 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Store size={14} className="text-[#C4A066]" />
            Vendors Servicing {society.name}
          </h4>

          {isLoading ? (
            <div className="p-6 text-center">
              <LoadingSpinner size="md" label="Loading vendors..." />
            </div>
          ) : effectiveVendors.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B7C70] bg-white border border-[#E4DCC9] rounded-xl shadow-sm">
              No active vendors assigned to <strong className="text-[#18281F]">{society.name}</strong> yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {effectiveVendors.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-3.5 bg-white border border-[#E4DCC9] rounded-xl shadow-sm hover:border-[#C4A066] transition-all"
                >
                  <img
                    src={v.avatarUrl}
                    alt={v.storeName}
                    className="w-11 h-11 rounded-lg object-cover border border-[#E4DCC9]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-[#18281F] truncate block">
                      {v.storeName}
                    </span>
                    <span className="text-xs text-[#6B7C70] flex items-center gap-1 mt-0.5">
                      <User size={12} className="text-[#C4A066]" /> {v.ownerName} • <Building2 size={12} /> {society.name}
                    </span>
                    <span className="text-xs text-[#6B7C70] flex items-center gap-1 mt-0.5">
                      <Mail size={12} /> {v.email}
                    </span>
                  </div>
                  <Badge variant={String(v.status).toLowerCase() === 'suspended' || String(v.status).toLowerCase() === 'blocked' ? 'danger' : 'success'}>
                    {String(v.status || 'ACTIVE').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
