export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  societyName: string;
  flatNumber: string;
  flagsCount: number; // 0 to 3
  status: 'active' | 'warned' | 'banned';
  totalOrders: number;
  totalSpend: number;
  totalComplaintsRaised: number;
  createdAt: string;
  lastActive: string;
  isVerified?: boolean;
  avatarUrl?: string;
}

export interface UserFilterCriteria {
  search: string;
  statuses: string[];
  societies: string[];
  apartmentBlock: string;
  regDateFrom: string;
  regDateTo: string;
  lastActiveRange: string;
  verificationStatus: string;
  complaintsRange: string;
  minSpend: number | string;
  maxSpend: number | string;
  minOrders: number | string;
}

export interface SavedUserFilterPreset {
  id: string;
  name: string;
  criteria: UserFilterCriteria;
}

export type SavedFilterPreset = {
  id: string;
  name: string;
  search: string;
  status: string;
  society: string;
};
