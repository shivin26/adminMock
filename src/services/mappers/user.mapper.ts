import type { UserProfile } from '../../types/user.types';
import type { PersonProfile } from '../../types/people.types';

export const mapUserDTOToDomain = (raw: any): UserProfile & PersonProfile => {
  const pType = raw.person_type || raw.personType || (raw.role === 'vendor' ? 'user_vendor' : 'user');
  const statusLower = String(raw.status || 'active').toLowerCase();
  
  let status: 'active' | 'warned' | 'suspended' | 'banned' = 'active';
  if (statusLower === 'suspended' || statusLower === 'banned' || statusLower === 'blocked') {
    status = 'banned';
  } else if (statusLower === 'warned') {
    status = 'warned';
  } else {
    status = 'active';
  }

  const name = raw.name || raw.user_name || raw.userName || 'User Profile';
  const email = raw.email || 'user@digilocal.in';
  const phone = raw.phone || raw.phone_number || raw.phoneNumber || '+91 98765 43210';
  const societyName = raw.society_name || raw.societyName || raw.society || 'Anupam Society';
  const flatNumber = raw.flat_number || raw.flatNumber || raw.flat || 'A-101';
  const storeName = raw.store_name || raw.storeName || undefined;
  const category = raw.store_category || raw.category || undefined;
  const rating = raw.store_rating || raw.rating || undefined;
  const flagsCount = Number(raw.flags_count ?? raw.flagsCount ?? 0);
  const totalOrders = Number(raw.total_orders_count ?? raw.totalOrdersCount ?? raw.total_orders ?? raw.totalOrders ?? 0);
  const totalSpend = Number(raw.total_spend ?? raw.totalSpend ?? 0);
  const totalComplaints = Number(raw.total_complaints_count ?? raw.totalComplaintsCount ?? raw.total_complaints ?? raw.totalComplaintsRaised ?? 0);
  const createdAt = raw.created_at || raw.createdAt || raw.registered_at || raw.registeredAt || raw.registration_date || new Date().toISOString();
  const lastActive = raw.last_active_at || raw.lastActiveAt || raw.lastActive || createdAt;

  return {
    id: String(raw.id || raw.user_id || raw.userId || `usr-${Date.now()}`),
    name,
    email,
    phone,
    personType: pType === 'user_vendor' ? 'user_vendor' : 'user',
    status,
    societyName,
    flatNumber,
    storeName,
    category,
    rating,
    flagsCount,
    totalOrders,
    totalOrdersCount: totalOrders,
    totalSpend,
    totalComplaintsRaised: totalComplaints,
    totalComplaintsCount: totalComplaints,
    createdAt,
    lastActive,
    lastActiveAt: lastActive,
  };
};
