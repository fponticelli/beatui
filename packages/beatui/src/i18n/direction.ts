/**
 * @fileoverview Direction utilities for RTL/LTR support
 *
 * Provides utilities for detecting and managing text directionality
 * based on locale and user preferences.
 */

/**
 * Text direction values
 */
export type DirectionValue = 'ltr' | 'rtl'

/**
 * Direction preference options
 * - 'auto': Automatically detect from locale
 * - 'ltr': Force left-to-right
 * - 'rtl': Force right-to-left
 */
export type DirectionPreference = 'auto' | 'ltr' | 'rtl'

/**
 * RTL language codes (ISO 639-1 and some 639-2)
 * These languages are written from right to left
 */
const RTL_LANGUAGES = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'ps', // Pashto
  'sd', // Sindhi
  'ku', // Kurdish
  'dv', // Divehi/Maldivian
  'yi', // Yiddish
  'ji', // Yiddish (alternative code)
  'iw', // Hebrew (deprecated, but still used)
  'in', // Indonesian (deprecated, but sometimes confused)
])

/**
 * Detects text direction from a locale string
 *
 * @param locale - Locale string (e.g., 'en-US', 'ar-SA', 'he-IL')
 * @returns Direction value ('ltr' or 'rtl')
 *
 * @example
 * ```typescript
 * getDirectionFromLocale('en-US') // 'ltr'
 * getDirectionFromLocale('ar-SA') // 'rtl'
 * getDirectionFromLocale('he') // 'rtl'
 * ```
 */
export function getDirectionFromLocale(locale: string): DirectionValue {
  if (!locale) return 'ltr'

  // Extract language code (before first dash or underscore)
  const languageCode = locale.split(/[-_]/)[0].toLowerCase()

  return RTL_LANGUAGES.has(languageCode) ? 'rtl' : 'ltr'
}

/**
 * Resolves the final direction based on preference and locale
 *
 * @param preference - User's direction preference
 * @param locale - Current locale string
 * @returns Final direction value
 *
 * @example
 * ```typescript
 * resolveDirection('auto', 'ar-SA') // 'rtl'
 * resolveDirection('ltr', 'ar-SA') // 'ltr' (forced)
 * resolveDirection('rtl', 'en-US') // 'rtl' (forced)
 * ```
 */
export function resolveDirection(
  preference: DirectionPreference,
  locale: string
): DirectionValue {
  if (preference === 'auto') {
    return getDirectionFromLocale(locale)
  }
  return preference
}

/**
 * Generates CSS class name for direction
 *
 * @param direction - Direction value
 * @returns CSS class name
 *
 * @example
 * ```typescript
 * getDirectionClassName('ltr') // 'b-ltr'
 * getDirectionClassName('rtl') // 'b-rtl'
 * ```
 */
export function getDirectionClassName(direction: DirectionValue): string {
  return `b-${direction}`
}

/**
 * Checks if a locale is RTL
 *
 * @param locale - Locale string to check
 * @returns True if the locale is RTL
 *
 * @example
 * ```typescript
 * isRTLLocale('ar-SA') // true
 * isRTLLocale('en-US') // false
 * ```
 */
export function isRTLLocale(locale: string): boolean {
  return getDirectionFromLocale(locale) === 'rtl'
}

/**
 * Gets the opposite direction
 *
 * @param direction - Current direction
 * @returns Opposite direction
 *
 * @example
 * ```typescript
 * getOppositeDirection('ltr') // 'rtl'
 * getOppositeDirection('rtl') // 'ltr'
 * ```
 */
export function getOppositeDirection(
  direction: DirectionValue
): DirectionValue {
  return direction === 'ltr' ? 'rtl' : 'ltr'
}

/**
 * Direction-aware logical property mappings
 * Maps logical properties to physical properties based on direction
 */
export const LOGICAL_PROPERTY_MAP = {
  ltr: {
    'inline-start': 'left',
    'inline-end': 'right',
    'block-start': 'top',
    'block-end': 'bottom',
  },
  rtl: {
    'inline-start': 'right',
    'inline-end': 'left',
    'block-start': 'top',
    'block-end': 'bottom',
  },
} as const

/**
 * Gets physical property name from logical property based on direction
 *
 * @param logicalProperty - Logical property name
 * @param direction - Text direction
 * @returns Physical property name
 *
 * @example
 * ```typescript
 * getPhysicalProperty('inline-start', 'ltr') // 'left'
 * getPhysicalProperty('inline-start', 'rtl') // 'right'
 * ```
 */
export function getPhysicalProperty(
  logicalProperty: keyof typeof LOGICAL_PROPERTY_MAP.ltr,
  direction: DirectionValue
): string {
  return LOGICAL_PROPERTY_MAP[direction][logicalProperty]
}
