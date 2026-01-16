/**
 * Deep merge utility for form default values.
 *
 * Merges default values with provided values, where provided values take precedence.
 * Only merges where the provided value is undefined.
 */

/**
 * Check if a value is a plain object (not null, array, Date, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

/**
 * Deep merge defaults into a target value.
 *
 * - Provided values take precedence over defaults
 * - Only fills in undefined values from defaults
 * - Recursively merges nested objects
 * - Arrays are NOT merged (provided array replaces default)
 *
 * @param defaults - Default values to use when target values are undefined
 * @param provided - Provided values that take precedence
 * @returns Merged result
 *
 * @example
 * ```typescript
 * const defaults = { name: 'John', settings: { theme: 'dark', lang: 'en' } }
 * const provided = { settings: { theme: 'light' } }
 * const result = deepMergeDefaults(defaults, provided)
 * // { name: 'John', settings: { theme: 'light', lang: 'en' } }
 * ```
 */
export function deepMergeDefaults<T>(
  defaults: unknown,
  provided: T | undefined | null
): T {
  // If provided is null/undefined, use defaults directly
  if (provided === undefined || provided === null) {
    // Deep clone defaults to avoid mutations
    return structuredClonePolyfill(defaults) as T
  }

  // If defaults is null/undefined, return provided as-is
  if (defaults === undefined || defaults === null) {
    return provided
  }

  // If both are plain objects, merge recursively
  if (isPlainObject(defaults) && isPlainObject(provided)) {
    const result: Record<string, unknown> = { ...provided }

    for (const key of Object.keys(defaults)) {
      if (result[key] === undefined) {
        // Key doesn't exist in provided - use default (cloned)
        result[key] = structuredClonePolyfill(defaults[key])
      } else if (isPlainObject(defaults[key]) && isPlainObject(result[key])) {
        // Both are objects - recurse
        result[key] = deepMergeDefaults(defaults[key], result[key])
      }
      // Otherwise keep the provided value
    }

    return result as T
  }

  // For non-objects (primitives, arrays, etc.), provided takes precedence
  return provided
}

/**
 * Polyfill for structuredClone that falls back to JSON round-trip
 */
function structuredClonePolyfill<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  // Fallback for environments without structuredClone
  return JSON.parse(JSON.stringify(value)) as T
}
