import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * Any object with a `toLocaleString` method compatible with `Intl.DateTimeFormat` options.
 * This covers all Temporal types (PlainDate, PlainDateTime, Instant, ZonedDateTime,
 * PlainYearMonth, PlainMonthDay) without importing the polyfill.
 */
export type TemporalDateLike = {
  toLocaleString(locale?: string, options?: Intl.DateTimeFormatOptions): string
}

/**
 * Accepted date value types.
 * - `Date` — native JavaScript Date
 * - `string` — ISO 8601 date string
 * - `number` — Unix timestamp in milliseconds
 * - `TemporalDateLike` — any Temporal type with `toLocaleString`
 */
export type DateValue = Date | string | number | TemporalDateLike

/**
 * Preset date format styles matching `Intl.DateTimeFormat` dateStyle.
 */
export type DateFormatStyle = 'full' | 'long' | 'medium' | 'short'

/**
 * Options for the {@link FormatDate} component.
 */
export interface FormatDateOptions {
  /** The date value to format. @default '2026-03-17' */
  value: Value<DateValue>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Date format preset. @default 'medium' */
  dateStyle?: Value<DateFormatStyle>
  /** Calendar system (e.g., 'gregory', 'islamic', 'hebrew'). @default undefined */
  calendar?: Value<string>
  /** Numbering system (e.g., 'arab', 'latn'). @default undefined */
  numberingSystem?: Value<string>
  /** Time zone for date interpretation. @default undefined (browser default) */
  timeZone?: Value<string>
  /** Weekday representation (mutually exclusive with dateStyle). @default undefined */
  weekday?: Value<'long' | 'short' | 'narrow'>
  /** Year representation (mutually exclusive with dateStyle). @default undefined */
  year?: Value<'numeric' | '2-digit'>
  /** Month representation (mutually exclusive with dateStyle). @default undefined */
  month?: Value<'numeric' | '2-digit' | 'long' | 'short' | 'narrow'>
  /** Day representation (mutually exclusive with dateStyle). @default undefined */
  day?: Value<'numeric' | '2-digit'>
  /** Era representation (mutually exclusive with dateStyle). @default undefined */
  era?: Value<'long' | 'short' | 'narrow'>
}

/** Check if a value is a Temporal-like object (has toLocaleString but is not a Date). */
function isTemporalLike(value: DateValue): value is TemporalDateLike {
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

function buildOptions(opts: FormatDateOptions): Intl.DateTimeFormatOptions {
  const o: Intl.DateTimeFormatOptions = {}
  const dateStyle = resolve(opts.dateStyle)
  const calendar = resolve(opts.calendar)
  const numberingSystem = resolve(opts.numberingSystem)
  const timeZone = resolve(opts.timeZone)
  const weekday = resolve(opts.weekday)
  const year = resolve(opts.year)
  const month = resolve(opts.month)
  const day = resolve(opts.day)
  const era = resolve(opts.era)
  // Use dateStyle if no fine-grained options are set
  const hasFineGrained =
    weekday !== undefined ||
    year !== undefined ||
    month !== undefined ||
    day !== undefined ||
    era !== undefined
  if (!hasFineGrained) {
    o.dateStyle = dateStyle ?? 'medium'
  } else {
    if (weekday !== undefined) o.weekday = weekday
    if (year !== undefined) o.year = year
    if (month !== undefined) o.month = month
    if (day !== undefined) o.day = day
    if (era !== undefined) o.era = era
  }
  if (calendar !== undefined) o.calendar = calendar
  if (numberingSystem !== undefined) o.numberingSystem = numberingSystem
  if (timeZone !== undefined) o.timeZone = timeZone
  return o
}

/**
 * Formats a date value with locale and Intl options.
 * Supports native Date, ISO strings, timestamps, and Temporal types.
 *
 * @param value - The date value to format
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.DateTimeFormat options
 * @returns The formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date(), 'en-US', { dateStyle: 'full' }) // 'Monday, March 17, 2026'
 * formatDate('2026-03-17', 'de-DE', { dateStyle: 'short' }) // '17.03.26'
 * ```
 */
export function formatDate(
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
 * Locale-aware date formatting component.
 *
 * Renders a formatted date as a `<span>` that automatically updates when
 * the locale or value changes. Supports preset styles, fine-grained part
 * selection, calendar systems, and Temporal types.
 *
 * @param options - Configuration for the date format
 * @returns A reactive `<span>` containing the formatted date
 *
 * @example
 * ```ts
 * FormatDate({ value: new Date(), dateStyle: 'full' })
 * FormatDate({ value: plainDate, dateStyle: 'long' })
 * FormatDate({ value: '2026-03-17', weekday: 'short', month: 'short', day: 'numeric' })
 * ```
 */
export function FormatDate(options: FormatDateOptions): TNode {
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
    return html.span(attr.class('bc-format-date'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-date'), text)
  })
}
