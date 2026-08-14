export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return '';
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
};

export const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const s = status?.toLowerCase() || '';
  if (s === 'active' || s === 'success' || s === 'approved') return 'success';
  if (s === 'pending' || s === 'free') return 'warning';
  if (s === 'suspended' || s === 'failed' || s === 'inactive' || s === 'rejected' || s === 'blocked') return 'danger';
  if (s === 'expired') return 'info';
  return 'info';
};
