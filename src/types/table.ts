import React from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string | React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export type SortOrder = 'asc' | 'desc' | null;

export interface TableSort {
  columnKey: string;
  order: SortOrder;
}

export interface TablePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  hidden?: (row: T) => boolean;
}
