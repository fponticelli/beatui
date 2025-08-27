export const DURATION_PARTIAL_RE =
  /^P(\d+([YMWD]|$)){0,4}(T(\d+([HMS]|$)){0,3})?$/i

export const DURATION_FULL_RE =
  /^P(?:(\d+Y)?(\d+M)?(\d+W)?(\d+D)?)(T(\d+H)?(\d+M)?(\d+S)?)?$/i

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
