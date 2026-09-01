import type { UserProfile } from '../../types/user.types';
import type { PersonProfile } from '../../types/people.types';

const USER_EDITS_STORAGE_KEY = 'digilocal_user_edit_overrides';

export const getUserEditOverrides = (): Record<string, Partial<UserProfile & PersonProfile>> => {
  try {
    const raw = localStorage.getItem(USER_EDITS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const saveUserEditOverride = (userId: string, fields: Partial<UserProfile & PersonProfile>) => {
  try {
    const edits = getUserEditOverrides();
    edits[userId] = { ...(edits[userId] || {}), ...fields };
    localStorage.setItem(USER_EDITS_STORAGE_KEY, JSON.stringify(edits));
  } catch {}
};

export const getLocalStorageStrikesForUser = (raw: any): number => {
  const direct = raw.strikes ?? raw.flags_count ?? raw.flagsCount;
  let baseCount = direct !== undefined && direct !== null ? Number(direct) : 0;

  try {
    const rawMap = localStorage.getItem('digilocal_user_strikes_map');
    if (rawMap) {
      const parsed = JSON.parse(rawMap);
      const rawId = String(raw.id || raw.user_id || raw.userId || '');
      const altId1 = rawId.replace('usr_', '');
      const altId2 = `usr_${rawId}`;
      const emailKey = raw.email ? String(raw.email).toLowerCase() : '';
      
      const found = parsed[rawId] ?? parsed[altId1] ?? parsed[altId2] ?? (emailKey ? parsed[emailKey] : undefined);
      if (found !== undefined && found !== null) {
        return Math.max(baseCount, Number(found));
      }
    }
  } catch {}

  return baseCount;
};

export const mapUserDTOToDomain = (raw: any): UserProfile & PersonProfile => {
  const pType = raw.person_type || raw.personType || (raw.role === 'vendor' ? 'user_vendor' : 'user');
  const statusLower = String(raw.status || 'active').toLowerCase();
  const strikesCount = getLocalStorageStrikesForUser(raw);
  const isBlocked = Boolean(raw.is_blocked || raw.isBlocked || raw.is_auto_banned || raw.isAutoBanned || statusLower === 'blocked' || statusLower === 'banned' || strikesCount >= 3);
  const isAutoBanned = Boolean(raw.is_auto_banned || raw.isAutoBanned || strikesCount >= 3 || isBlocked);

  let status: 'active' | 'warned' | 'suspended' | 'banned' | 'blocked' = 'active';
  if (isBlocked || isAutoBanned || statusLower === 'suspended' || statusLower === 'banned' || statusLower === 'blocked') {
    status = 'banned';
  } else if (strikesCount > 0 || statusLower === 'warned') {
    status = 'warned';
  } else {
    status = 'active';
  }

  const name = raw.name || raw.user_name || raw.userName || 'User Profile';
  const email = raw.email || '';
  const phone = raw.phone || raw.phone_number || raw.phoneNumber || '';
  const societyName = raw.area || raw.society_name || raw.societyName || raw.society || '';
  const flatNumber = raw.flat_number || raw.flatNumber || raw.flat || '';
  const area = raw.area || raw.society_name || raw.societyName || '';
  const city = raw.city || '';
  const pincode = raw.pincode || '';

  const flatAreaAddress = [flatNumber, area, city, pincode].filter(Boolean).join(', ');
  const address = raw.address || raw.location_address || raw.location || raw.full_address || flatAreaAddress || '';

  const storeName = raw.store_name || raw.storeName || undefined;
  const category = raw.store_category || raw.category || undefined;
  const rating = raw.store_rating || raw.rating || undefined;
  const flagsCount = strikesCount;
  const totalOrders = Number(raw.total_orders_count ?? raw.totalOrdersCount ?? raw.total_orders ?? raw.totalOrders ?? 0);
  const totalSpend = Number(raw.total_spend ?? raw.totalSpend ?? 0);
  const totalComplaints = Number(raw.total_complaints_count ?? raw.totalComplaintsCount ?? raw.total_complaints ?? raw.totalComplaintsRaised ?? 0);
  const createdAt = raw.created_at || raw.createdAt || raw.registered_at || raw.registeredAt || raw.registration_date || new Date().toISOString();
  const lastActive = raw.last_active_at || raw.lastActiveAt || raw.lastActive || createdAt;
  const id = String(raw.id || raw.user_id || raw.userId || `usr-${Date.now()}`);

  const userObj = {
    id,
    name,
    email,
    phone,
    personType: pType === 'user_vendor' ? 'user_vendor' : ('user' as any),
    status,
    societyName,
    flatNumber,
    area,
    city,
    pincode,
    address,
    storeName,
    category,
    rating,
    flagsCount,
    strikes: strikesCount,
    maxStrikesAllowed: Number(raw.max_strikes_allowed ?? 3),
    isBlocked,
    isAutoBanned,
    totalOrders,
    totalOrdersCount: totalOrders,
    totalSpend,
    totalComplaintsRaised: totalComplaints,
    totalComplaintsCount: totalComplaints,
    createdAt,
    lastActive,
    lastActiveAt: lastActive,
  };

  return userObj;
};
