/**
 * Philippine Peso Currency Formatting Utilities
 * VAT Mode: EXCLUSIVE
 */

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₱0.00';
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbol, commas, and spaces
  const cleaned = value.replace(/[₱,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate VAT (Value Added Tax) - EXCLUSIVE mode
 * Default VAT rate: 12%
 */
export const calculateVAT = (amount: number, vatRate: number = 12): number => {
  return (amount * vatRate) / 100;
};

/**
 * Calculate total with VAT (exclusive)
 */
export const calculateTotalWithVAT = (amount: number, vatRate: number = 12): number => {
  return amount + calculateVAT(amount, vatRate);
};

/**
 * Calculate subtotal from total (when VAT is inclusive)
 */
export const calculateSubtotalFromTotal = (total: number, vatRate: number = 12): number => {
  return total / (1 + vatRate / 100);
};

/**
 * Apply percentage to amount
 */
export const applyPercentage = (amount: number, percentage: number): number => {
  return (amount * percentage) / 100;
};

/**
 * Calculate percentage of total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${formatNumber(value, decimals)}%`;
};
