/**
 * Normalizes phone or WhatsApp numbers for strict matching across the admin panel.
 * Strips country codes (+91), spaces, hyphens, and non-digit characters to obtain clean 10-digit number.
 * e.g. "+91 95747 75706" -> "9574775706"
 */
export const normalizePhone = (phone?: string | number | null): string => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(-10);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

/**
 * Compares two phone or WhatsApp numbers after normalization.
 */
export const isPhoneMatch = (
  phone1?: string | number | null,
  phone2?: string | number | null
): boolean => {
  const norm1 = normalizePhone(phone1);
  const norm2 = normalizePhone(phone2);
  if (!norm1 || !norm2) return false;
  return norm1 === norm2;
};

/**
 * Finds a matching Resident User from a list by phone or whatsapp number.
 */
export const findUserByPhoneOrWhatsapp = <T extends Record<string, any>>(
  users: T[],
  phoneQuery?: string | number | null
): T | undefined => {
  if (!phoneQuery || !Array.isArray(users)) return undefined;
  const targetNorm = normalizePhone(phoneQuery);
  if (!targetNorm) return undefined;

  return users.find((user) => {
    if (!user) return false;
    const userPhoneNorm = normalizePhone(user.phone || user.phoneNumber || user.mobile);
    const userWhatsappNorm = normalizePhone(user.whatsappNumber || user.whatsapp_number);
    return (userPhoneNorm && userPhoneNorm === targetNorm) || (userWhatsappNorm && userWhatsappNorm === targetNorm);
  });
};

/**
 * Finds a matching Vendor Merchant from a list by phone or whatsapp number.
 */
export const findVendorByPhoneOrWhatsapp = <T extends Record<string, any>>(
  vendors: T[],
  phoneQuery?: string | number | null
): T | undefined => {
  if (!phoneQuery || !Array.isArray(vendors)) return undefined;
  const targetNorm = normalizePhone(phoneQuery);
  if (!targetNorm) return undefined;

  return vendors.find((vendor) => {
    if (!vendor) return false;
    const vendorPhoneNorm = normalizePhone(vendor.phone || vendor.phoneNumber || vendor.mobile);
    const vendorWhatsappNorm = normalizePhone(vendor.whatsappNumber || vendor.whatsapp_number);
    return (vendorPhoneNorm && vendorPhoneNorm === targetNorm) || (vendorWhatsappNorm && vendorWhatsappNorm === targetNorm);
  });
};
