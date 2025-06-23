/**
 * Currency utilities
 */

/**
 * Formats currency in Indonesian Rupiah format
 * @param value - The numeric value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => `Rp ${value.toLocaleString("id-ID")}`;
