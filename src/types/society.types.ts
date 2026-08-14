// Frontend domain model
export interface Society {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  totalVendorsCount: number;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Raw Backend DTO from GET /api/societies
export interface RawSocietyDTO {
  society_id: number;
  society_name: string;
  location: string;
  public_id: string;
  vendor_count: number;
  status?: string;
  created_at: string;
}

export interface CreateSocietyRequest {
  society_name: string;
  location: string;
}

export interface UpdateSocietyRequest {
  society_name: string;
  location: string;
}

export interface CreateSocietyResponse {
  message: string;
  society_id: number;
}

export interface ToggleSocietyStatusResponse {
  message: string;
  society_id: string | number;
  status: 'active' | 'suspended' | 'pending';
}
