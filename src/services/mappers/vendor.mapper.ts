import type { Vendor, RawVendorDTO, VendorStatus } from '../../types/vendor.types';

const OVERRIDES_STORAGE_KEY = 'digilocal_vendor_status_overrides';
const EDITS_STORAGE_KEY = 'digilocal_vendor_edit_overrides';

export const getVendorStatusOverrides = (): Record<string, VendorStatus> => {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const setVendorStatusOverride = (vendorId: string, status: VendorStatus) => {
  try {
    const overrides = getVendorStatusOverrides();
    overrides[vendorId] = status;
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {}
};

export const getVendorEditOverrides = (): Record<string, Partial<Vendor>> => {
  try {
    const raw = localStorage.getItem(EDITS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const saveVendorEditOverride = (vendorId: string, fields: Partial<Vendor>) => {
  try {
    const edits = getVendorEditOverrides();
    edits[vendorId] = { ...(edits[vendorId] || {}), ...fields };
    localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(edits));
  } catch {}
};

export const mapVendorDTOToDomain = (raw: any): Vendor => {
  const vId = raw.vendor_id || raw.id || '1';
  const statusLower = String(raw.status || 'ACTIVE').toLowerCase();

  let normalizedStatus: VendorStatus = 'active';

  if (statusLower === 'suspended' || statusLower === 'blocked' || statusLower === 'inactive') {
    normalizedStatus = 'suspended';
  } else if (statusLower === 'pending' || statusLower === 'onboarding') {
    normalizedStatus = 'pending';
  } else if (statusLower === 'on_hold' || statusLower === 'hold' || statusLower === 'onhold') {
    normalizedStatus = 'on_hold';
  } else if (statusLower === 'rejected' || statusLower === 'declined') {
    normalizedStatus = 'rejected';
  } else if (statusLower === 'expired') {
    normalizedStatus = 'expired';
  } else {
    normalizedStatus = 'active';
  }

  // Check persistent admin status overrides
  const overrides = getVendorStatusOverrides();
  if (overrides[String(vId)]) {
    normalizedStatus = overrides[String(vId)];
  }

  const ordersCount = Number(raw.total_orders ?? raw.total_orders_count ?? raw.totalOrdersCount ?? raw.totalOrders ?? 0);
  const earnings = Number(raw.total_revenue ?? raw.total_earnings ?? raw.totalEarnings ?? 0);
  const phone = raw.phone_number || raw.phone || '';
  const formattedPhone = phone ? (phone.startsWith('+91') ? phone : `+91 ${phone}`) : 'N/A';

  const createdAtIso = raw.vendor_created_at || raw.created_at || raw.createdAt || new Date().toISOString();
  const submissionTimestamp = raw.submission_timestamp || raw.submissionTimestamp || createdAtIso;

  const rawGstin = raw.gstin || raw.gst_number || raw.gstin_number || '';
  const rawPan = raw.pan_number || raw.panNumber || raw.pan || '';
  const rawFssai = raw.fssai_number || raw.fssaiNumber || raw.fssai || '';
  const rawStoreName = raw.shop_name || raw.store_name || raw.shopName || raw.storeName || raw.vendor_name || raw.name || 'Vendor Store';
  const rawOwnerName = raw.vendor_name || raw.owner_name || raw.vendorName || raw.ownerName || raw.name || 'Vendor Owner';
  
  const shopNumber = raw.shop_number || raw.shopNumber || '';
  const area = raw.area || raw.location_area || raw.locationArea || raw.society_name || raw.societyName || '';
  const city = raw.city || '';
  const state = raw.state || '';
  const pincode = raw.pincode || '';

  const constructedAddress = [shopNumber, area, city, state, pincode].filter(Boolean).join(', ');
  const rawAddress = constructedAddress || raw.location || raw.address || raw.full_address || raw.street_address || '';
  const rawLocationArea = area || raw.location_area || raw.locationArea || raw.society_name || raw.societyName || '';
  const rawSocietyName = raw.society_name || raw.societyName || area || raw.location_name || '';

  const avatarUrl =
    raw.shop_image ||
    raw.shopImage ||
    raw.logo ||
    raw.avatar_url ||
    raw.avatarUrl ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';

  const createdAtReadable = raw.created_at_readable || raw.createdAtReadable || undefined;
  const createdAtTime = raw.created_at_time || raw.createdAtTime || undefined;
  const resubmittedAtReadable = raw.resubmitted_at_readable || raw.resubmittedAtReadable || undefined;

  // Dynamically map resubmitted field changes if present from backend
  let resubmittedChanges = raw.resubmitted_changes || raw.resubmittedChanges || undefined;
  if (!resubmittedChanges && (raw.has_resubmitted || raw.hasResubmitted || raw.hasVendorUpdate)) {
    const updatedKeys = raw.updated_fields || raw.updatedFieldKeys || ['gstin', 'storeName', 'address'];
    resubmittedChanges = [];
    if (updatedKeys.includes('gstin') && rawGstin) {
      resubmittedChanges.push({ field: 'gstin', label: '1. GSTIN Tax Code', oldValue: raw.old_gstin || 'Previous Registration Code', newValue: rawGstin });
    }
    if (updatedKeys.includes('storeName') && rawStoreName) {
      resubmittedChanges.push({ field: 'storeName', label: '4. Business / Store Name', oldValue: raw.old_store_name || 'Previous Store Name', newValue: rawStoreName });
    }
    if (updatedKeys.includes('address') && rawAddress) {
      resubmittedChanges.push({ field: 'address', label: '5. Complete Detailed Address', oldValue: raw.old_address || 'Previous Registered Address', newValue: rawAddress });
    }
    if (updatedKeys.includes('panNumber') && rawPan) {
      resubmittedChanges.push({ field: 'panNumber', label: '2. PAN Card Number', oldValue: raw.old_pan || 'Previous PAN', newValue: rawPan });
    }
  }

  return {
    id: String(vId),
    storeName: rawStoreName,
    ownerName: rawOwnerName,
    category: raw.category || raw.store_category || 'General Store & Provisions',
    vendorType: raw.vendor_type || raw.vendorType || 'product',
    email: raw.email || '',
    phone: formattedPhone,
    address: rawAddress,
    shopNumber,
    area,
    city,
    state,
    pincode,
    locationArea: rawLocationArea,
    societyName: rawSocietyName,
    societyId: raw.society_id !== undefined && raw.society_id !== null ? String(raw.society_id) : (raw.societyId ? String(raw.societyId) : undefined),
    gstin: rawGstin,
    panNumber: rawPan,
    fssaiNumber: rawFssai,
    submissionTimestamp: createdAtReadable || submissionTimestamp,
    createdAtReadable,
    createdAtTime,
    holdEmailSubject: raw.hold_email_subject || raw.holdEmailSubject || undefined,
    holdReason: raw.hold_reason || raw.holdReason || undefined,
    holdTimestamp: raw.hold_timestamp || raw.holdTimestamp || undefined,
    hasResubmitted: (raw.is_update_viewed || raw.isUpdateViewed) ? false : Boolean(raw.has_resubmitted ?? raw.hasResubmitted ?? (normalizedStatus === 'on_hold' && raw.hasVendorUpdate)),
    isUpdateViewed: Boolean(raw.is_update_viewed ?? raw.isUpdateViewed ?? false),
    resubmittedAt: raw.resubmitted_at || raw.resubmittedAt || raw.vendorUpdateTimestamp || null,
    resubmittedAtReadable,
    resubmittedChanges,
    updatedFieldKeys: raw.updated_fields || raw.updatedFieldKeys || (
      (raw.has_resubmitted || raw.hasResubmitted || raw.hasVendorUpdate) ? ['gstin', 'storeName', 'address'] : []
    ),
    rejectionReason: raw.rejection_reason || raw.rejectionReason || undefined,
    rejectionTimestamp: raw.rejection_timestamp || raw.rejectionTimestamp || undefined,
    documents: raw.documents || [],
    subscriptionTier: (raw.subscription_tier || raw.subscriptionTier || 'pro') as any,
    subscriptionRenewalDate: raw.renewal_date || raw.subscriptionRenewalDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    status: normalizedStatus,
    totalEarnings: earnings,
    totalOrdersCount: ordersCount,
    avatarUrl,
    payments: raw.payments || [],
    createdAt: createdAtIso,
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };

  return domainVendor;
};
