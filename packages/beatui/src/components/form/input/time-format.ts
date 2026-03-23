/** Any object with hour/minute/second — covers PlainTime and PlainDateTime. */
interface TimeLike {
  hour: number
  minute: number
  second: number
}

/**
 * Format a time-like value as a 12-hour string (e.g. "2:30 PM").
 */
export function formatTime12(t: TimeLike): string {
  const h = t.hour % 12 || 12
  const m = String(t.minute).padStart(2, '0')
  const period = t.hour >= 12 ? 'PM' : 'AM'
  return `${h}:${m} ${period}`
}

/**
 * Format a time-like value as a 24-hour string (e.g. "14:30").
 */
export function formatTime24(t: TimeLike): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

/**
 * Format a time-like value as a 12-hour string with seconds (e.g. "2:30:15 PM").
 */
export function formatTime12WithSeconds(t: TimeLike): string {
  const h = t.hour % 12 || 12
  const m = String(t.minute).padStart(2, '0')
  const s = String(t.second).padStart(2, '0')
  const period = t.hour >= 12 ? 'PM' : 'AM'
  return `${h}:${m}:${s} ${period}`
}

/**
 * Format a time-like value as a 24-hour string with seconds (e.g. "14:30:15").
 */
export function formatTime24WithSeconds(t: TimeLike): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:${String(t.second).padStart(2, '0')}`
}

/**
 * Pick the correct formatter based on 12-hour and seconds flags.
 */
export function formatTimeAuto(
  t: TimeLike,
  is12Hour: boolean,
  withSeconds: boolean
): string {
  if (is12Hour) {
    return withSeconds ? formatTime12WithSeconds(t) : formatTime12(t)
  }
  return withSeconds ? formatTime24WithSeconds(t) : formatTime24(t)
}

/**
 * Detect whether a locale uses 12-hour time format.
 */
export function localeUses12Hour(locale: string): boolean {
  try {
    const resolved = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
    }).resolvedOptions() as Intl.ResolvedDateTimeFormatOptions & {
      hourCycle?: string
    }
    // h11 and h12 are 12-hour cycles; h23 and h24 are 24-hour
    if (resolved.hourCycle) {
      return resolved.hourCycle === 'h11' || resolved.hourCycle === 'h12'
    }
    return resolved.hour12 === true
  } catch {
    return false
  }
}
