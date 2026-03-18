import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'

/**
 * Options for the {@link FormatBigInt} component.
 *
 * Separate from FormatNumber because `bigint` values cannot use `percent`,
 * `compact`, or significant digit options with `Intl.NumberFormat`.
 */
export interface FormatBigIntOptions {
  /** The bigint value to format. @default 9007199254740993 */
  value: Value<bigint>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Formatting style. @default 'decimal' */
  style?: Value<'decimal' | 'currency' | 'unit'>
  /** ISO 4217 currency code (required when style is 'currency'). @default undefined */
  currency?: Value<string>
  /** How to display the currency. @default 'symbol' */
  currencyDisplay?: Value<'symbol' | 'narrowSymbol' | 'code' | 'name'>
  /** Sign display mode. @default 'auto' */
  signDisplay?: Value<'auto' | 'never' | 'always' | 'exceptZero'>
  /** Unit identifier (e.g., 'kilometer') for style 'unit'. @default undefined */
  unit?: Value<string>
  /** Unit display mode. @default 'short' */
  unitDisplay?: Value<'short' | 'long' | 'narrow'>
  /** Use grouping separators. @default true */
  useGrouping?: Value<boolean>
  /** Minimum integer digits. @default undefined */
  minimumIntegerDigits?: Value<number>
  /** Minimum fraction digits. @default undefined */
  minimumFractionDigits?: Value<number>
  /** Maximum fraction digits. @default undefined */
  maximumFractionDigits?: Value<number>
}

function resolve<T>(v: Value<T> | undefined): T | undefined {
  return v !== undefined ? Value.get(v) : undefined
}

function buildOptions(opts: FormatBigIntOptions): Intl.NumberFormatOptions {
  const o: Intl.NumberFormatOptions = {}
  const style = resolve(opts.style)
  const currency = resolve(opts.currency)
  const currencyDisplay = resolve(opts.currencyDisplay)
  const signDisplay = resolve(opts.signDisplay)
  const unit = resolve(opts.unit)
  const unitDisplay = resolve(opts.unitDisplay)
  const useGrouping = resolve(opts.useGrouping)
  const minimumIntegerDigits = resolve(opts.minimumIntegerDigits)
  const minimumFractionDigits = resolve(opts.minimumFractionDigits)
  const maximumFractionDigits = resolve(opts.maximumFractionDigits)
  if (style !== undefined) o.style = style
  if (currency !== undefined) o.currency = currency
  if (currencyDisplay !== undefined) o.currencyDisplay = currencyDisplay
  if (signDisplay !== undefined) o.signDisplay = signDisplay
  if (unit !== undefined) o.unit = unit
  if (unitDisplay !== undefined) o.unitDisplay = unitDisplay
  if (useGrouping !== undefined) o.useGrouping = useGrouping
  if (minimumIntegerDigits !== undefined)
    o.minimumIntegerDigits = minimumIntegerDigits
  if (minimumFractionDigits !== undefined)
    o.minimumFractionDigits = minimumFractionDigits
  if (maximumFractionDigits !== undefined)
    o.maximumFractionDigits = maximumFractionDigits
  return o
}

/**
 * Formats a bigint value with locale and Intl options.
 *
 * @param value - The bigint to format
 * @param locale - BCP 47 locale string (uses browser default if omitted)
 * @param options - Intl.NumberFormat options
 * @returns The formatted bigint string
 *
 * @example
 * ```ts
 * formatBigInt(9007199254740993n, 'en-US') // '9,007,199,254,740,993'
 * formatBigInt(123456789n, 'en-US', { style: 'currency', currency: 'JPY' }) // '¥123,456,789'
 * ```
 */
export function formatBigInt(
  value: bigint,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Locale-aware bigint formatting component.
 *
 * Renders a formatted bigint as a `<span>` that automatically updates when
 * the locale or value changes. Supports decimal, currency, and unit styles.
 *
 * @param options - Configuration for the bigint format
 * @returns A reactive `<span>` containing the formatted bigint
 *
 * @example
 * ```ts
 * FormatBigInt({ value: 9007199254740993n })
 * FormatBigInt({ value: 123456789n, style: 'currency', currency: 'JPY' })
 * ```
 */
export function FormatBigInt(options: FormatBigIntOptions): TNode {
  const { value, locale: localeOverride } = options

  const format = (loc: string, val: bigint): string => {
    const intlOpts = buildOptions(options)
    return new Intl.NumberFormat(loc, intlOpts).format(val)
  }

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-bigint'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-bigint'), text)
  })
}
