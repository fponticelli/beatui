/**
 * A single segment in a controller path.
 *
 * - `string` represents a named property (e.g., `'name'`, `'address'`)
 * - `number` represents an array index (e.g., `0`, `1`)
 */
export type PathSegment = string | number

/**
 * An array of path segments representing the location of a value within a nested data structure.
 *
 * @example
 * ```typescript
 * const path: Path = ['users', 0, 'name']
 * // Represents: users[0].name
 * ```
 */
export type Path = PathSegment[]

/**
 * Parses a dot-separated path string into an array of path segments.
 *
 * String segments are treated as property names. Segments matching the pattern
 * `[n]` (where `n` is a number) are parsed as numeric array indices.
 *
 * @param path - The dot-separated path string to parse (e.g., `'users.[0].name'`)
 * @returns An array of path segments
 *
 * @example
 * ```typescript
 * parsePath('users.[0].name')
 * // => ['users', 0, 'name']
 *
 * parsePath('settings.theme')
 * // => ['settings', 'theme']
 * ```
 */
export function parsePath(path: string): Path {
  const segments = path.split('.')
  return segments.map(segment => {
    const match = segment.match(/^\[(\d+)\]$/)
    if (match) {
      return Number(match[1])
    }
    return segment
  })
}

/**
 * Wraps a single path segment into its string representation for path serialization.
 *
 * - Numeric segments are wrapped in brackets: `0` becomes `[0]`
 * - String segments are prefixed with a dot: `'name'` becomes `.name`
 *
 * @param v - The path segment to wrap
 * @returns The formatted segment string
 *
 * @example
 * ```typescript
 * wrapSegment(0)       // => '[0]'
 * wrapSegment('name')  // => '.name'
 * ```
 */
export function wrapSegment(v: number | string) {
  return typeof v === 'number' ? `[${v}]` : `.${v}`
}

/**
 * Converts an array of path segments into a human-readable string representation.
 *
 * The first segment is rendered without a leading dot. Subsequent segments use
 * {@link wrapSegment} formatting.
 *
 * @param path - The path segments to serialize
 * @returns The string representation of the path, or an empty string if the path is empty
 *
 * @example
 * ```typescript
 * pathToString(['users', 0, 'name'])
 * // => 'users[0].name'
 *
 * pathToString(['settings', 'theme'])
 * // => 'settings.theme'
 *
 * pathToString([])
 * // => ''
 * ```
 */
export function pathToString(path: Path) {
  if (path.length === 0) return ''
  const [first, ...rest] = path
  const segments = [
    typeof first === 'number' ? `[${first}]` : first,
    ...rest.map(wrapSegment),
  ]
  return segments.join('')
}
