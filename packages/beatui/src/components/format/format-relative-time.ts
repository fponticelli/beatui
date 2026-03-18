import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * Relative time unit for `Intl.RelativeTimeFormat`.
 */
export type RelativeTimeUnit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'

/**
 * Numeric display style: 'always' => "1 day ago", 'auto' => "yesterday".
 */
export type RelativeTimeNumeric = 'always' | 'auto'

/**
 * Format verbosity for relative time.
 */
export type RelativeTimeStyle = 'long' | 'short' | 'narrow'

/**
 * Options for the {@link FormatRelativeTime} component.
 */
export interface FormatRelativeTimeOptions {
  /** Numeric offset (e.g., -2 for "2 days ago", 3 for "in 3 hours"). @default -2 @min -100 @max 100 @step 1 */
  value: Value<number>
  /** The unit for the relative time. @default 'day' */
  unit: Value<RelativeTimeUnit>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Numeric display. @default 'auto' */
  numeric?: Value<RelativeTimeNumeric>
  /** Format verbosity. @default 'long' */
  style?: Value<RelativeTimeStyle>
}

/**
 * Formats a relative time value with locale and Intl options.
 *
 * @param value - Numeric offset (negative = past, positive = future)
 * @param unit - Time unit
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.RelativeTimeFormat options
 * @returns The formatted relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime(-2, 'day', 'en-US')                    // '2 days ago'
 * formatRelativeTime(-1, 'day', 'en-US', { numeric: 'auto' }) // 'yesterday'
 * formatRelativeTime(3, 'hour', 'en-US')                    // 'in 3 hours'
 * ```
 */
export function formatRelativeTime(
  value: number,
  unit: RelativeTimeUnit,
  locale?: string,
  options?: Intl.RelativeTimeFormatOptions
): string {
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit)
}

/**
 * Locale-aware relative time formatting component.
 *
 * Renders a relative time expression (e.g., "2 days ago", "in 3 hours") as a
 * `<span>` that automatically updates when the locale, value, or unit changes.
 *
 * @param options - Configuration for the relative time format
 * @returns A reactive `<span>` containing the formatted relative time
 *
 * @example
 * ```ts
 * FormatRelativeTime({ value: -2, unit: 'day' })
 * FormatRelativeTime({ value: -1, unit: 'day', numeric: 'auto' })
 * FormatRelativeTime({ value: 3, unit: 'hour', style: 'narrow' })
 * ```
 */
export function FormatRelativeTime(options: FormatRelativeTimeOptions): TNode {
  const { value, unit, locale: localeOverride } = options

  const resolve = <T>(v: Value<T> | undefined): T | undefined =>
    v !== undefined ? Value.get(v) : undefined

  const format = (loc: string, val: number, u: RelativeTimeUnit): string => {
    const intlOpts: Intl.RelativeTimeFormatOptions = {}
    const numeric = resolve(options.numeric)
    const style = resolve(options.style)
    if (numeric !== undefined) intlOpts.numeric = numeric
    if (style !== undefined) intlOpts.style = style
    return new Intl.RelativeTimeFormat(loc, intlOpts).format(val, u)
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value, unit)(format)
    return html.span(attr.class('bc-format-relative-time'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value, unit)(format)
    return html.span(attr.class('bc-format-relative-time'), text)
  })
}
