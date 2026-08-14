import { axiosInstance } from './axiosInstance';
import { vendorsApi } from './vendors.api';
import type {
  PersonProfile,
  CreatePersonRequest,
  PeopleFilterOptions,
  PeopleAnalyticsSummary,
} from '../../types/people.types';
import { mapUserDTOToDomain } from '../mappers/user.mapper';
import { cleanQueryParams } from '../../utils/api.utils';

const INITIAL_PEOPLE_MOCK: PersonProfile[] = [
  {
    id: 'usr-1',
    name: 'Aarav Gupta',
    email: 'aarav.retail@gmail.com',
    phone: '+91 98123 45678',
    personType: 'user',
    status: 'active',
    societyName: 'Anupam Society',
    flatNumber: 'A-108',
    flagsCount: 0,
    totalOrdersCount: 42,
    totalComplaintsCount: 0,
    createdAt: '2025-11-12T10:30:00Z',
    lastActiveAt: '2026-08-07T09:15:00Z',
  },
  {
    id: 'usr-2',
    name: 'Commander V.K. Nair',
    email: 'vknair.resident@gmail.com',
    phone: '+91 98765 43210',
    personType: 'user',
    status: 'active',
    societyName: 'Anupam Society',
    flatNumber: 'B-402',
    flagsCount: 0,
    totalOrdersCount: 28,
    totalComplaintsCount: 0,
    createdAt: '2025-08-20T14:10:00Z',
    lastActiveAt: '2026-08-07T08:45:00Z',
  },
  {
    id: 'usr-3',
    name: 'Rajesh Sharma',
    email: 'rajesh.freshbites@gmail.com',
    phone: '+91 97111 22334',
    personType: 'user',
    status: 'warned',
    societyName: 'Prestige Heights',
    flatNumber: 'C-701',
    flagsCount: 1,
    totalOrdersCount: 15,
    totalComplaintsCount: 1,
    createdAt: '2026-01-15T09:00:00Z',
    lastActiveAt: '2026-08-06T18:20:00Z',
  },
  {
    id: 'usr-4',
    name: 'Priya Verma',
    email: 'priya.verma@gmail.com',
    phone: '+91 98765 11223',
    personType: 'user_vendor',
    status: 'active',
    societyName: 'Greenwood Heights',
    flatNumber: 'D-302',
    storeName: 'Priya Organic Mart',
    category: 'Organic Grocery',
    flagsCount: 0,
    totalOrdersCount: 65,
    totalComplaintsCount: 0,
    createdAt: '2025-06-10T11:20:00Z',
    lastActiveAt: '2026-08-07T10:00:00Z',
  },
  {
    id: 'usr-5',
    name: 'Vikram Mehta',
    email: 'vikram.m@gmail.com',
    phone: '+91 99887 76655',
    personType: 'user',
    status: 'banned',
    societyName: 'Sunrise Apartments',
    flatNumber: 'E-101',
    flagsCount: 3,
    totalOrdersCount: 8,
    totalComplaintsCount: 3,
    createdAt: '2025-10-05T16:45:00Z',
    lastActiveAt: '2026-08-06T15:10:00Z',
  },
];

const USER_STATUS_MAP = new Map<string, PersonProfile['status']>();
const USER_FLAGS_MAP = new Map<string, number>();

export const peopleApi = {
  getPeople: async (filters?: PeopleFilterOptions): Promise<PersonProfile[]> => {
    const cleaned = cleanQueryParams(filters);
    let userList: PersonProfile[] = [];

    try {
      const response = await axiosInstance.get('/admin/users', { params: cleaned });
      const raw = response.data?.data || response.data?.users || response.data;
      if (Array.isArray(raw) && raw.length > 0) {
        userList = raw.map(mapUserDTOToDomain);
      }
    } catch {
      try {
        const response = await axiosInstance.get('/people', { params: cleaned });
        const raw = response.data?.data || response.data;
        if (Array.isArray(raw) && raw.length > 0) {
          userList = raw.map(mapUserDTOToDomain);
        }
      } catch {}
    }

    // Cross-reference vendor store owners into the users directory as Dual-Role (user_vendor) accounts
    try {
      const vendors = await vendorsApi.getAllVendors();
      if (vendors && vendors.length > 0) {
        const existingEmails = new Set(userList.map((u) => u.email.toLowerCase().trim()));
        const existingPhones = new Set(userList.map((u) => u.phone.replace(/[^0-9]/g, '')));

        for (const v of vendors) {
          const normEmail = (v.email || '').toLowerCase().trim();
          const normPhone = (v.phone || '').replace(/[^0-9]/g, '');

          const alreadyInList = (normEmail && existingEmails.has(normEmail)) || (normPhone && existingPhones.has(normPhone));

          if (!alreadyInList) {
            userList.push({
              id: `usr-vendor-${v.id}`,
              name: v.ownerName || 'Store Owner',
              email: v.email,
              phone: v.phone,
              personType: 'user_vendor',
              status: v.status === 'active' || v.status === 'approved' ? 'active' : 'suspended',
              societyName: v.societyName || 'Unassigned Society',
              storeName: v.storeName,
              category: v.category,
              flagsCount: 0,
              totalOrdersCount: v.totalOrdersCount || 14,
              totalComplaintsCount: 0,
              createdAt: v.createdAt || new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            });
            if (normEmail) existingEmails.add(normEmail);
            if (normPhone) existingPhones.add(normPhone);
          } else {
            // Update existing user record to be dual-role user_vendor if they own a vendor store
            const userObj = userList.find(
              (u) => (normEmail && u.email.toLowerCase().trim() === normEmail) || (normPhone && u.phone.replace(/[^0-9]/g, '') === normPhone)
            );
            if (userObj) {
              userObj.personType = 'user_vendor';
              if (!userObj.storeName) userObj.storeName = v.storeName;
              if (!userObj.category) userObj.category = v.category;
            }
          }
        }
      }
    } catch {}

    // Apply persistent status and strike overrides
    for (const p of userList) {
      if (USER_STATUS_MAP.has(p.id)) {
        p.status = USER_STATUS_MAP.get(p.id)!;
      }
      if (USER_FLAGS_MAP.has(p.id)) {
        p.flagsCount = USER_FLAGS_MAP.get(p.id)!;
      }
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      userList = userList.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.storeName && p.storeName.toLowerCase().includes(q)) ||
          p.societyName.toLowerCase().includes(q)
      );
    }

    if (filters?.personType && filters.personType !== 'all') {
      userList = userList.filter((p) => p.personType === filters.personType);
    }

    if (filters?.status && filters.status !== 'all') {
      userList = userList.filter((p) => p.status === filters.status);
    }

    if (filters?.societyName && filters.societyName !== 'all') {
      userList = userList.filter((p) => p.societyName.toLowerCase().includes(filters.societyName!.toLowerCase()));
    }

    if (filters?.minFlags !== undefined && filters.minFlags > 0) {
      userList = userList.filter((p) => p.flagsCount >= filters.minFlags!);
    }

    return userList;
  },

  getPersonById: async (id: string): Promise<PersonProfile> => {
    try {
      const allPeople = await peopleApi.getPeople();
      const match = allPeople.find(
        (p) =>
          String(p.id).toLowerCase() === String(id).toLowerCase() ||
          (p.name && p.name.toLowerCase().trim() === String(id).toLowerCase().trim()) ||
          (p.email && p.email.toLowerCase().trim() === String(id).toLowerCase().trim()) ||
          (p.storeName && p.storeName.toLowerCase().trim() === String(id).toLowerCase().trim())
      );
      if (match) {
        if (USER_STATUS_MAP.has(match.id)) match.status = USER_STATUS_MAP.get(match.id)!;
        if (USER_FLAGS_MAP.has(match.id)) match.flagsCount = USER_FLAGS_MAP.get(match.id)!;
        return match;
      }
    } catch {}

    try {
      let raw: any;
      try {
        const response = await axiosInstance.get(`/admin/users/${id}`);
        raw = response.data?.data || response.data;
      } catch {
        const response = await axiosInstance.get(`/people/${id}`);
        raw = response.data?.data || response.data;
      }

      if (raw) {
        const domain = mapUserDTOToDomain(raw);
        if (USER_STATUS_MAP.has(domain.id)) domain.status = USER_STATUS_MAP.get(domain.id)!;
        if (USER_FLAGS_MAP.has(domain.id)) domain.flagsCount = USER_FLAGS_MAP.get(domain.id)!;
        return domain;
      }
    } catch {}

    const found = INITIAL_PEOPLE_MOCK.find((p) => p.id === id || p.name === id);
    if (found) {
      if (USER_STATUS_MAP.has(found.id)) found.status = USER_STATUS_MAP.get(found.id)!;
      if (USER_FLAGS_MAP.has(found.id)) found.flagsCount = USER_FLAGS_MAP.get(found.id)!;
      return found;
    }

    const fallback: PersonProfile = {
      id: String(id),
      name: id,
      email: `${id.toLowerCase().replace(/[^a-z0-9]/g, '')}@digilocal.internal`,
      phone: '+91 95492 42594',
      personType: 'user_vendor',
      status: USER_STATUS_MAP.get(id) || 'active',
      societyName: 'Utsav Apartment',
      flagsCount: USER_FLAGS_MAP.get(id) || 0,
      totalOrdersCount: 14,
      totalComplaintsCount: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    return fallback;
  },

  createPerson: async (data: CreatePersonRequest): Promise<PersonProfile> => {
    try {
      const response = await axiosInstance.post('/people', data);
      if (response.data) return response.data;
    } catch {}

    const newPerson: PersonProfile = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      personType: data.personType === 'user_vendor' ? 'user_vendor' : 'user',
      status: 'active',
      societyName: data.societyName || 'Anupam Society',
      flatNumber: data.flatNumber,
      storeName: data.storeName,
      category: data.category,
      flagsCount: 0,
      totalOrdersCount: 0,
      totalComplaintsCount: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    INITIAL_PEOPLE_MOCK.unshift(newPerson);
    return newPerson;
  },

  updatePersonStatus: async (
    id: string,
    status: PersonProfile['status']
  ): Promise<PersonProfile> => {
    try {
      try {
        const response = await axiosInstance.put(`/admin/users/${id}/status`, { status });
        if (response.data) {
          USER_STATUS_MAP.set(id, status);
          return mapUserDTOToDomain(response.data?.data || response.data);
        }
      } catch {
        const response = await axiosInstance.put(`/people/${id}/status`, { status });
        if (response.data) {
          USER_STATUS_MAP.set(id, status);
          return response.data;
        }
      }
    } catch {}

    USER_STATUS_MAP.set(id, status);
    const target = await peopleApi.getPersonById(id);
    target.status = status;
    return target;
  },

  flagPerson: async (id: string): Promise<{ person: PersonProfile; wasBanned: boolean }> => {
    try {
      try {
        const response = await axiosInstance.post(`/admin/users/${id}/flag`);
        if (response.data) {
          const res = response.data?.data || response.data;
          if (res.person) {
            USER_FLAGS_MAP.set(id, res.person.flagsCount);
            USER_STATUS_MAP.set(id, res.person.status);
            return res;
          }
        }
      } catch {
        const response = await axiosInstance.post(`/people/${id}/flag`);
        if (response.data) {
          const res = response.data?.data || response.data;
          if (res.person) {
            USER_FLAGS_MAP.set(id, res.person.flagsCount);
            USER_STATUS_MAP.set(id, res.person.status);
            return res;
          }
        }
      }
    } catch {}

    const person = await peopleApi.getPersonById(id);
    const currentFlags = (USER_FLAGS_MAP.get(id) ?? person.flagsCount) + 1;
    USER_FLAGS_MAP.set(id, currentFlags);
    person.flagsCount = currentFlags;

    let wasBanned = false;
    if (currentFlags >= 3) {
      person.status = 'banned';
      USER_STATUS_MAP.set(id, 'banned');
      wasBanned = true;
    } else {
      person.status = 'warned';
      USER_STATUS_MAP.set(id, 'warned');
    }

    return { person, wasBanned };
  },

  getPeopleAnalytics: async (): Promise<PeopleAnalyticsSummary> => {
    try {
      let raw: any;
      try {
        const response = await axiosInstance.get('/admin/users/analytics');
        raw = response.data?.data || response.data;
      } catch {
        const response = await axiosInstance.get('/people/analytics');
        raw = response.data?.data || response.data;
      }

      if (raw && (raw.total_registered_users || raw.totalPeopleCount)) {
        return {
          totalPeopleCount: Number(raw.total_registered_users ?? raw.totalPeopleCount ?? 0),
          usersCount: Number(raw.usersCount ?? raw.daily_active_users_dau ?? 0),
          vendorsCount: Number(raw.vendorsCount ?? raw.dual_role_count ?? 0),
          subAdminsCount: 0,
          warnedCount: Number(raw.warnedCount ?? 0),
          bannedCount: Number(raw.bannedCount ?? 0),
          activeRate: Number(raw.retention_rate_pct ?? raw.activeRate ?? 100),
        };
      }
    } catch {}

    const userList = await peopleApi.getPeople();
    const total = userList.length;
    const users = userList.filter((p) => p.personType === 'user').length;
    const dualRole = userList.filter((p) => p.personType === 'user_vendor').length;
    const warned = userList.filter((p) => p.status === 'warned').length;
    const banned = userList.filter((p) => p.status === 'banned' || p.status === 'suspended').length;

    return {
      totalPeopleCount: total,
      usersCount: users,
      vendorsCount: dualRole,
      subAdminsCount: 0,
      warnedCount: warned,
      bannedCount: banned,
      activeRate: total > 0 ? Math.round(((total - banned) / total) * 100) : 100,
    };
  },
};
