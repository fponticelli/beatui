import { html, attr, TNode, Value, Use, computedOf } from '@tempots/dom'
import { Locale } from '../i18n/locale'
import { formatFileSize } from '../../utils/format-file-size'

/**
 * Options for the {@link FormatFileSize} component.
 */
export interface FormatFileSizeComponentOptions {
  /** Byte count to format. @default 1536000 */
  value: Value<number | bigint>
  /** BCP 47 locale override. If omitted, uses the Locale provider. @default undefined */
  locale?: Value<string>
  /** Unit labels. @default ['B', 'KB', 'MB', 'GB', 'TB'] */
  units?: string[]
  /** Decimal places for non-byte units. @default 0 */
  decimalPlaces?: Value<number>
}

/**
 * Locale-aware file size formatting component.
 *
 * Wraps the existing {@link formatFileSize} utility as a reactive component
 * that reads the locale from the Locale provider.
 *
 * @param options - Configuration for the file size format
 * @returns A reactive `<span>` containing the formatted file size
 *
 * @example
 * ```ts
 * FormatFileSize({ value: 1024 })          // '1 KB'
 * FormatFileSize({ value: 1536, decimalPlaces: 1 }) // '1.5 KB'
 * ```
 */
export function FormatFileSize(options: FormatFileSizeComponentOptions): TNode {
  const { value, locale: localeOverride, units } = options

  const format = (loc: string, val: number | bigint): string =>
    formatFileSize(val, {
      locale: loc,
      units,
      decimalPlaces:
        options.decimalPlaces !== undefined
          ? Value.get(options.decimalPlaces)
          : undefined,
    })

  if (localeOverride !== undefined) {
    const text = computedOf(localeOverride, value)(format)
    return html.span(attr.class('bc-format-file-size'), text)
  }

  return Use(Locale, ({ locale }) => {
    const text = computedOf(locale, value)(format)
    return html.span(attr.class('bc-format-file-size'), text)
  })
}
