import { type TNode, Value, type Merge, computedOf } from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { DateRangeSelectShell } from './date-range-select-base'
import { DateRangePicker } from '../../data/date-range-picker'
import type { PlainDate } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'

/**
 * A date range as a `[start, end]` tuple where both dates are required.
 */
export type DateRange = [PlainDate, PlainDate]

/**
 * Configuration options for the {@link DateRangeSelect} component.
 *
 * Both start and end dates are required. Use {@link OpenDateRangeSelect}
 * if either end can be null/undefined.
 */
export type DateRangeSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected date range as `[start, end]`. */
    value: Value<DateRange>
    /** Callback invoked when the range changes. */
    onChange?: (range: DateRange) => void
    /** Callback invoked on blur. */
    onBlur?: () => void
    /** Predicate returning true if a date should be disabled. */
    isDateDisabled?: (date: PlainDate) => boolean
    /** Theme color. @default 'primary' */
    color?: Value<ThemeColorName>
    /** The day the week starts on (0=Sun, 1=Mon). @default 0 */
    weekStartsOn?: Value<number>
    /** Format a PlainDate for display. Defaults to ISO string. */
    formatDate?: (date: PlainDate) => string
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

/**
 * A date range selector using a single calendar with range highlighting.
 *
 * Displays the selected range in a styled trigger button. Clicking opens a
 * flyout panel with a {@link DateRangePicker} — a single calendar where the
 * user clicks to set the start date, then clicks again to set the end date,
 * with a hover preview showing the prospective range.
 *
 * Use {@link OpenDateRangeSelect} if either date can be null/undefined.
 *
 * @param options - Configuration for the date range selector
 * @returns A date range selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateRangeSelect } from '@tempots/beatui'
 * import { Temporal } from '@js-temporal/polyfill'
 *
 * const range = prop<DateRange>([
 *   Temporal.PlainDate.from('2026-01-01'),
 *   Temporal.PlainDate.from('2026-01-31'),
 * ])
 * DateRangeSelect({
 *   value: range,
 *   onChange: range.set,
 * })
 * ```
 */
export function DateRangeSelect(options: DateRangeSelectOptions): TNode {
  const {
    value,
    onChange,
    isDateDisabled,
    color = 'primary',
    weekStartsOn = 0,
    formatDate = (d: PlainDate) => d.toString(),
    ...rest
  } = options

  const displayText = computedOf(value)(v => {
    return `${formatDate(v[0])}  →  ${formatDate(v[1])}`
  })

  return DateRangeSelectShell({
    ...rest,
    displayText,
    panelContent: DateRangePicker({
      value: Value.map(value, (v): [PlainDate, PlainDate] | null => v),
      onChange,
      isDateDisabled,
      color,
      size: options.size,
      disabled: options.disabled,
      weekStartsOn,
    }),
  })
}
