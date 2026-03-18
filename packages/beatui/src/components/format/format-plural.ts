import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * CLDR plural category returned by `Intl.PluralRules`.
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

/**
 * Plural rule type: 'cardinal' for counting, 'ordinal' for ordering.
 */
export type PluralType = 'cardinal' | 'ordinal'

/**
 * A mapping from plural category to the string to display.
 * The `other` category is required as a fallback.
 * Strings may contain `{count}` which is replaced with the locale-formatted number.
 */
export type PluralMessages = Partial<Record<PluralCategory, string>> & {
  /** Required fallback for any unmatched category. */
  other: string
}

/**
 * Options for the {@link FormatPlural} component.
 */
export interface FormatPluralOptions {
  /** The numeric value to determine plural category for. @default 3 @min 0 @max 1000 @step 1 */
  value: Value<number>
  /** Mapping from plural category to display string. Supports {count} interpolation. */
  messages: PluralMessages
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Plural rule type. @default 'cardinal' */
  type?: Value<PluralType>
  /** Minimum integer digits. @default undefined */
  minimumIntegerDigits?: Value<number>
  /** Minimum fraction digits. @default undefined */
  minimumFractionDigits?: Value<number>
  /** Maximum fraction digits. @default undefined */
  maximumFractionDigits?: Value<number>
  /** Minimum significant digits. @default undefined */
  minimumSignificantDigits?: Value<number>
  /** Maximum significant digits. @default undefined */
  maximumSignificantDigits?: Value<number>
}

/**
 * Resolves the CLDR plural category for a number.
 *
 * @param value - The number to categorize
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.PluralRules options
 * @returns The plural category
 *
 * @example
 * ```ts
 * resolvePluralCategory(1, 'en-US')  // 'one'
 * resolvePluralCategory(5, 'en-US')  // 'other'
 * resolvePluralCategory(3, 'en-US', { type: 'ordinal' }) // 'few'
 * ```
 */
export function resolvePluralCategory(
  value: number,
  locale?: string,
  options?: Intl.PluralRulesOptions
): PluralCategory {
  return new Intl.PluralRules(locale, options).select(value) as PluralCategory
}

/**
 * Selects a message based on the plural category of a number and replaces
 * `{count}` with the locale-formatted number.
 *
 * @param value - The number to categorize
 * @param messages - Plural messages mapping
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.PluralRules options
 * @returns The selected and interpolated message string
 *
 * @example
 * ```ts
 * formatPlural(1, { one: '{count} item', other: '{count} items' }, 'en-US')    // '1 item'
 * formatPlural(5, { one: '{count} item', other: '{count} items' }, 'en-US')    // '5 items'
 * formatPlural(1000, { one: '{count} item', other: '{count} items' }, 'de-DE') // '1.000 items'
 * ```
 */
export function formatPlural(
  value: number,
  messages: PluralMessages,
  locale?: string,
  options?: Intl.PluralRulesOptions
): string {
  const category = resolvePluralCategory(value, locale, options)
  const template = messages[category] ?? messages.other
  const formatted = new Intl.NumberFormat(locale).format(value)
  return template.replace(/\{count\}/g, formatted)
}

/**
 * Locale-aware plural formatting component.
 *
 * Selects a message from a plural category map based on the value and renders
 * it as a `<span>` that automatically updates when the locale or value changes.
 * The `{count}` placeholder in messages is replaced with the locale-formatted number.
 *
 * @param options - Configuration for the plural format
 * @returns A reactive `<span>` containing the selected plural message
 *
 * @example
 * ```ts
 * FormatPlural({ value: 1, messages: { one: '{count} item', other: '{count} items' } })
 * FormatPlural({
 *   value: 3,
 *   type: 'ordinal',
 *   messages: { one: '{count}st', two: '{count}nd', few: '{count}rd', other: '{count}th' },
 * })
 * ```
 */
export function FormatPlural(options: FormatPluralOptions): TNode {
  const { value, messages, locale: localeOverride } = options

  const resolve = <T>(v: Value<T> | undefined): T | undefined =>
    v !== undefined ? Value.get(v) : undefined

  const format = (loc: string, val: number): string => {
    const prOpts: Intl.PluralRulesOptions = {}
    const type = resolve(options.type)
    const minimumIntegerDigits = resolve(options.minimumIntegerDigits)
    const minimumFractionDigits = resolve(options.minimumFractionDigits)
    const maximumFractionDigits = resolve(options.maximumFractionDigits)
    const minimumSignificantDigits = resolve(options.minimumSignificantDigits)
    const maximumSignificantDigits = resolve(options.maximumSignificantDigits)
    if (type !== undefined) prOpts.type = type
    if (minimumIntegerDigits !== undefined)
      prOpts.minimumIntegerDigits = minimumIntegerDigits
    if (minimumFractionDigits !== undefined)
      prOpts.minimumFractionDigits = minimumFractionDigits
    if (maximumFractionDigits !== undefined)
      prOpts.maximumFractionDigits = maximumFractionDigits
    if (minimumSignificantDigits !== undefined)
      prOpts.minimumSignificantDigits = minimumSignificantDigits
    if (maximumSignificantDigits !== undefined)
      prOpts.maximumSignificantDigits = maximumSignificantDigits
    const category = new Intl.PluralRules(loc, prOpts).select(val)
    const template = messages[category as PluralCategory] ?? messages.other
    const formatted = new Intl.NumberFormat(loc).format(val)
    return template.replace(/\{count\}/g, formatted)
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-plural'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-plural'), text)
  })
}
