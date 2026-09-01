import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './DataTable.css';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  initialBatchSize?: number;
  batchStep?: number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  initialBatchSize = 8,
  batchStep = 6,
}: DataTableProps<T>) {
  const [visibleCount, setVisibleCount] = useState(initialBatchSize);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset visibleCount when dataset or filters change
  useEffect(() => {
    setVisibleCount(initialBatchSize);
  }, [data, initialBatchSize]);

  const displayedData = useMemo(() => {
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  const hasMore = visibleCount < data.length;

  const loadMoreItems = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    setIsFetchingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchStep, data.length));
      setIsFetchingMore(false);
    }, 200);
  }, [hasMore, isFetchingMore, batchStep, data.length]);

  // IntersectionObserver for bottom sentinel element
  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1, rootMargin: '120px' }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoading, loadMoreItems]);

  // Scroll listener for table scroll container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreItems();
    }
  };

  return (
    <div className="datatable-container">
      <div className="datatable-scroll-area" onScroll={handleScroll}>
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const headerUpper = col.header.toUpperCase();
                const isSno = headerUpper.includes('S.NO');
                const isActions = headerUpper.includes('ACTIONS');
                const alignClass = isSno
                  ? 'th-sno'
                  : isActions
                  ? 'th-actions'
                  : col.align
                  ? `text-${col.align}`
                  : '';
                return (
                  <th key={idx} className={alignClass}>
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="datatable-loading-cell">
                  <LoadingSpinner size="md" label="Loading table dataset..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="datatable-empty-cell p-8 text-center text-xs text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, cIdx) => {
                    const headerUpper = col.header.toUpperCase();
                    const isSno = headerUpper.includes('S.NO');
                    const isActions = headerUpper.includes('ACTIONS');
                    const alignClass = isSno
                      ? 'td-sno'
                      : isActions
                      ? 'td-actions'
                      : col.align
                      ? `text-${col.align}`
                      : '';
                    return (
                      <td key={cIdx} className={alignClass}>
                        {col.cell
                          ? col.cell(row, rIdx)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? '')
                          : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Infinite Scroll Progress Footer */}
      {!isLoading && data.length > 0 && (
        <div className="infinite-scroll-footer">
          <div className="infinite-scroll-info">
            <span>
              Showing <strong>{displayedData.length}</strong> of <strong>{data.length}</strong> entries
            </span>
          </div>

          <div ref={observerRef} className="infinite-scroll-trigger">
            {isFetchingMore ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C8A878]">
                <LoadingSpinner size="sm" />
                <span>Loading more entries...</span>
              </div>
            ) : hasMore ? (
              <button
                type="button"
                className="infinite-load-more-btn"
                onClick={loadMoreItems}
              >
                <span>Load More ({data.length - visibleCount} remaining)</span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-semibold">
                <CheckCircle2 size={14} className="text-[#10B981]" />
                <span>All {data.length} records loaded</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
