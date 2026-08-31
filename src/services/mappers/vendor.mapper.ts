import type { Vendor, RawVendorDTO, VendorStatus } from '../../types/vendor.types';

export const mapVendorDTOToDomain = (raw: any): Vendor => {
  const vId = raw.vendor_id || raw.id || '1';
  const statusLower = String(raw.status || 'ACTIVE').toLowerCase();

  let normalizedStatus: VendorStatus = 'active';

  if (statusLower === 'suspended' || statusLower === 'blocked' || statusLower === 'inactive') {
    normalizedStatus = 'suspended';
  } else if (statusLower === 'pending' || statusLower === 'onboarding') {
    normalizedStatus = 'pending';
  } else if (statusLower === 'expired') {
    normalizedStatus = 'expired';
  } else {
    normalizedStatus = 'active';
  }

  const ordersCount = Number(raw.total_orders ?? raw.total_orders_count ?? raw.totalOrdersCount ?? raw.totalOrders ?? 0);
  const earnings = Number(raw.total_revenue ?? raw.total_earnings ?? raw.totalEarnings ?? 0);
  const phone = raw.phone_number || raw.phone || '+91 98765 43210';
  const formattedPhone = phone.startsWith('+91') ? phone : `+91 ${phone}`;

  return {
    id: String(vId),
    storeName: raw.store_name || raw.storeName || 'Vendor Store',
    ownerName: raw.owner_name || raw.vendor_name || raw.ownerName || raw.name || 'Vendor Owner',
    category: raw.category || raw.store_category || 'Grocery & Organic Fresh',
    email: raw.email || 'vendor@digilocal.com',
    phone: formattedPhone,
    address: raw.location || raw.address || 'Block B, Sector 62',
    societyName: raw.area || raw.location_name || raw.society_name || raw.societyName || (raw.location_id ? `Location #${raw.location_id}` : 'Unassigned Area'),
    societyId: raw.society_id !== undefined && raw.society_id !== null ? String(raw.society_id) : (raw.societyId ? String(raw.societyId) : undefined),
    gstin: raw.gst_number || raw.gstin || `07AAAAA${vId}0001Z5`,
    subscriptionTier: (raw.subscription_tier || raw.subscriptionTier || 'pro') as any,
    subscriptionRenewalDate: raw.renewal_date || raw.subscriptionRenewalDate || (normalizedStatus === 'expired' ? '2026-05-15' : '2026-12-31'),
    status: normalizedStatus,
    totalEarnings: earnings,
    totalOrdersCount: ordersCount,
    avatarUrl:
      raw.logo ||
      raw.avatarUrl ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
    payments: raw.payments || [],
    createdAt: raw.vendor_created_at || raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
};
