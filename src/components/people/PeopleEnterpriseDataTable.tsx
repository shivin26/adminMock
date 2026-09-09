import React from 'react';
import { DataTable } from '../common/DataTable/DataTable';
import type { Column } from '../common/DataTable/DataTable';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import type { PersonProfile } from '../../types/people.types';
import { formatDate, formatTime } from '../../utils/formatters.utils';
import { User, Store, ShieldAlert, Flag, Eye, Phone, Home, Star, Clock } from 'lucide-react';

export interface PeopleEnterpriseDataTableProps {
  data: PersonProfile[];
  isLoading: boolean;
  onSelectPerson: (id: string) => void;
  onIssueStrike: (id: string) => void;
}

export const PeopleEnterpriseDataTable: React.FC<PeopleEnterpriseDataTableProps> = ({
  data,
  isLoading,
  onSelectPerson,
  onIssueStrike,
}) => {
  const columns: Column<PersonProfile>[] = [
    {
      header: 'Person / Profile Name',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#211A19] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {p.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <button
              type="button"
              onClick={() => onSelectPerson(p.id)}
              className="font-bold text-[#211A19] text-xs hover:text-[#C8A878] underline text-left truncate cursor-pointer transition-colors"
            >
              {p.name}
            </button>
            <span className="text-[11px] text-[#78716C] truncate">{p.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role / Account Type',
      cell: (p) => {
        if (p.personType === 'user_vendor') {
          return <Badge variant="warning">USER &amp; VENDOR</Badge>;
        }
        if (p.personType === 'vendor') {
          return (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#EEE5DA] text-[#211A19] border border-[#C8A878]/40 inline-flex items-center gap-1">
              <Store size={12} className="text-[#C8A878]" /> VENDOR STORE
            </span>
          );
        }
        if (p.personType === 'sub_admin') {
          return (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
              <ShieldAlert size={12} className="text-indigo-600" /> SUB-ADMIN STAFF
            </span>
          );
        }
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#FAF8F5] text-[#78716C] border border-[#E7DFD5] inline-flex items-center gap-1">
            <User size={12} /> RESIDENT USER
          </span>
        );
      },
    },
    {
      header: 'Society & Contact',
      cell: (p) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-[#211A19] flex items-center gap-1 truncate">
            <Home size={12} className="text-[#C8A878]" /> {p.societyName}
          </span>
          <span className="text-[11px] text-[#78716C] flex items-center gap-1">
            <Phone size={11} className="text-[#78716C]" /> {p.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Strike & Rating Meter',
      cell: (p) => {
        const rawS = Math.max(p.strikes ?? 0, p.flagsCount ?? 0);
        const isAutoBanned = Boolean(p.isAutoBanned || rawS >= 3);
        const isBanned = p.status === 'banned' || p.status === 'blocked' || p.isBlocked || isAutoBanned;
        const currentS = isAutoBanned ? Math.max(rawS, 3) : rawS;

        return (
          <div className="flex flex-col text-xs gap-0.5">
            {p.personType === 'vendor' && p.rating !== undefined ? (
              <span className="font-mono font-bold text-amber-700 flex items-center gap-1 text-[11px]">
                <Star size={12} className="fill-amber-500 text-amber-500" /> {p.rating.toFixed(1)} / 5.0 ⭐
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono font-bold text-[#211A19]">
                  ⚡ {currentS} / 3 Strikes
                </span>
                <div className="flex items-center gap-0.5 ml-1">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-2 h-2 rounded-full ${
                        currentS >= dot
                          ? dot === 3
                            ? 'bg-rose-600 animate-pulse'
                            : dot === 2
                            ? 'bg-orange-500'
                            : 'bg-amber-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            <span className="text-[10px] text-[#78716C]">
              {p.totalOrdersCount} orders • {p.totalComplaintsCount} tickets
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: (p) => {
        const rawS = Math.max(p.strikes ?? 0, p.flagsCount ?? 0);
        const isAutoBanned = Boolean(p.isAutoBanned || rawS >= 3);
        const isBanned = p.status === 'banned' || p.status === 'blocked' || p.isBlocked || isAutoBanned;

        if (isAutoBanned) {
          return <Badge variant="danger">🔴 AUTO-BANNED (3/3 STRIKES)</Badge>;
        }
        if (isBanned) {
          return <Badge variant="danger">🔴 DIRECT ADMIN BAN ({rawS}/3 STRIKES)</Badge>;
        }
        if (p.status === 'warned' || rawS > 0) {
          return <Badge variant="warning">⚡ WARNED ({rawS}/3 STRIKES)</Badge>;
        }
        return <Badge variant="success">ACTIVE ACCOUNT</Badge>;
      },
    },
    {
      header: 'Registered Timestamp',
      cell: (p) => {
        if (p.createdAtReadable) {
          const parts = p.createdAtReadable.split(',');
          return (
            <div className="flex flex-col text-xs font-mono">
              <span className="font-bold text-[#211A19] flex items-center gap-1">
                <Clock size={11} className="text-[#C8A878]" /> {parts[0] ? parts[0].trim() : p.createdAtReadable}
              </span>
              <span className="text-[10px] text-[#78716C] pl-4">
                {parts[1] ? parts[1].trim() : ''}
              </span>
            </div>
          );
        }
        const ts = p.createdAtIst || p.createdAt;
        return (
          <div className="flex flex-col text-xs font-mono">
            <span className="font-bold text-[#211A19] flex items-center gap-1">
              <Clock size={11} className="text-[#C8A878]" /> {formatDate(ts)}
            </span>
            <span className="text-[10px] text-[#78716C] pl-4">
              {formatTime(ts) || '10:30 am'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye size={13} />}
            onClick={() => onSelectPerson(p.id)}
            title="Inspect Person Profile"
          >
            View
          </Button>

          {p.status !== 'banned' && p.status !== 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Flag size={13} className="text-rose-500" />}
              className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs py-1 px-2"
              onClick={() => onIssueStrike(p.id)}
              title="Issue Strike / Flag Account"
            >
              Strike
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="No profiles found matching search and filter criteria."
      onRowClick={(p) => onSelectPerson(p.id)}
    />
  );
};
