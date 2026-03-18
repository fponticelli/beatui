import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'
import type { DateValue } from './format-date'

/**
 * Preset time format styles matching `Intl.DateTimeFormat` timeStyle.
 */
export type TimeFormatStyle = 'full' | 'long' | 'medium' | 'short'

/**
 * Options for the {@link FormatTime} component.
 */
export interface FormatTimeOptions {
  /** The date/time value to extract time from. @default '2026-03-17T14:30:00' */
  value: Value<DateValue>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Time format preset. @default 'medium' */
  timeStyle?: Value<TimeFormatStyle>
  /** Time zone. @default undefined (browser default) */
  timeZone?: Value<string>
  /** Whether to use 12-hour time. @default undefined (locale default) */
  hour12?: Value<boolean>
  /** Hour cycle override. @default undefined */
  hourCycle?: Value<'h11' | 'h12' | 'h23' | 'h24'>
  /** Hour representation (mutually exclusive with timeStyle). @default undefined */
  hour?: Value<'numeric' | '2-digit'>
  /** Minute representation (mutually exclusive with timeStyle). @default undefined */
  minute?: Value<'numeric' | '2-digit'>
  /** Second representation (mutually exclusive with timeStyle). @default undefined */
  second?: Value<'numeric' | '2-digit'>
  /** Fractional second digits (0-3, mutually exclusive with timeStyle). @default undefined */
  fractionalSecondDigits?: Value<0 | 1 | 2 | 3>
  /** Time zone name display style (mutually exclusive with timeStyle). @default undefined */
  timeZoneName?: Value<
    | 'long'
    | 'short'
    | 'shortOffset'
    | 'longOffset'
    | 'shortGeneric'
    | 'longGeneric'
  >
  /** Day period display (mutually exclusive with timeStyle). @default undefined */
  dayPeriod?: Value<'narrow' | 'short' | 'long'>
}

/** Check if a value is a Temporal-like object. */
function isTemporalLike(value: DateValue): value is {
  toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions): string
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof Date) &&
    'toLocaleString' in value
  )
}

/** Normalize a DateValue to a Date (for non-Temporal values). */
function toDate(value: DateValue): Date {
  return value instanceof Date ? value : new Date(value as string | number)
}

function resolve<T>(v: Value<T> | undefined): T | undefined {
  return v !== undefined ? Value.get(v) : undefined
}

function buildOptions(opts: FormatTimeOptions): Intl.DateTimeFormatOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: Record<string, any> = {}
  const timeStyle = resolve(opts.timeStyle)
  const timeZone = resolve(opts.timeZone)
  const hour12 = resolve(opts.hour12)
  const hourCycle = resolve(opts.hourCycle)
  const hour = resolve(opts.hour)
  const minute = resolve(opts.minute)
  const second = resolve(opts.second)
  const fractionalSecondDigits = resolve(opts.fractionalSecondDigits)
  const timeZoneName = resolve(opts.timeZoneName)
  const dayPeriod = resolve(opts.dayPeriod)
  const hasFineGrained =
    hour !== undefined ||
    minute !== undefined ||
    second !== undefined ||
    fractionalSecondDigits !== undefined ||
    timeZoneName !== undefined ||
    dayPeriod !== undefined
  if (!hasFineGrained) {
    o.timeStyle = timeStyle ?? 'medium'
  } else {
    if (hour !== undefined) o.hour = hour
    if (minute !== undefined) o.minute = minute
    if (second !== undefined) o.second = second
    if (fractionalSecondDigits !== undefined)
      o.fractionalSecondDigits = fractionalSecondDigits
    if (timeZoneName !== undefined) o.timeZoneName = timeZoneName
    if (dayPeriod !== undefined) o.dayPeriod = dayPeriod
  }
  if (timeZone !== undefined) o.timeZone = timeZone
  if (hour12 !== undefined) o.hour12 = hour12
  if (hourCycle !== undefined) o.hourCycle = hourCycle
  return o as Intl.DateTimeFormatOptions
}

/**
 * Formats a time value with locale and Intl options.
 *
 * @param value - The date/time value to extract time from
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.DateTimeFormat options
 * @returns The formatted time string
 *
 * @example
 * ```ts
 * formatTime(new Date(), 'en-US', { timeStyle: 'short' }) // '2:30 PM'
 * formatTime(new Date(), 'de-DE', { timeStyle: 'short' }) // '14:30'
 * ```
 */
export function formatTime(
  value: DateValue,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (isTemporalLike(value)) {
    return value.toLocaleString(locale, options)
  }
  return new Intl.DateTimeFormat(locale, options).format(toDate(value))
}

/**
 * Locale-aware time formatting component.
 *
 * Renders a formatted time as a `<span>` that automatically updates when
 * the locale or value changes.
 *
 * @param options - Configuration for the time format
 * @returns A reactive `<span>` containing the formatted time
 *
 * @example
 * ```ts
 * FormatTime({ value: new Date(), timeStyle: 'short' })
 * FormatTime({ value: plainTime, hour: 'numeric', minute: '2-digit', hour12: false })
 * ```
 */
export function FormatTime(options: FormatTimeOptions): TNode {
  const { value, locale: localeOverride } = options

  const format = (loc: string, val: DateValue): string => {
    const intlOpts = buildOptions(options)
    if (isTemporalLike(val)) {
      return val.toLocaleString(loc, intlOpts)
    }
    return new Intl.DateTimeFormat(loc, intlOpts).format(toDate(val))
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-time'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-time'), text)
  })
}
