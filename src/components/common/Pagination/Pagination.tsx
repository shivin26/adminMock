import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  pageSize?: number;
  onPageSizeChange?: (newSize: number) => void;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  return (
    <div className="pagination-bar-container">
      {totalItems !== undefined && (
        <span className="pagination-item-count">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </span>
      )}

      <div className="pagination-controls">
        {onPageSizeChange && (
          <select
            className="pagination-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}

        <button
          className="pagination-nav-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="pagination-page-indicator">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="pagination-nav-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
