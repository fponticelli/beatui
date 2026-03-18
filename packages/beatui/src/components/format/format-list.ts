import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * List semantics type for `Intl.ListFormat`.
 */
export type FormatListType = 'conjunction' | 'disjunction' | 'unit'

/**
 * Format verbosity for list formatting.
 */
export type FormatListStyle = 'long' | 'short' | 'narrow'

/**
 * Options for `Intl.ListFormat` (polyfill for ES2020 lib).
 */
interface ListFormatOptions {
  type?: FormatListType
  style?: FormatListStyle
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ListFormat = (Intl as any).ListFormat as {
  new (
    locale?: string,
    options?: ListFormatOptions
  ): { format(list: string[]): string }
}

/**
 * Options for the {@link FormatList} component.
 */
export interface FormatListOptions {
  /** Array of string items to join. @default undefined */
  value: Value<string[]>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** List semantics. @default 'conjunction' */
  type?: Value<FormatListType>
  /** Format verbosity. @default 'long' */
  style?: Value<FormatListStyle>
}

/**
 * Formats a list of strings with locale and Intl options.
 *
 * @param value - Array of strings to join
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - ListFormat options
 * @returns The formatted list string
 *
 * @example
 * ```ts
 * formatList(['Red', 'Green', 'Blue'], 'en-US')          // 'Red, Green, and Blue'
 * formatList(['A', 'B'], 'en-US', { type: 'disjunction' }) // 'A or B'
 * ```
 */
export function formatList(
  value: string[],
  locale?: string,
  options?: ListFormatOptions
): string {
  return new ListFormat(locale, options).format(value)
}

/**
 * Locale-aware list formatting component.
 *
 * Renders a formatted list (e.g., "A, B, and C") as a `<span>` that
 * automatically updates when the locale or value changes.
 *
 * @param options - Configuration for the list format
 * @returns A reactive `<span>` containing the formatted list
 *
 * @example
 * ```ts
 * FormatList({ value: ['Red', 'Green', 'Blue'] })
 * FormatList({ value: ['A', 'B'], type: 'disjunction' })
 * ```
 */
export function FormatList(options: FormatListOptions): TNode {
  const { value, locale: localeOverride } = options

  const resolve = <T>(v: Value<T> | undefined): T | undefined =>
    v !== undefined ? Value.get(v) : undefined

  const format = (loc: string, val: string[]): string => {
    const intlOpts: ListFormatOptions = {}
    const type = resolve(options.type)
    const style = resolve(options.style)
    if (type !== undefined) intlOpts.type = type
    if (style !== undefined) intlOpts.style = style
    return new ListFormat(loc, intlOpts).format(val)
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-list'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-list'), text)
  })
}
