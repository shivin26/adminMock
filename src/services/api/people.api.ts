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

const INITIAL_PEOPLE_MOCK: PersonProfile[] = [];

const LOCAL_STORAGE_FLAGS_KEY = 'digilocal_user_strikes_map';
const LOCAL_STORAGE_STATUS_KEY = 'digilocal_user_status_map';

const getStoredFlagsMap = (): Map<string, number> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FLAGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return new Map(Object.entries(parsed));
    }
  } catch {}
  return new Map();
};

const getStoredStatusMap = (): Map<string, PersonProfile['status']> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return new Map(Object.entries(parsed));
    }
  } catch {}
  return new Map();
};

export const USER_FLAGS_MAP = getStoredFlagsMap();
export const USER_STATUS_MAP = getStoredStatusMap();

export const setStoredFlag = (id: string, strikes: number) => {
  const sid = String(id);
  USER_FLAGS_MAP.set(sid, strikes);
  if (sid.includes('usr_')) {
    USER_FLAGS_MAP.set(sid.replace('usr_', ''), strikes);
  } else {
    USER_FLAGS_MAP.set(`usr_${sid}`, strikes);
  }
  try {
    const obj = Object.fromEntries(USER_FLAGS_MAP.entries());
    localStorage.setItem(LOCAL_STORAGE_FLAGS_KEY, JSON.stringify(obj));
  } catch {}
};

export const setStoredStatus = (id: string, status: PersonProfile['status']) => {
  const sid = String(id);
  USER_STATUS_MAP.set(sid, status);
  if (sid.includes('usr_')) {
    USER_STATUS_MAP.set(sid.replace('usr_', ''), status);
  } else {
    USER_STATUS_MAP.set(`usr_${sid}`, status);
  }
  try {
    const obj = Object.fromEntries(USER_STATUS_MAP.entries());
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, JSON.stringify(obj));
  } catch {}
};

export const peopleApi = {
  getPeople: async (filters?: PeopleFilterOptions): Promise<PersonProfile[]> => {
    const cleaned = cleanQueryParams(filters);
    let userList: PersonProfile[] = [];

    try {
      const response = await axiosInstance.get('/admin/users', { params: cleaned });
      const raw = response.data?.data || response.data?.users || response.data;
      if (Array.isArray(raw)) {
        userList = raw.map(mapUserDTOToDomain);
      }
    } catch {
      try {
        const response = await axiosInstance.get('/people', { params: cleaned });
        const raw = response.data?.data || response.data;
        if (Array.isArray(raw)) {
          userList = raw.map(mapUserDTOToDomain);
        }
      } catch {}
    }

    // Apply persistent status and strike overrides
    for (const p of userList) {
      if (USER_FLAGS_MAP.has(p.id)) {
        const s = USER_FLAGS_MAP.get(p.id)!;
        p.flagsCount = Math.max(p.flagsCount || 0, s);
        p.strikes = Math.max(p.strikes || 0, s);
      }
      if (USER_STATUS_MAP.has(p.id)) {
        const st = USER_STATUS_MAP.get(p.id)!;
        if (st === 'banned' || st === 'blocked') {
          p.status = 'banned';
          p.isBlocked = true;
          p.isAutoBanned = true;
        }
      }
      if ((p.strikes !== undefined && p.strikes >= 3) || p.flagsCount >= 3) {
        p.status = 'banned';
        p.isBlocked = true;
        p.isAutoBanned = true;
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
      let raw: any;
      try {
        const response = await axiosInstance.get(`/admin/users/${id}`);
        raw = response.data?.data || response.data;
      } catch {
        const response = await axiosInstance.get(`/people/${id}`);
        raw = response.data?.data || response.data;
      }

      if (raw && (raw.id || raw.user_id || raw.name)) {
        const domain = mapUserDTOToDomain(raw);
        if (USER_FLAGS_MAP.has(domain.id)) {
          const s = USER_FLAGS_MAP.get(domain.id)!;
          domain.flagsCount = Math.max(domain.flagsCount || 0, s);
          domain.strikes = Math.max(domain.strikes || 0, s);
        }
        if (USER_STATUS_MAP.has(domain.id)) {
          const st = USER_STATUS_MAP.get(domain.id)!;
          if (st === 'banned' || st === 'blocked') {
            domain.status = 'banned';
            domain.isBlocked = true;
            domain.isAutoBanned = true;
          }
        }
        if ((domain.strikes !== undefined && domain.strikes >= 3) || domain.flagsCount >= 3) {
          domain.status = 'banned';
          domain.isBlocked = true;
          domain.isAutoBanned = true;
        }
        return domain;
      }
    } catch {}

    try {
      const allPeople = await peopleApi.getPeople();
      const q = String(id).toLowerCase().trim();
      const match = allPeople.find(
        (p) =>
          String(p.id).toLowerCase() === q ||
          (p.name && p.name.toLowerCase().trim() === q) ||
          (p.name && p.name.toLowerCase().trim().includes(q)) ||
          (p.email && p.email.toLowerCase().trim() === q) ||
          (p.storeName && p.storeName.toLowerCase().trim() === q)
      );
      if (match) {
        if (USER_STATUS_MAP.has(match.id)) match.status = USER_STATUS_MAP.get(match.id)!;
        if (USER_FLAGS_MAP.has(match.id)) match.flagsCount = USER_FLAGS_MAP.get(match.id)!;
        return match;
      }
    } catch {}

    throw new Error(`Person/User with ID ${id} not found.`);
  },

  createPerson: async (data: CreatePersonRequest): Promise<PersonProfile> => {
    try {
      const response = await axiosInstance.post('/people', data);
      if (response.data) {
        return mapUserDTOToDomain(response.data?.data || response.data);
      }
    } catch {}

    const newPerson: PersonProfile = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      personType: data.personType === 'user_vendor' ? 'user_vendor' : 'user',
      status: 'active',
      societyName: data.societyName || 'Greenwood Residency',
      flatNumber: data.flatNumber || 'Flat 101',
      storeName: data.storeName,
      category: data.category,
      flagsCount: 0,
      strikes: 0,
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

  flagPerson: async (id: string, reason?: string): Promise<{ person: PersonProfile; wasBanned: boolean; message?: string }> => {
    try {
      let responseData: any;
      try {
        const response = await axiosInstance.post(`/admin/users/${id}/strike`, { reason: reason || 'Policy violation / moderation strike' });
        responseData = response.data;
      } catch {
        try {
          const response = await axiosInstance.post(`/people/${id}/strike`, { reason: reason || 'Policy violation / moderation strike' });
          responseData = response.data;
        } catch {
          const response = await axiosInstance.post(`/admin/users/${id}/flag`, { reason: reason || 'Policy violation / moderation strike' });
          responseData = response.data;
        }
      }

      if (responseData) {
        const rawObj = responseData?.data || responseData?.person || responseData;
        const msg = responseData.message || responseData.status || '';
        
        const prevCount = USER_FLAGS_MAP.get(id) ?? 0;
        const backendStrikes = rawObj.strikes ?? responseData.strikes ?? rawObj.flags_count ?? rawObj.flagsCount;
        const strikesCount = backendStrikes !== undefined ? Number(backendStrikes) : prevCount + 1;
        
        const isBlocked = Boolean(
          rawObj.is_blocked ||
          rawObj.is_auto_banned ||
          responseData.is_blocked ||
          responseData.is_auto_banned ||
          rawObj.status === 'blocked' ||
          rawObj.status === 'banned' ||
          strikesCount >= 3
        );
        
        setStoredFlag(id, strikesCount);
        setStoredStatus(id, isBlocked ? 'banned' : (strikesCount > 0 ? 'warned' : 'active'));

        const domainPerson = mapUserDTOToDomain(rawObj);
        domainPerson.flagsCount = strikesCount;
        domainPerson.strikes = strikesCount;
        domainPerson.status = isBlocked ? 'banned' : (strikesCount > 0 ? 'warned' : 'active');
        domainPerson.isBlocked = isBlocked;
        domainPerson.isAutoBanned = isBlocked;

        return { person: domainPerson, wasBanned: isBlocked, message: msg };
      }
    } catch {}

    const person = await peopleApi.getPersonById(id);
    const currentFlags = (USER_FLAGS_MAP.get(id) ?? person.flagsCount ?? person.strikes ?? 0) + 1;
    setStoredFlag(id, currentFlags);
    person.flagsCount = currentFlags;
    person.strikes = currentFlags;

    let wasBanned = false;
    if (currentFlags >= 3) {
      person.status = 'banned';
      person.isBlocked = true;
      person.isAutoBanned = true;
      setStoredStatus(id, 'banned');
      wasBanned = true;
    } else {
      person.status = 'warned';
      setStoredStatus(id, 'warned');
    }

    return {
      person,
      wasBanned,
      message: wasBanned
        ? `Strike #${currentFlags} issued to user "${person.name}". Account has reached 3 strikes and is AUTOMATICALLY BANNED / BLOCKED!`
        : `Strike #${currentFlags} issued to user "${person.name}". (${3 - currentFlags} strikes remaining before automatic ban).`
    };
  },

  resetStrikes: async (id: string): Promise<PersonProfile> => {
    try {
      let responseData: any;
      try {
        const response = await axiosInstance.delete(`/admin/users/${id}/strike`);
        responseData = response.data;
      } catch {
        try {
          const response = await axiosInstance.post(`/people/${id}/unstrike`, { reset_all: true });
          responseData = response.data;
        } catch {
          const response = await axiosInstance.delete(`/people/${id}/strike`);
          responseData = response.data;
        }
      }

      setStoredFlag(id, 0);
      setStoredStatus(id, 'active');

      if (responseData) {
        const rawObj = responseData?.data || responseData;
        const domainPerson = mapUserDTOToDomain(rawObj);
        domainPerson.flagsCount = 0;
        domainPerson.strikes = 0;
        domainPerson.status = 'active';
        domainPerson.isBlocked = false;
        domainPerson.isAutoBanned = false;
        return domainPerson;
      }
    } catch {}

    setStoredFlag(id, 0);
    setStoredStatus(id, 'active');
    const person = await peopleApi.getPersonById(id);
    person.flagsCount = 0;
    person.strikes = 0;
    person.status = 'active';
    person.isBlocked = false;
    person.isAutoBanned = false;
    return person;
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
