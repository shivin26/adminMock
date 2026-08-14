export type PersonType = 'user' | 'vendor' | 'sub_admin' | 'user_vendor';
export type PersonStatus = 'active' | 'warned' | 'banned' | 'blocked' | 'suspended';

export interface PersonProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  personType: PersonType;
  status: PersonStatus;
  societyName: string;
  societyId?: string;
  flatNumber?: string;
  storeName?: string;
  category?: string;
  flagsCount: number;
  rating?: number;
  totalOrdersCount: number;
  totalComplaintsCount: number;
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface CreatePersonRequest {
  name: string;
  email: string;
  phone: string;
  personType: PersonType;
  societyName?: string;
  flatNumber?: string;
  storeName?: string;
  category?: string;
}

export interface PeopleFilterOptions {
  search?: string;
  personType?: string;
  status?: string;
  societyName?: string;
  minFlags?: number;
}

export interface PeopleAnalyticsSummary {
  totalPeopleCount: number;
  usersCount: number;
  vendorsCount: number;
  subAdminsCount: number;
  warnedCount: number;
  bannedCount: number;
  activeRate: number;
}
