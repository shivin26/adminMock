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

const USER_STATUS_MAP = new Map<string, PersonProfile['status']>();
const USER_FLAGS_MAP = new Map<string, number>();

const STRIKES_STORAGE_KEY = 'digilocal_user_strikes_persistent';
const STATUS_STORAGE_KEY = 'digilocal_user_status_persistent';

export const savePersistentStrike = (userId: string, strikes: number, personObj?: Partial<PersonProfile>) => {
  try {
    const raw = localStorage.getItem(STRIKES_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};

    const uStr = String(userId).trim();
    map[uStr] = strikes;
    map[`usr_${uStr}`] = strikes;
    map[`usr_v_${uStr}`] = strikes;
    map[uStr.replace(/^usr_v_|^usr_|^user_/, '')] = strikes;

    if (personObj) {
      if (personObj.email) map[personObj.email.toLowerCase().trim()] = strikes;
      if (personObj.phone) map[personObj.phone.trim()] = strikes;
      if (personObj.name) map[personObj.name.toLowerCase().trim()] = strikes;
    }

    localStorage.setItem(STRIKES_STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

export const savePersistentStatus = (userId: string, status: PersonProfile['status'], personObj?: Partial<PersonProfile>) => {
  try {
    const raw = localStorage.getItem(STATUS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};

    const uStr = String(userId).trim();
    map[uStr] = status;
    map[`usr_${uStr}`] = status;
    map[`usr_v_${uStr}`] = status;
    map[uStr.replace(/^usr_v_|^usr_|^user_/, '')] = status;

    if (personObj) {
      if (personObj.email) map[personObj.email.toLowerCase().trim()] = status;
      if (personObj.phone) map[personObj.phone.trim()] = status;
      if (personObj.name) map[personObj.name.toLowerCase().trim()] = status;
    }

    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

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

    if (userList.length === 0) {
      userList = [...INITIAL_PEOPLE_MOCK];
    }

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
      let raw: any;
      try {
        const response = await axiosInstance.get(`/admin/users/${id}`);
        raw = response.data?.data || response.data;
      } catch {
        try {
          const response = await axiosInstance.get(`/people/${id}`);
          raw = response.data?.data || response.data;
        } catch {
          const response = await axiosInstance.get(`/users/status`, { params: { user_id: id } });
          raw = response.data?.data || response.data;
        }
      }

      if (raw && (raw.id || raw.user_id || raw.name)) {
        const domain = mapUserDTOToDomain(raw);
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
          savePersistentStatus(id, status);
          return mapUserDTOToDomain(response.data?.data || response.data);
        }
      } catch {
        const response = await axiosInstance.put(`/people/${id}/status`, { status });
        if (response.data) {
          USER_STATUS_MAP.set(id, status);
          savePersistentStatus(id, status);
          return response.data;
        }
      }
    } catch {}

    USER_STATUS_MAP.set(id, status);
    savePersistentStatus(id, status);
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
        const msg = String(responseData.message || responseData.status || '');

        let strikesCount = Number(
          rawObj?.strikes ??
          rawObj?.flags_count ??
          rawObj?.flagsCount ??
          rawObj?.strike_count ??
          rawObj?.strikes_count ??
          rawObj?.current_strikes ??
          rawObj?.total_flags ??
          rawObj?.user_strikes ??
          responseData?.strikes ??
          0
        );

        if (!strikesCount && msg) {
          const match = msg.match(/Strike\s*#?(\d+)/i) || msg.match(/(\d+)\s*strike/i);
          if (match) strikesCount = Number(match[1]);
        }

        if (!strikesCount) {
          const prev = (USER_FLAGS_MAP.get(id) || 0);
          strikesCount = prev > 0 ? prev + 1 : 1;
        }

        const isBlocked = Boolean(rawObj?.is_blocked || rawObj?.is_auto_banned || rawObj?.status === 'blocked' || rawObj?.status === 'banned' || strikesCount >= 3);
        
        USER_FLAGS_MAP.set(id, strikesCount);
        USER_STATUS_MAP.set(id, isBlocked ? 'banned' : 'warned');

        const domainPerson = mapUserDTOToDomain(rawObj);
        domainPerson.flagsCount = strikesCount;
        domainPerson.strikes = strikesCount;
        domainPerson.status = isBlocked ? 'banned' : 'warned';
        domainPerson.isBlocked = isBlocked;
        domainPerson.isAutoBanned = isBlocked;

        savePersistentStrike(id, strikesCount, domainPerson);
        savePersistentStatus(id, isBlocked ? 'banned' : 'warned', domainPerson);

        return { person: domainPerson, wasBanned: isBlocked, message: msg };
      }
    } catch {}

    const person = await peopleApi.getPersonById(id);
    const currentFlags = (USER_FLAGS_MAP.get(id) ?? person.flagsCount ?? person.strikes ?? 0) + 1;
    USER_FLAGS_MAP.set(id, currentFlags);
    person.flagsCount = currentFlags;
    person.strikes = currentFlags;

    let wasBanned = false;
    if (currentFlags >= 3) {
      person.status = 'banned';
      person.isBlocked = true;
      person.isAutoBanned = true;
      USER_STATUS_MAP.set(id, 'banned');
      savePersistentStrike(id, currentFlags, person);
      savePersistentStatus(id, 'banned', person);
      wasBanned = true;
    } else {
      person.status = 'warned';
      USER_STATUS_MAP.set(id, 'warned');
      savePersistentStrike(id, currentFlags, person);
      savePersistentStatus(id, 'warned', person);
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

      if (responseData) {
        const rawObj = responseData?.data || responseData;
        USER_FLAGS_MAP.set(id, 0);
        USER_STATUS_MAP.set(id, 'active');
        const domainPerson = mapUserDTOToDomain(rawObj);
        domainPerson.flagsCount = 0;
        domainPerson.strikes = 0;
        domainPerson.status = 'active';
        domainPerson.isBlocked = false;
        domainPerson.isAutoBanned = false;

        savePersistentStrike(id, 0, domainPerson);
        savePersistentStatus(id, 'active', domainPerson);
        return domainPerson;
      }
    } catch {}

    USER_FLAGS_MAP.set(id, 0);
    USER_STATUS_MAP.set(id, 'active');
    const person = await peopleApi.getPersonById(id);
    person.flagsCount = 0;
    person.strikes = 0;
    person.status = 'active';
    person.isBlocked = false;
    person.isAutoBanned = false;
    savePersistentStrike(id, 0, person);
    savePersistentStatus(id, 'active', person);
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
