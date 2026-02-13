/**
 * Regular expression for validating partial ISO-8601 duration strings during input.
 * Allows incomplete durations that are still being typed (e.g., `P1`, `P1DT`).
 */
export const DURATION_PARTIAL_RE =
  /^P(\d+([YMWD]|$)){0,4}(T(\d+([HMS]|$)){0,3})?$/i

/**
 * Regular expression for validating complete ISO-8601 duration strings.
 * Matches fully formed durations like `P1Y2M3DT4H5M6S`.
 */
export const DURATION_FULL_RE =
  /^P(?:(\d+Y)?(\d+M)?(\d+W)?(\d+D)?)(T(\d+H)?(\d+M)?(\d+S)?)?$/i

/**
 * Creates a mask configuration object for ISO-8601 duration inputs.
 *
 * The configuration allows only valid duration characters (digits and P, T, W, D, H, M, S),
 * auto-uppercases input, rejects invalid partial patterns, and uses a custom completion
 * check that validates via the provided parse function.
 *
 * @param parse - A function that parses a duration string (e.g., `Temporal.Duration.from`).
 * @returns A mask configuration object suitable for use with {@link MaskInput}.
 *
 * @example
 * ```ts
 * const config = durationMaskConfig(Temporal.Duration.from)
 * MaskInput({ ...options, ...config })
 * ```
 */
export function durationMaskConfig(parse: (s: string) => unknown) {
  return {
    mask: null,
    allowMode: 'custom' as const,
    allow: (c: string) => /[0-9ptwdhms]/i.test(c),
    pipe: (conformed: string) => {
      const s = conformed.toUpperCase()
      if (s.length === 0) return s
      if (!s.startsWith('P')) return false
      if (!DURATION_PARTIAL_RE.test(s)) return false
      return s
    },
    completion: {
      mode: 'custom' as const,
      isComplete: (conformed: string) => {
        const s = conformed.toUpperCase()
        if (!DURATION_FULL_RE.test(s)) return false
        try {
          parse(s)
          return true
        } catch {
          return false
        }
      },
    },
  }
}
