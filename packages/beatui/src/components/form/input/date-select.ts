import { type TNode, Value, type Merge } from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { DateRangeSelectShell } from './date-range-select-base'
import { DatePicker } from '../../data/date-picker'
import type { PlainDate } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'

/**
 * Configuration options for the {@link DateSelect} component.
 */
export type DateSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected date. */
    value: Value<PlainDate>
    /** Callback invoked when the date changes. */
    onChange?: (date: PlainDate) => void
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
 * A dropdown single-date selector.
 *
 * Displays the selected date in a styled trigger button. Clicking opens a
 * flyout panel with a {@link DatePicker} for selecting a date.
 *
 * Use {@link NullableDateSelect} when the date can be null/unset.
 *
 * @param options - Configuration for the date selector
 * @returns A date selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateSelect } from '@tempots/beatui'
 * import { Temporal } from '@js-temporal/polyfill'
 *
 * const date = prop(Temporal.Now.plainDateISO())
 * DateSelect({
 *   value: date,
 *   onChange: v => date.set(v),
 * })
 * ```
 */
export function DateSelect(options: DateSelectOptions): TNode {
  const {
    value,
    onChange,
    isDateDisabled,
    color = 'primary',
    weekStartsOn = 0,
    formatDate = (d: PlainDate) => d.toString(),
    ...rest
  } = options

  const displayText = Value.map(value, v => formatDate(v))

  return DateRangeSelectShell({
    ...rest,
    displayText,
    panelContent: DatePicker({
      value: Value.map(value, (v): PlainDate | null => v),
      onSelect: date => onChange?.(date),
      isDateDisabled,
      color,
      size: options.size,
      disabled: options.disabled,
      weekStartsOn,
    }),
  })
}
