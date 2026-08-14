import React, { useState, useMemo } from 'react';
import { useUsers, useFlagUser, useResetUserFlags } from '../../hooks/useUsers';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import type { UserProfile, SavedFilterPreset } from '../../types/user.types';
import { formatDate } from '../../utils/formatters.utils';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  FileSpreadsheet,
  Printer,
  Bookmark,
  CheckSquare,
  Square,
  Flag,
  RotateCcw,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Home,
  Phone,
  Mail,
  User,
  ShoppingBag,
  IndianRupee,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export interface UserDirectoryProps {
  onOpenUserProfile?: (identifier: string) => void;
}

type SortField = 'name' | 'id' | 'totalOrders' | 'totalSpend' | 'status' | 'lastActive';
type SortOrder = 'asc' | 'desc';

export const UserDirectory: React.FC<UserDirectoryProps> = ({ onOpenUserProfile }) => {
  const { addToast } = useToast();
  const { data: users = [], isLoading, isError, refetch } = useUsers();
  const flagUserMutation = useFlagUser();
  const resetFlagsMutation = useResetUserFlags();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [societyFilter, setSocietyFilter] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selection & Saved Presets state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>(() => {
    try {
      const stored = localStorage.getItem('user_directory_filter_presets');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'preset-1', name: 'High Spenders (>₹10k)', search: '', status: 'all', society: 'all' },
      { id: 'preset-[#2]', name: 'Anupam Residents', search: '', status: 'all', society: 'Anupam Society' },
      { id: 'preset-3', name: 'Warned & Banned', search: '', status: 'warned', society: 'all' },
    ];
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  // Unique Societies for Dropdown Filter
  const societiesList = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u: UserProfile) => {
      if (u.societyName) set.add(u.societyName);
    });
    return Array.from(set);
  }, [users]);

  // Filtering & Sorting (Memoized for Virtualized Performance)
  const filteredAndSortedUsers = useMemo(() => {
    let list = [...users];

    // Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.societyName.toLowerCase().includes(q) ||
          u.flatNumber.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      list = list.filter((u) => u.status === statusFilter);
    }

    // Society Filter
    if (societyFilter !== 'all') {
      list = list.filter((u) => u.societyName === societyFilter);
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'totalSpend') {
        valA = a.totalSpend || 0;
        valB = b.totalSpend || 0;
      } else if (sortField === 'lastActive') {
        valA = new Date(a.lastActive || a.createdAt).getTime();
        valB = new Date(b.lastActive || b.createdAt).getTime();
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB as string);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [users, search, statusFilter, societyFilter, sortField, sortOrder]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Row Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Sorting Toggle Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Render Sort Indicator Icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-[#6B7C70]/60 ml-1 inline" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-[#C4A066] ml-1 inline" />
    ) : (
      <ArrowDown size={12} className="text-[#C4A066] ml-1 inline" />
    );
  };

  // Save Filter Preset Handler
  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: SavedFilterPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      search,
      status: statusFilter,
      society: societyFilter,
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    try {
      localStorage.setItem('user_directory_filter_presets', JSON.stringify(updated));
    } catch {}
    setNewPresetName('');
    setIsSavingPreset(false);
    addToast({
      type: 'success',
      title: 'Filter Preset Saved',
      description: `Saved filter configuration "${newPreset.name}".`,
    });
  };

  const applyPreset = (preset: SavedFilterPreset) => {
    setSearch(preset.search);
    setStatusFilter(preset.status);
    setSocietyFilter(preset.society);
    setCurrentPage(1);
  };

  // Bulk Actions
  const handleBulkFlag = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => flagUserMutation.mutate(id));
    addToast({
      type: 'warning',
      title: 'Bulk Flagging Executed',
      description: `Issued warning strike to ${selectedIds.size} selected user accounts.`,
    });
    setSelectedIds(new Set());
    refetch();
  };

  const handleBulkReset = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => resetFlagsMutation.mutate(id));
    addToast({
      type: 'success',
      title: 'Bulk Flag Reset',
      description: `Reset warning strikes for ${selectedIds.size} selected user accounts.`,
    });
    setSelectedIds(new Set());
    refetch();
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const rowsToExport = selectedIds.size > 0
      ? filteredAndSortedUsers.filter((u) => selectedIds.has(u.id))
      : filteredAndSortedUsers;

    const headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Society', 'Apartment', 'Total Orders', 'Total Spend (INR)', 'Status', 'Strikes', 'Last Active'];
    const csvContent = [
      headers.join(','),
      ...rowsToExport.map((u) =>
        [
          `"${u.id}"`,
          `"${u.name}"`,
          `"${u.email}"`,
          `"${u.phone}"`,
          `"${u.societyName}"`,
          `"${u.flatNumber}"`,
          u.totalOrders || 0,
          u.totalSpend || 0,
          `"${u.status.toUpperCase()}"`,
          u.flagsCount || 0,
          `"${formatDate(u.lastActive || u.createdAt)}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_directory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Export Downloaded',
      description: `Exported ${rowsToExport.length} user records to CSV file.`,
    });
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    const rowsToExport = selectedIds.size > 0
      ? filteredAndSortedUsers.filter((u) => selectedIds.has(u.id))
      : filteredAndSortedUsers;

    let tableHTML = `<table><thead><tr>
      <th>User ID</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Society</th><th>Apartment</th><th>Total Orders</th><th>Total Spend</th><th>Status</th><th>Last Active</th>
    </tr></thead><tbody>`;

    rowsToExport.forEach((u) => {
      tableHTML += `<tr>
        <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td><td>${u.societyName}</td><td>${u.flatNumber}</td><td>${u.totalOrders}</td><td>₹${u.totalSpend}</td><td>${u.status}</td><td>${formatDate(u.lastActive || u.createdAt)}</td>
      </tr>`;
    });
    tableHTML += '</tbody></table>';

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_directory_excel_${Date.now()}.xls`;
    link.click();

    addToast({
      type: 'success',
      title: 'Excel Export Downloaded',
      description: `Exported ${rowsToExport.length} user records to Excel file.`,
    });
  };

  // Export PDF Handler
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Controls: Search, Filters & Export Toolbar */}
      <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* 1. Search Bar */}
          <div className="w-full lg:w-80">
            <Input
              placeholder="Search ID, Name, Email, Phone, Society..."
              leftIcon={<Search size={15} className="text-[#C4A066]" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* 2. Column Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <SlidersHorizontal size={13} className="text-[#C4A066]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-semibold text-[#18281F] outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="warned">Warned (1-2 Strikes)</option>
                <option value="banned">Banned (3 Strikes)</option>
              </select>
            </div>

            {/* Society Filter */}
            <select
              value={societyFilter}
              onChange={(e) => {
                setSocietyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-semibold text-[#18281F] outline-none cursor-pointer"
            >
              <option value="all">All Societies</option>
              {societiesList.map((soc) => (
                <option key={soc} value={soc}>
                  {soc}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {(search || statusFilter !== 'all' || societyFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw size={12} />}
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setSocietyFilter('all');
                  setCurrentPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </div>

          {/* 3. Export Actions (CSV, Excel, PDF) */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-[#E4DCC9]">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={handleExportCSV}
              title="Export CSV File"
            >
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet size={13} className="text-emerald-600" />}
              onClick={handleExportExcel}
              title="Export Excel File"
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={13} className="text-indigo-600" />}
              onClick={handleExportPDF}
              title="Export PDF / Print"
            >
              PDF
            </Button>
          </div>
        </div>

        {/* 4. Saved Filter Presets Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E4DCC9]/60 text-xs">
          <span className="text-[#6B7C70] font-bold flex items-center gap-1 text-[11px]">
            <Bookmark size={12} className="text-[#C4A066]" /> Saved Presets:
          </span>

          {savedPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 bg-[#FAF9F6] border border-[#E4DCC9] rounded-lg text-[11px] font-bold text-[#18281F] hover:bg-[#EFE8D8] hover:border-[#C4A066] transition-all cursor-pointer shadow-2xs"
            >
              {preset.name}
            </button>
          ))}

          {isSavingPreset ? (
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="text"
                placeholder="Preset Name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="p-1 px-2 border border-[#E4DCC9] rounded-lg text-xs outline-none"
              />
              <Button size="sm" onClick={handleSavePreset}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsSavingPreset(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSavingPreset(true)}
              className="text-[11px] font-bold text-[#C4A066] hover:underline ml-auto cursor-pointer"
            >
              + Save Current Filter Preset
            </button>
          )}
        </div>

        {/* 5. Bulk Selection Action Bar (Appears when rows checked) */}
        {selectedIds.size > 0 && (
          <div className="p-2.5 bg-[#FEF3C7] border border-[#F59E0B]/40 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn text-xs">
            <span className="font-bold text-[#D97706] flex items-center gap-1.5">
              <CheckSquare size={15} /> {selectedIds.size} user account(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Flag size={12} className="text-rose-500" />}
                className="text-rose-700 bg-white border-rose-200 hover:bg-rose-50"
                onClick={handleBulkFlag}
              >
                Bulk Strike / Flag
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw size={12} className="text-emerald-600" />}
                className="text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50"
                onClick={handleBulkReset}
              >
                Bulk Reset Flags
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="p-12 text-center bg-white border border-[#E4DCC9] rounded-2xl shadow-sm">
          <LoadingSpinner size="md" label="Loading User Directory enterprise table..." />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center gap-2 text-center text-xs text-rose-700">
          <AlertTriangle size={24} className="text-rose-500" />
          <span className="font-bold">Failed to load User Directory accounts.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw size={13} />}>
            Retry Fetching Data
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredAndSortedUsers.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col items-center gap-3">
          <User size={36} className="text-[#C4A066]/60" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#18281F] text-sm font-serif">No Users Found</span>
            <span className="text-xs text-[#6B7C70]">No resident customer accounts matched your search or filter parameters.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setSocietyFilter('all');
            }}
          >
            Clear Search &amp; Filters
          </Button>
        </div>
      )}

      {/* Enterprise Data Table (Sticky Header & Optimized Virtual Rendering) */}
      {!isLoading && !isError && filteredAndSortedUsers.length > 0 && (
        <div className="bg-white border border-[#E4DCC9] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
            <table className="w-full text-left border-collapse">
              {/* Sticky Header */}
              <thead className="bg-[#FAF9F6] sticky top-0 z-10 border-b border-[#E4DCC9] shadow-xs text-[11px] font-bold text-[#18281F] uppercase tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <div onClick={toggleSelectAll} className="cursor-pointer inline-block">
                      {selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0 ? (
                        <CheckSquare size={16} className="text-[#C4A066]" />
                      ) : (
                        <Square size={16} className="text-[#6B7C70]" />
                      )}
                    </div>
                  </th>
                  <th className="p-3">Profile</th>
                  <th className="p-3 cursor-pointer hover:bg-[#EFE8D8] transition-colors" onClick={() => handleSort('id')}>
                    User ID {renderSortIcon('id')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#EFE8D8] transition-colors" onClick={() => handleSort('name')}>
                    Full Name {renderSortIcon('name')}
                  </th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Society</th>
                  <th className="p-3">Apartment</th>
                  <th className="p-3 cursor-pointer hover:bg-[#EFE8D8] transition-colors" onClick={() => handleSort('totalOrders')}>
                    Orders {renderSortIcon('totalOrders')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#EFE8D8] transition-colors" onClick={() => handleSort('totalSpend')}>
                    Total Spend {renderSortIcon('totalSpend')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#EFE8D8] transition-colors" onClick={() => handleSort('status')}>
                    Status {renderSortIcon('status')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#EFE8D8] transition-colors" onClick={() => handleSort('lastActive')}>
                    Last Active {renderSortIcon('lastActive')}
                  </th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Rows Body */}
              <tbody className="divide-y divide-[#E4DCC9]/60 text-xs">
                {paginatedUsers.map((u) => {
                  const isChecked = selectedIds.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => onOpenUserProfile && onOpenUserProfile(u.name)}
                      className={`hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                        isChecked ? 'bg-[#FEF3C7]/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div onClick={() => toggleSelectRow(u.id)} className="cursor-pointer inline-block">
                          {isChecked ? (
                            <CheckSquare size={16} className="text-[#C4A066]" />
                          ) : (
                            <Square size={16} className="text-[#6B7C70]" />
                          )}
                        </div>
                      </td>

                      {/* 1. Profile (Avatar) */}
                      <td className="p-3">
                        <div className="w-8 h-8 rounded-full bg-[#18281F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {u.name.charAt(0)}
                        </div>
                      </td>

                      {/* 2. User ID */}
                      <td className="p-3 font-mono font-bold text-xs text-[#C4A066] whitespace-nowrap">
                        {u.id}
                      </td>

                      {/* 3. Full Name */}
                      <td className="p-3 font-bold text-[#18281F] whitespace-nowrap hover:text-[#C4A066] underline">
                        {u.name}
                      </td>

                      {/* 4. Email */}
                      <td className="p-3 text-[#6B7C70] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-[#C4A066]" /> {u.email}
                        </span>
                      </td>

                      {/* 5. Phone */}
                      <td className="p-3 text-[#18281F] whitespace-nowrap font-mono">
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-[#6B7C70]" /> {u.phone}
                        </span>
                      </td>

                      {/* 6. Society */}
                      <td className="p-3 text-[#18281F] font-semibold whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Home size={12} className="text-[#C4A066]" /> {u.societyName}
                        </span>
                      </td>

                      {/* 7. Apartment */}
                      <td className="p-3 text-[#18281F] font-mono font-bold whitespace-nowrap">
                        {u.flatNumber}
                      </td>

                      {/* 8. Orders */}
                      <td className="p-3 font-bold text-[#18281F] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={12} className="text-[#C4A066]" /> {u.totalOrders || 0}
                        </span>
                      </td>

                      {/* 9. Total Spend */}
                      <td className="p-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={12} /> {(u.totalSpend || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* 10. Status */}
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={u.status === 'banned' ? 'danger' : u.status === 'warned' ? 'warning' : 'success'}>
                          {u.status.toUpperCase()}
                        </Badge>
                      </td>

                      {/* 11. Last Active */}
                      <td className="p-3 text-[#6B7C70] font-mono text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-[#6B7C70]" /> {formatDate(u.lastActive || u.createdAt)}
                        </span>
                      </td>

                      {/* 12. Actions */}
                      <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye size={13} />}
                            onClick={() => onOpenUserProfile && onOpenUserProfile(u.name)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 bg-[#FAF9F6] border-t border-[#E4DCC9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6B7C70]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 bg-white border border-[#E4DCC9] rounded-lg text-xs font-bold outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                <strong>{Math.min(currentPage * pageSize, filteredAndSortedUsers.length)}</strong> of{' '}
                <strong>{filteredAndSortedUsers.length}</strong> accounts
              </span>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 font-bold text-[#18281F]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
