// Separators people actually type between digits. Anything else between the
// digits is rejected rather than silently repaired, so the normalization stays
// total and predictable.
const SEPARATORS = /[\s\-().]/g

/**
 * Validate an international phone number.
 *
 * @param {string} input raw user input
 * @returns {{ valid: boolean, message: string, value: string }}
 *   `message` is '' when valid; `value` is the normalized number when valid
 *   and '' when invalid.
 */
export function validatePhone(input) {
  const normalized = String(input ?? '').replace(SEPARATORS, '')

  if (!normalized) {
    return { valid: false, message: 'Phone number is required', value: '' }
  }

  if (!normalized.startsWith('+')) {
    return {
      valid: false,
      message: 'Phone number must start with a country code, e.g. +254',
      value: '',
    }
  }

  const digits = normalized.slice(1)

  if (!/^\d*$/.test(digits)) {
    return {
      valid: false,
      message: 'Phone number can only contain digits after the country code',
      value: '',
    }
  }

  // 8-15 is the E.164 total-length range, which is what makes every country
  // code valid rather than only +254.
  if (digits.length < 8 || digits.length > 15) {
    return {
      valid: false,
      message: 'Phone number must be between 8 and 15 digits',
      value: '',
    }
  }

  return { valid: true, message: '', value: normalized }
}
