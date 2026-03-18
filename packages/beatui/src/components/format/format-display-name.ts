import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * Type of display name to resolve.
 */
export type DisplayNameType =
  | 'language'
  | 'region'
  | 'script'
  | 'currency'
  | 'calendar'
  | 'dateTimeField'

/**
 * Format verbosity for display names.
 */
export type DisplayNameStyle = 'long' | 'short' | 'narrow'

/**
 * Language display style (only for type 'language').
 */
export type DisplayNameLanguageDisplay = 'dialect' | 'standard'

/**
 * Options for the {@link FormatDisplayName} component.
 */
export interface FormatDisplayNameOptions {
  /** The code to look up (e.g., 'en-US', 'USD', 'Latn'). @default 'en-US' */
  value: Value<string>
  /** The type of display name to resolve. @default 'language' */
  type: Value<DisplayNameType>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Format verbosity. @default 'long' */
  style?: Value<DisplayNameStyle>
  /** Language display style (only for type 'language'). @default 'dialect' */
  languageDisplay?: Value<DisplayNameLanguageDisplay>
  /** Fallback behavior when code is not found. @default 'code' */
  fallback?: Value<'code' | 'none'>
}

/**
 * Formats a display name for a language, region, script, currency, calendar,
 * or dateTimeField code.
 *
 * @param value - The code to look up
 * @param type - The type of display name
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Additional display name options
 * @returns The formatted display name string, or the code itself if not found
 *
 * @example
 * ```ts
 * formatDisplayName('en-US', 'language', 'en')  // 'American English'
 * formatDisplayName('USD', 'currency', 'en')    // 'US Dollar'
 * formatDisplayName('JP', 'region', 'en')       // 'Japan'
 * ```
 */
export function formatDisplayName(
  value: string,
  type: DisplayNameType,
  locale?: string,
  options?: {
    style?: DisplayNameStyle
    languageDisplay?: DisplayNameLanguageDisplay
    fallback?: 'code' | 'none'
  }
): string {
  const dn = new Intl.DisplayNames(locale, {
    type,
    style: options?.style,
    languageDisplay: type === 'language' ? options?.languageDisplay : undefined,
    fallback: options?.fallback,
  })
  return dn.of(value) ?? value
}

/**
 * Locale-aware display name formatting component.
 *
 * Renders the locale-aware name for a language, region, script, currency,
 * calendar, or dateTimeField code as a `<span>` that automatically updates
 * when the locale or value changes.
 *
 * @param options - Configuration for the display name format
 * @returns A reactive `<span>` containing the formatted display name
 *
 * @example
 * ```ts
 * FormatDisplayName({ value: 'en-US', type: 'language' })
 * FormatDisplayName({ value: 'USD', type: 'currency' })
 * FormatDisplayName({ value: 'JP', type: 'region' })
 * ```
 */
export function FormatDisplayName(options: FormatDisplayNameOptions): TNode {
  const { value, locale: localeOverride } = options

  const resolve = <T>(v: Value<T> | undefined): T | undefined =>
    v !== undefined ? Value.get(v) : undefined

  const format = (loc: string, val: string): string => {
    const type = Value.get(options.type)
    const style = resolve(options.style)
    const languageDisplay = resolve(options.languageDisplay)
    const fallback = resolve(options.fallback)
    const dn = new Intl.DisplayNames(loc, {
      type,
      style,
      languageDisplay: type === 'language' ? languageDisplay : undefined,
      fallback,
    })
    return dn.of(val) ?? val
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-display-name'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-display-name'), text)
  })
}
