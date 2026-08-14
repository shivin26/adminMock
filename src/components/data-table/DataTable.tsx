import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ColumnDef, TableSort, TablePagination, TableAction } from '../../types/table';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Skeleton } from '../feedback/Skeleton';
import { EmptyState } from '../feedback/EmptyState';
import { cn } from '../../utils/cn';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  keyExtractor: (item: TData) => string;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: TablePagination;
  actions?: TableAction<TData>[];
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Search records...',
  pagination,
  actions,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items available to display right now.',
  className,
}: DataTableProps<TData>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<TableSort>({ columnKey: '', order: null });

  // Handle Search Filtering locally if client-side
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key];
        return String(val ?? '').toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm, columns]);

  // Handle Sorting
  const sortedData = useMemo(() => {
    if (!sort.columnKey || !sort.order) return filteredData;
    const col = columns.find((c) => c.key === sort.columnKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = col.accessor ? col.accessor(a) : (a as Record<string, unknown>)[col.key];
      const bVal = col.accessor ? col.accessor(b) : (b as Record<string, unknown>)[col.key];

      const valA = String(aVal ?? '');
      const valB = String(bVal ?? '');

      if (sort.order === 'asc') return valA.localeCompare(valB);
      return valB.localeCompare(valA);
    });
  }, [filteredData, sort, columns]);

  const handleSortToggle = (colKey: string) => {
    setSort((prev) => {
      if (prev.columnKey !== colKey) return { columnKey: colKey, order: 'asc' };
      if (prev.order === 'asc') return { columnKey: colKey, order: 'desc' };
      return { columnKey: '', order: null };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(sortedData.map((item) => keyExtractor(item)));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedKeys, key]);
    } else {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    }
  };

  const allSelected =
    sortedData.length > 0 && selectedKeys.length === sortedData.length;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Search Header Bar */}
      {searchable && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          {selectable && selectedKeys.length > 0 && (
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {selectedKeys.length} row(s) selected
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          {/* Table Header */}
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {selectable && (
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-slate-700 dark:bg-slate-900"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'p-4 select-none',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSortToggle(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <span>{col.header}</span>
                      {sort.columnKey === col.key ? (
                        sort.order === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && <th className="p-4 text-right w-16">Actions</th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  {selectable && (
                    <td className="p-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="p-4">
                      <Skeleton className="h-4 w-6 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions && actions.length > 0 ? 1 : 0)
                  }
                  className="p-8"
                >
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const key = keyExtractor(row);
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={key}
                    className={cn(
                      'transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40',
                      isSelected && 'bg-blue-50/50 dark:bg-blue-950/20'
                    )}
                  >
                    {selectable && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(key, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-slate-700 dark:bg-slate-900"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const cellContent = col.accessor
                        ? col.accessor(row)
                        : (row as Record<string, unknown>)[col.key];

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'p-4 text-slate-700 dark:text-slate-300',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right',
                            col.className
                          )}
                        >
                          {cellContent as React.ReactNode}
                        </td>
                      );
                    })}

                    {/* Actions Menu Column */}
                    {actions && actions.length > 0 && (
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          {actions.map((act, actIdx) => {
                            if (act.hidden && act.hidden(row)) return null;
                            return (
                              <Button
                                key={actIdx}
                                variant={act.variant || 'ghost'}
                                size="sm"
                                leftIcon={act.icon}
                                onClick={() => act.onClick(row)}
                              >
                                {act.label}
                              </Button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.totalPages}</span> ({pagination.totalItems} items)
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
