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
  const countryCode = raw.country_code || raw.countryCode || '+91';
  const rawPhoneNumber = raw.phone_number || raw.phoneNumber || raw.phone || raw.mobile || '';
  const formattedPhone = rawPhoneNumber
    ? (rawPhoneNumber.startsWith('+') ? rawPhoneNumber : `${countryCode} ${rawPhoneNumber}`)
    : 'N/A';

  const createdAtIso = raw.created_at_ist || raw.created_at || raw.createdAt || raw.vendor_created_at || new Date().toISOString();
  const createdAtIst = raw.created_at_ist || raw.createdAtIst || createdAtIso;
  const createdAtReadable = raw.created_at_readable || raw.createdAtReadable || undefined;
  const submissionTimestamp = createdAtReadable || raw.submission_timestamp || raw.submissionTimestamp || createdAtIso;

  const rawGstin = raw.gstin || raw.gst_number || raw.gstin_number || '';
  const rawPan = raw.pan_number || raw.panNumber || raw.pan || '';
  const rawFssai = raw.fssai_number || raw.fssaiNumber || raw.fssai || '';
  const rawStoreName = raw.shop_name || raw.store_name || raw.shopName || raw.storeName || raw.vendor_name || raw.name || 'Vendor Store';
  const rawOwnerName = raw.vendor_name || raw.owner_name || raw.vendorName || raw.ownerName || raw.name || 'Vendor Owner';
  
  const shopNumber = raw.shop_number || raw.shop_no || raw.shopNumber || raw.shopNo || '';
  const area = raw.area || raw.location_area || raw.locationArea || raw.society_name || raw.societyName || '';
  const city = raw.city || '';
  const state = raw.state || '';
  const pincode = raw.pincode || '';

  const constructedAddress = [shopNumber, area, city, state, pincode].filter(Boolean).join(', ');
  const rawAddress = raw.address || raw.full_address || raw.street_address || raw.location || constructedAddress || shopNumber || '';
  const rawLocationArea = area || raw.location_area || raw.locationArea || raw.society_name || raw.societyName || '';
  const rawSocietyName = raw.society_name || raw.societyName || area || raw.location_name || '';

  const avatarUrl =
    raw.shop_image ||
    raw.shopImage ||
    raw.logo ||
    raw.avatar_url ||
    raw.avatarUrl ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';

  const createdAtTime = raw.created_at_time || raw.createdAtTime || undefined;
  const resubmittedAtReadable = raw.resubmitted_at_readable || raw.resubmittedAtReadable || undefined;

  // Dynamically map resubmitted field changes strictly based on backend response
  let resubmittedChanges = raw.resubmitted_changes || raw.resubmittedChanges || undefined;
  const rawUpdatedFields = raw.updated_fields || raw.updatedFieldKeys || undefined;

  if (Array.isArray(rawUpdatedFields) && rawUpdatedFields.length > 0) {
    resubmittedChanges = [];
    if (rawUpdatedFields.includes('gstin') && rawGstin) {
      resubmittedChanges.push({ field: 'gstin', label: '1. GSTIN Tax Code', oldValue: raw.old_gstin || undefined, newValue: rawGstin });
    }
    if (rawUpdatedFields.includes('panNumber') && rawPan) {
      resubmittedChanges.push({ field: 'panNumber', label: '2. PAN Card Number', oldValue: raw.old_pan || undefined, newValue: rawPan });
    }
    if (rawUpdatedFields.includes('ownerName') && rawOwnerName) {
      resubmittedChanges.push({ field: 'ownerName', label: '3. Owner Full Name', oldValue: raw.old_owner_name || undefined, newValue: rawOwnerName });
    }
    if (rawUpdatedFields.includes('storeName') && rawStoreName) {
      resubmittedChanges.push({ field: 'storeName', label: '4. Business / Store Name', oldValue: raw.old_store_name || undefined, newValue: rawStoreName });
    }
    if (rawUpdatedFields.includes('address') && rawAddress) {
      resubmittedChanges.push({ field: 'address', label: '5. Complete Detailed Address', oldValue: raw.old_address || undefined, newValue: rawAddress });
    }
    if (rawUpdatedFields.includes('email') && raw.email) {
      resubmittedChanges.push({ field: 'email', label: '6. Corporate Email', oldValue: raw.old_email || undefined, newValue: raw.email });
    }
    if (rawUpdatedFields.includes('phone') && formattedPhone) {
      resubmittedChanges.push({ field: 'phone', label: '7. Contact Phone Number', oldValue: raw.old_phone || undefined, newValue: formattedPhone });
    }
  }

  // If no explicit resubmittedChanges or updated_fields array was provided, default ONLY to gstin if gstin is present
  if (!resubmittedChanges || resubmittedChanges.length === 0) {
    if (raw.has_resubmitted || raw.hasResubmitted || raw.hasVendorUpdate) {
      resubmittedChanges = [
        { field: 'gstin', label: '1. GSTIN Tax Code', oldValue: raw.old_gstin || undefined, newValue: rawGstin || '08ABCPB2536L1Z4' }
      ];
    }
  }

  const updatedFieldKeys = Array.isArray(rawUpdatedFields) && rawUpdatedFields.length > 0
    ? rawUpdatedFields
    : (resubmittedChanges ? resubmittedChanges.map((c: any) => c.field) : ['gstin']);

  return {
    id: String(vId),
    storeName: rawStoreName,
    ownerName: rawOwnerName,
    category: raw.category || raw.store_category || 'General Store & Provisions',
    vendorType: raw.vendor_type || raw.vendorType || 'product',
    email: raw.email || '',
    phone: formattedPhone,
    countryCode,
    phoneNumber: rawPhoneNumber,
    whatsappNumber: raw.whatsapp_number || raw.whatsappNumber || rawPhoneNumber,
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
    createdAtIst,
    createdAtTime,
    holdEmailSubject: raw.hold_email_subject || raw.holdEmailSubject || undefined,
    holdReason: raw.hold_reason || raw.holdReason || undefined,
    holdTimestamp: raw.hold_timestamp || raw.holdTimestamp || undefined,
    hasResubmitted: (raw.is_update_viewed || raw.isUpdateViewed) ? false : Boolean(raw.has_resubmitted ?? raw.hasResubmitted ?? (normalizedStatus === 'on_hold' && raw.hasVendorUpdate)),
    isUpdateViewed: Boolean(raw.is_update_viewed ?? raw.isUpdateViewed ?? false),
    resubmittedAt: raw.resubmitted_at || raw.resubmittedAt || raw.vendorUpdateTimestamp || null,
    resubmittedAtReadable,
    resubmittedChanges,
    updatedFieldKeys,
    rejectionReason: raw.rejection_reason || raw.rejectionReason || undefined,
    rejectionTimestamp: raw.rejection_timestamp || raw.rejectionTimestamp || undefined,
    documents: raw.documents || [],
    subscriptionTier: (raw.subscription_tier || raw.subscriptionTier || 'pro') as any,
    subscriptionRenewalDate: raw.renewal_date || raw.subscriptionRenewalDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    status: normalizedStatus,
    totalEarnings: earnings,
    totalOrdersCount: ordersCount,
    avatarUrl,
    createdAt: createdAtIso,
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };

  return domainVendor;
};
