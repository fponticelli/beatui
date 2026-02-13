/**
 * Converts a `Date` to a full ISO 8601 date-time string (e.g., `'2024-01-15T10:30:00.000Z'`).
 *
 * @param date - The Date object to convert
 * @returns The ISO 8601 date-time string representation
 *
 * @example
 * ```typescript
 * dateTimeToISO(new Date('2024-01-15T10:30:00Z'))
 * // => '2024-01-15T10:30:00.000Z'
 * ```
 */
export const dateTimeToISO = (date: Date): string => {
  return date.toISOString()
}

/**
 * Converts a `Date` to an ISO 8601 date-only string (e.g., `'2024-01-15'`).
 *
 * Strips the time portion from the ISO string, returning only the `YYYY-MM-DD` part.
 *
 * @param date - The Date object to convert
 * @returns The ISO 8601 date-only string (YYYY-MM-DD)
 *
 * @example
 * ```typescript
 * dateToISO(new Date('2024-01-15T10:30:00Z'))
 * // => '2024-01-15'
 * ```
 */
export const dateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0]!
}

/**
 * Parses a date string into a `Date` object.
 *
 * @param value - The date string to parse (any format accepted by `new Date()`)
 * @returns A new Date object
 *
 * @example
 * ```typescript
 * stringToDate('2024-01-15')
 * // => Date Mon Jan 15 2024 ...
 * ```
 */
export const stringToDate = (value: string): Date => {
  return new Date(value)
}

/**
 * Parses a nullable date string into a `Date` or `null`.
 *
 * Returns `null` if the input is `null` or an empty string.
 *
 * @param value - The date string to parse, or `null`
 * @returns A Date object if the value is a non-empty string, otherwise `null`
 *
 * @example
 * ```typescript
 * nullableStringToDate('2024-01-15') // => Date
 * nullableStringToDate(null)          // => null
 * nullableStringToDate('')            // => null
 * ```
 */
export const nullableStringToDate = (value: string | null): Date | null => {
  return value != null && value !== '' ? new Date(value) : null
}

/**
 * Converts a nullable `Date` to a full ISO 8601 date-time string, or `null`.
 *
 * @param date - The Date object to convert, or `null`
 * @returns The ISO 8601 date-time string, or `null` if the input is `null`
 *
 * @example
 * ```typescript
 * nullableDateTimeToISO(new Date('2024-01-15T10:30:00Z'))
 * // => '2024-01-15T10:30:00.000Z'
 * nullableDateTimeToISO(null)
 * // => null
 * ```
 */
export const nullableDateTimeToISO = (date: Date | null): string | null => {
  return date != null ? date.toISOString() : null
}

/**
 * Converts a nullable `Date` to an ISO 8601 date-only string, or `null`.
 *
 * @param date - The Date object to convert, or `null`
 * @returns The ISO 8601 date-only string (YYYY-MM-DD), or `null` if the input is `null`
 *
 * @example
 * ```typescript
 * nullableDateToISO(new Date('2024-01-15T10:30:00Z'))
 * // => '2024-01-15'
 * nullableDateToISO(null)
 * // => null
 * ```
 */
export const nullableDateToISO = (date: Date | null): string | null => {
  return date != null ? date.toISOString().split('T')[0]! : null
}
