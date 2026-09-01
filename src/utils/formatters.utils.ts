export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseISTDate = (dateStr?: string | number | Date): Date => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'number') return new Date(dateStr);
  let str = String(dateStr).trim();

  // Normalize space separator to T (e.g. "2026-09-01 17:45:00")
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(str)) {
    str = str.replace(/\s+/, 'T');
  }

  // If ISO string lacks timezone suffix (Z, +05:30, -05:00), append +05:30 explicitly
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(str)) {
    str = str + '+05:30';
  }

  return new Date(str);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  if (typeof dateString === 'string' && dateString.includes('IST')) return dateString;
  try {
    const d = parseISTDate(dateString);
    if (isNaN(d.getTime())) return dateString;
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).formatToParts(d);

    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = (parts.find((p) => p.type === 'month')?.value || '').slice(0, 3);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = parseISTDate(dateString);
    if (isNaN(d.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(d);

    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value || '').toLowerCase();
    return `${hour}:${minute} ${dayPeriod}`;
  } catch {
    return '';
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  if (typeof dateString === 'string' && dateString.includes('IST')) return dateString;
  try {
    const d = parseISTDate(dateString);
    if (isNaN(d.getTime())) return dateString;
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(d);

    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = (parts.find((p) => p.type === 'month')?.value || '').slice(0, 3);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value || '').toLowerCase();

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod} IST`;
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
