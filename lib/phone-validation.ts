/**
 * International Phone Number Validation
 * Supports formats from USA, Japan, Africa, CIS, and more
 */

/**
 * Validate international phone number format
 * Accepts formats like: +1234567890, +998901234567, +81-90-1234-5678, etc.
 */
export function validateInternationalPhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return true; // Optional field

  // Remove all spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Must start with + followed by country code
  if (!cleaned.startsWith('+')) {
    return false;
  }

  // Remove the + sign
  const digits = cleaned.substring(1);

  // Must contain only digits after +
  if (!/^\d+$/.test(digits)) {
    return false;
  }

  // Minimum length: country code (1-3 digits) + at least 7 digits = 8 total
  // Maximum length: country code + 15 digits = 16 total (E.164 standard)
  if (digits.length < 8 || digits.length > 16) {
    return false;
  }

  return true;
}

/**
 * Format phone number for display
 * Converts to international format: +[country code][number]
 */
export function formatInternationalPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If doesn't start with +, try to add country code
  if (!cleaned.startsWith('+')) {
    // This is a simplified version - in production, use a library like libphonenumber-js
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Get country code from phone number
 */
export function extractCountryCode(phone: string): string | null {
  if (!phone || !phone.startsWith('+')) return null;

  const digits = phone.substring(1).replace(/\D/g, '');
  
  // Common country code lengths: 1 (US/CA), 2 (most countries), 3 (some countries)
  // Try to extract 1-3 digit country code
  if (digits.length >= 1) {
    // Check for 1-digit (US, Canada)
    if (digits.startsWith('1') && digits.length >= 11) {
      return '+1';
    }
    // Check for 2-digit codes (most countries)
    if (digits.length >= 10) {
      return '+' + digits.substring(0, 2);
    }
  }

  return null;
}

