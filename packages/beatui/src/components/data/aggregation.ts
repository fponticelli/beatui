/**
 * Supported aggregation functions for column footers.
 */
export type AggregationFunction = 'sum' | 'count' | 'avg' | 'min' | 'max'

/**
 * Configuration for a column aggregation.
 */
export interface ColumnAggregation {
  /** Aggregation function to apply */
  fn: AggregationFunction
  /** Custom formatter for the result. @default `String(value)` */
  format?: (value: number) => string
  /** Label displayed before the value (e.g., "Total:"). Uses i18n default if omitted. */
  label?: string
}

/**
 * Compute an aggregate value over an array of raw column values.
 *
 * Non-numeric values are coerced via `Number()`.  `NaN` values are excluded
 * from all calculations except `count`, which counts every element.
 */
export function computeAggregation(
  values: unknown[],
  fn: AggregationFunction
): number {
  if (fn === 'count') return values.length

  const nums = values.map(Number).filter(n => !Number.isNaN(n))
  if (nums.length === 0) return 0

  switch (fn) {
    case 'sum':
      return nums.reduce((a, b) => a + b, 0)
    case 'avg':
      return nums.reduce((a, b) => a + b, 0) / nums.length
    case 'min':
      return Math.min(...nums)
    case 'max':
      return Math.max(...nums)
  }
}
