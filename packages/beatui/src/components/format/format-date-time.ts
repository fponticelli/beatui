import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'
import type { DateValue, DateFormatStyle } from './format-date'
import type { TimeFormatStyle } from './format-time'

/**
 * Options for the {@link FormatDateTime} component.
 */
export interface FormatDateTimeOptions {
  /** The date/time value to format. @default '2026-03-17T14:30:00' */
  value: Value<DateValue>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Date portion style. @default 'medium' */
  dateStyle?: Value<DateFormatStyle>
  /** Time portion style. @default 'short' */
  timeStyle?: Value<TimeFormatStyle>
  /** Time zone. @default undefined (browser default) */
  timeZone?: Value<string>
  /** Calendar system. @default undefined */
  calendar?: Value<string>
  /** Whether to use 12-hour time. @default undefined (locale default) */
  hour12?: Value<boolean>
  /** Hour cycle override. @default undefined */
  hourCycle?: Value<'h11' | 'h12' | 'h23' | 'h24'>
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

function buildOptions(opts: FormatDateTimeOptions): Intl.DateTimeFormatOptions {
  const dateStyle = resolve(opts.dateStyle)
  const timeStyle = resolve(opts.timeStyle)
  const timeZone = resolve(opts.timeZone)
  const calendar = resolve(opts.calendar)
  const hour12 = resolve(opts.hour12)
  const hourCycle = resolve(opts.hourCycle)
  const o: Intl.DateTimeFormatOptions = {
    dateStyle: dateStyle ?? 'medium',
    timeStyle: timeStyle ?? 'short',
  }
  if (timeZone !== undefined) o.timeZone = timeZone
  if (calendar !== undefined) o.calendar = calendar
  if (hour12 !== undefined) o.hour12 = hour12
  if (hourCycle !== undefined) o.hourCycle = hourCycle
  return o
}

/**
 * Formats a date and time value with locale and Intl options.
 *
 * @param value - The date/time value to format
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.DateTimeFormat options
 * @returns The formatted date-time string
 *
 * @example
 * ```ts
 * formatDateTime(new Date(), 'en-US') // 'Mar 17, 2026, 2:30 PM'
 * ```
 */
export function formatDateTime(
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
 * Locale-aware date and time formatting component.
 *
 * Renders a formatted date-time as a `<span>` that automatically updates when
 * the locale or value changes.
 *
 * @param options - Configuration for the date-time format
 * @returns A reactive `<span>` containing the formatted date-time
 *
 * @example
 * ```ts
 * FormatDateTime({ value: new Date() })
 * FormatDateTime({ value: zonedDateTime, dateStyle: 'full', timeStyle: 'long' })
 * ```
 */
export function FormatDateTime(options: FormatDateTimeOptions): TNode {
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
    return html.span(attr.class('bc-format-date-time'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-date-time'), text)
  })
}
