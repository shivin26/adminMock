import type { Society, RawSocietyDTO } from '../../types/society.types';

export const mapSocietyDTOToDomain = (dto: RawSocietyDTO): Society => {
  const locStr = dto.location || (dto as any).address || '';
  const locationParts = locStr ? locStr.split(',').map((s) => s.trim()) : [];
  const city = locationParts[locationParts.length - 1] || dto.city || 'Noida';
  const state = locationParts.length > 1 ? locationParts[locationParts.length - 2] : dto.state || 'UP';
  const address = locStr || 'Block A, Sector 62, Noida';

  const statusLower = String(dto.status || 'ACTIVE').toLowerCase();
  const normalizedStatus: 'active' | 'suspended' | 'pending' =
    statusLower === 'suspended' || statusLower === 'blocked'
      ? 'suspended'
      : statusLower === 'pending'
      ? 'pending'
      : 'active';

  const vendorsCount = Number(
    dto.vendor_count ??
      (dto as any).vendors_count ??
      (dto as any).total_vendors_count ??
      (dto as any).total_vendors ??
      (dto as any).totalVendorsCount ??
      0
  );

  return {
    id: String(dto.society_id || (dto as any).id || Date.now()),
    name: dto.society_name || dto.name || 'Unnamed Society',
    code: dto.public_id || (dto as any).code || `SOC-${dto.society_id || '000'}`,
    city,
    state,
    postalCode: dto.pincode || (dto as any).postalCode || '201301',
    address,
    totalVendorsCount: vendorsCount,
    status: normalizedStatus,
    createdAt: dto.created_at || (dto as any).createdAt || new Date().toISOString(),
    updatedAt: dto.created_at || (dto as any).updatedAt || new Date().toISOString(),
  };
};
