/**
 * Form field validation utilities.
 * Pure, reusable, and unit-testable validation functions.
 */

// Common domain typos and their correct counterparts
const DOMAIN_TYPO_MAP = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmai.co': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmial.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'iclod.com': 'icloud.com',
  'icloud.con': 'icloud.com'
};

/**
 * Validates a person's first or last name.
 * Rules:
 * - Trimmed length 2 to 30 characters
 * - Letters only plus spaces, hyphen, and apostrophe
 * - Must start with a letter
 */
export function validateName(value, fieldLabel = 'Name') {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return `${fieldLabel} is required.`;
  }

  if (trimmed.length < 2) {
    return `${fieldLabel} must be at least 2 characters.`;
  }

  if (trimmed.length > 30) {
    return `${fieldLabel} must not exceed 30 characters.`;
  }

  if (!/^[a-zA-Z]/.test(trimmed)) {
    return `${fieldLabel} must start with a letter.`;
  }

  if (!/^[a-zA-Z][a-zA-Z\s'-]*$/.test(trimmed)) {
    return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes.`;
  }

  return '';
}

/**
 * Capitalizes the first letter of each word in a string on blur.
 * Supports hyphens (e.g. Mary-Jane) and apostrophes (e.g. O'Connor).
 */
export function capitalizeWords(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
    .replace(/([-' ])([a-z])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`);
}

/**
 * Validates an email address.
 * Rules:
 * - Trimmed, lowercased
 * - Standard email regex
 * - Max 254 characters
 * - Rejects obvious domain typos like gmial.com or gmail.con with clickable suggestion
 */
export function validateEmail(value) {
  const trimmed = (value || '').trim().toLowerCase();

  if (!trimmed) {
    return {
      error: 'Email address is required.',
      suggestion: null
    };
  }

  if (trimmed.length > 254) {
    return {
      error: 'Email address must not exceed 254 characters.',
      suggestion: null
    };
  }

  // Standard RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      error: 'Please enter a valid email address.',
      suggestion: null
    };
  }

  // Check for known domain typos
  const parts = trimmed.split('@');
  if (parts.length === 2) {
    const domain = parts[1];
    if (DOMAIN_TYPO_MAP[domain]) {
      const suggestedDomain = DOMAIN_TYPO_MAP[domain];
      const suggestedEmail = `${parts[0]}@${suggestedDomain}`;
      return {
        error: `Did you mean ${suggestedDomain}?`,
        suggestion: suggestedEmail
      };
    }
  }

  return {
    error: '',
    suggestion: null
  };
}

/**
 * Validates terms and conditions checkbox.
 */
export function validateTerms(checked) {
  if (!checked) {
    return 'You must agree to the Terms of Service and Privacy Policy.';
  }
  return '';
}
