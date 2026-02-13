/**
 * File size formatting utilities for BeatUI.
 *
 * Provides human-readable file size formatting with locale-aware number formatting,
 * configurable units, and support for both `number` and `bigint` inputs.
 *
 * @module
 */

/**
 * Options for configuring file size formatting behavior.
 */
export type FormatFileSizeOptions = {
  /**
   * Array of unit labels from smallest to largest.
   * @default ['B', 'KB', 'MB', 'GB', 'TB']
   */
  units?: string[]
  /**
   * Number of decimal places to show for values above bytes.
   * @default 0
   */
  decimalPlaces?: number
  /**
   * BCP 47 locale string for number formatting (e.g., `'en-US'`, `'de-DE'`).
   * Uses the browser default locale if not specified.
   */
  locale?: string
}

/**
 * Formats a byte count into a human-readable file size string using
 * `Intl.NumberFormat` for locale-aware formatting.
 *
 * Automatically selects the most appropriate unit (B, KB, MB, GB, TB) based
 * on the magnitude. Supports both `number` and `bigint` inputs for handling
 * very large file sizes without precision loss.
 *
 * @param bytes - The file size in bytes (supports `number` or `bigint`)
 * @param options - Formatting options
 * @returns A formatted file size string (e.g., `'1 KB'`, `'2.5 MB'`)
 *
 * @example
 * ```ts
 * formatFileSize(0)                           // '0 B'
 * formatFileSize(1024)                        // '1 KB'
 * formatFileSize(1536, { decimalPlaces: 1 })  // '1.5 KB'
 * formatFileSize(1073741824n)                 // '1 GB'
 * formatFileSize(1024, { locale: 'de-DE' })   // '1 KB' (with German formatting)
 * ```
 */
export function formatFileSize(
  bytes: number | bigint,
  {
    units = ['B', 'KB', 'MB', 'GB', 'TB'],
    decimalPlaces = 0,
    locale,
  }: FormatFileSizeOptions = {}
): string {
  if (bytes === 0 || bytes === 0n) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'byte',
      unitDisplay: 'short',
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace('byte', units[0])
  }

  let unitIndex: number
  let value: number

  if (typeof bytes === 'bigint') {
    // Handle bigint without losing precision
    const absBytes = bytes < 0n ? -bytes : bytes
    let tempBytes = absBytes
    unitIndex = 0

    // Find the appropriate unit by dividing by 1024 until we get a manageable size
    while (tempBytes >= 1024n && unitIndex < units.length - 1) {
      tempBytes = tempBytes / 1024n
      unitIndex++
    }

    // Convert to number only after we've reduced to a manageable size
    value = Number(bytes) / Math.pow(1024, unitIndex)
  } else {
    // Handle regular number
    unitIndex = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024))
    const clampedIndex = Math.min(unitIndex, units.length - 1)
    unitIndex = clampedIndex
    value = bytes / Math.pow(1024, unitIndex)
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'short',
    minimumFractionDigits: unitIndex === 0 ? 0 : decimalPlaces,
    maximumFractionDigits: unitIndex === 0 ? 0 : decimalPlaces,
  })

  return formatter.format(value).replace('byte', units[unitIndex])
}
