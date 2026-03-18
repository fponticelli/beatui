import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * Style of number formatting.
 */
export type FormatNumberStyle = 'decimal' | 'currency' | 'percent' | 'unit'

/**
 * Currency display mode when style is 'currency'.
 */
export type FormatNumberCurrencyDisplay =
  | 'symbol'
  | 'narrowSymbol'
  | 'code'
  | 'name'

/**
 * How to display the sign for the number.
 */
export type FormatNumberSignDisplay = 'auto' | 'never' | 'always' | 'exceptZero'

/**
 * Notation style for number formatting.
 */
export type FormatNumberNotation =
  | 'standard'
  | 'scientific'
  | 'engineering'
  | 'compact'

/**
 * Options for the {@link FormatNumber} component.
 */
export interface FormatNumberOptions {
  /** The number to format. @default 1234.56 */
  value: Value<number>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Formatting style. @default 'decimal' */
  style?: Value<FormatNumberStyle>
  /** ISO 4217 currency code (required when style is 'currency'). @default undefined */
  currency?: Value<string>
  /** How to display the currency. @default 'symbol' */
  currencyDisplay?: Value<FormatNumberCurrencyDisplay>
  /** Sign display mode. @default 'auto' */
  signDisplay?: Value<FormatNumberSignDisplay>
  /** Notation. @default 'standard' */
  notation?: Value<FormatNumberNotation>
  /** Compact display mode (used when notation is 'compact'). @default undefined */
  compactDisplay?: Value<'short' | 'long'>
  /** Unit identifier (e.g., 'kilometer', 'liter') for style 'unit'. @default undefined */
  unit?: Value<string>
  /** Unit display mode. @default 'short' */
  unitDisplay?: Value<'short' | 'long' | 'narrow'>
  /** Use grouping separators (e.g., thousand commas). @default true */
  useGrouping?: Value<boolean>
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

function resolve<T>(v: Value<T> | undefined): T | undefined {
  return v !== undefined ? Value.get(v) : undefined
}

function buildOptions(opts: FormatNumberOptions): Intl.NumberFormatOptions {
  const o: Intl.NumberFormatOptions = {}
  const style = resolve(opts.style)
  const currency = resolve(opts.currency)
  const currencyDisplay = resolve(opts.currencyDisplay)
  const signDisplay = resolve(opts.signDisplay)
  const notation = resolve(opts.notation)
  const compactDisplay = resolve(opts.compactDisplay)
  const unit = resolve(opts.unit)
  const unitDisplay = resolve(opts.unitDisplay)
  const useGrouping = resolve(opts.useGrouping)
  const minimumIntegerDigits = resolve(opts.minimumIntegerDigits)
  const minimumFractionDigits = resolve(opts.minimumFractionDigits)
  const maximumFractionDigits = resolve(opts.maximumFractionDigits)
  const minimumSignificantDigits = resolve(opts.minimumSignificantDigits)
  const maximumSignificantDigits = resolve(opts.maximumSignificantDigits)
  if (style !== undefined) o.style = style
  if (currency !== undefined) o.currency = currency
  if (currencyDisplay !== undefined) o.currencyDisplay = currencyDisplay
  if (signDisplay !== undefined) o.signDisplay = signDisplay
  if (notation !== undefined) o.notation = notation
  if (compactDisplay !== undefined) o.compactDisplay = compactDisplay
  if (unit !== undefined) o.unit = unit
  if (unitDisplay !== undefined) o.unitDisplay = unitDisplay
  if (useGrouping !== undefined) o.useGrouping = useGrouping
  if (minimumIntegerDigits !== undefined)
    o.minimumIntegerDigits = minimumIntegerDigits
  if (minimumFractionDigits !== undefined)
    o.minimumFractionDigits = minimumFractionDigits
  if (maximumFractionDigits !== undefined)
    o.maximumFractionDigits = maximumFractionDigits
  if (minimumSignificantDigits !== undefined)
    o.minimumSignificantDigits = minimumSignificantDigits
  if (maximumSignificantDigits !== undefined)
    o.maximumSignificantDigits = maximumSignificantDigits
  return o
}

/**
 * Formats a number with locale and Intl options.
 *
 * @param value - The number to format
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.NumberFormat options
 * @returns The formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234.5, 'en-US')              // '1,234.5'
 * formatNumber(1234, 'en-US', { style: 'currency', currency: 'EUR' }) // '€1,234.00'
 * formatNumber(0.85, 'en-US', { style: 'percent' }) // '85%'
 * ```
 */
export function formatNumber(
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Locale-aware number formatting component.
 *
 * Renders a formatted number as a `<span>` that automatically updates when
 * the locale or value changes. Supports decimal, currency, percent, unit,
 * and compact notation styles.
 *
 * @param options - Configuration for the number format
 * @returns A reactive `<span>` containing the formatted number
 *
 * @example
 * ```ts
 * FormatNumber({ value: 1234.5 })
 * FormatNumber({ value: 1234, style: 'currency', currency: 'EUR' })
 * FormatNumber({ value: 0.85, style: 'percent' })
 * ```
 */
export function FormatNumber(options: FormatNumberOptions): TNode {
  const { value, locale: localeOverride } = options

  const format = (loc: string, val: number): string => {
    const intlOpts = buildOptions(options)
    return new Intl.NumberFormat(loc, intlOpts).format(val)
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-number'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-number'), text)
  })
}
