// Shared form validation + input normalisation helpers

/** Trim and lowercase an email so Supabase Auth never rejects it for stray
 *  whitespace / casing introduced by mobile autofill. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

/** Strip everything except digits (for live filtering of phone inputs). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Strip anything that isn't a letter, space, hyphen or apostrophe
 *  (for live filtering of person-name inputs). */
export function lettersOnly(value: string): string {
  return value.replace(/[^A-Za-z'\- ]/g, '')
}

/** Validate a person's name: letters only AND both first name + surname.
 *  Returns an error message, or '' when valid. */
export function nameError(value: string, label = 'Full name'): string {
  const v = value.trim().replace(/\s+/g, ' ')
  if (!v) return `${label} is required`
  if (!/^[A-Za-z'\- ]+$/.test(v)) return `${label} may only contain letters`
  if (v.split(' ').filter(Boolean).length < 2) return `Please enter both first name and surname`
  return ''
}

/** Validate a SA contact number: exactly 10 digits.
 *  Returns an error message, or '' when valid. */
export function phoneError(value: string, label = 'Contact number', required = true): string {
  const d = digitsOnly(value)
  if (!d) return required ? `${label} is required` : ''
  if (d.length !== 10) return `${label} must be exactly 10 digits`
  return ''
}
