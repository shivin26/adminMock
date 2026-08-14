/**
 * Utility functions for robust matching and normalization of Society names and IDs
 * across backend DTOs and frontend domain objects.
 */

export const normalizeSocietyName = (name?: string | null): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\b(society|apartments|apartment|residency|enclave|towers|tower|colony|heights|park|villas|villa|hub|residential|gated|community)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const isSocietyMatch = (
  vendorSocietyId?: string | number | null,
  vendorSocietyName?: string | null,
  targetSocietyId?: string | number | null,
  targetSocietyName?: string | null
): boolean => {
  // 1. Check ID equality if both IDs exist
  if (
    vendorSocietyId !== undefined &&
    vendorSocietyId !== null &&
    vendorSocietyId !== '' &&
    targetSocietyId !== undefined &&
    targetSocietyId !== null &&
    targetSocietyId !== ''
  ) {
    if (String(vendorSocietyId) === String(targetSocietyId)) {
      return true;
    }
  }

  // 2. Check normalized name matching if both names exist
  const normVendor = normalizeSocietyName(vendorSocietyName);
  const normTarget = normalizeSocietyName(targetSocietyName);

  if (normVendor && normTarget) {
    if (normVendor === normTarget) return true;
    if (normVendor.length >= 3 && normTarget.length >= 3) {
      if (normVendor.includes(normTarget) || normTarget.includes(normVendor)) {
        return true;
      }
    }
  }

  return false;
};
