export type SocietyStatus = 'active' | 'inactive';

export interface Society {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  totalVendorsCount: number;
  status: SocietyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SocietyVendor {
  id: string;
  storeName: string;
  ownerName: string;
  category: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
}

export interface SocietyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SocietyStatus | 'all';
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface CreateSocietyPayload {
  name: string;
  code: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
}

export interface UpdateSocietyPayload extends Partial<CreateSocietyPayload> {
  status?: SocietyStatus;
}

export interface BulkSocietyActionPayload {
  ids: string[];
  action: 'activate' | 'deactivate' | 'delete';
}
