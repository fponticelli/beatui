import { type TNode, Value, type Merge, Fragment } from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { DateRangeSelectShell } from './date-range-select-base'
import { DatePicker } from '../../data/date-picker'
import { NullableResetAfter } from './nullable-utils'
import type { PlainDate } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'
import { defaultMessages } from '../../../beatui-i18n'

/**
 * Configuration options for the {@link NullableDateSelect} component.
 */
export type NullableDateSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected date, or null when unset. */
    value: Value<PlainDate | null>
    /** Callback invoked when the date changes (receives null when cleared). */
    onChange?: (date: PlainDate | null) => void
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
    /** Placeholder shown when no date is selected. @default i18n dateRangeSelectDate */
    placeholder?: string
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

/**
 * A dropdown single-date selector where the value may be null.
 *
 * Displays the selected date in a styled trigger button, or a placeholder when
 * no date is selected. A reset (clear) button is shown in the trigger when a
 * date is set, allowing the user to clear back to null.
 *
 * Use {@link DateSelect} when a date is always required.
 *
 * @param options - Configuration for the nullable date selector
 * @returns A nullable date selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { NullableDateSelect } from '@tempots/beatui'
 *
 * const date = prop<PlainDate | null>(null)
 * NullableDateSelect({
 *   value: date,
 *   onChange: v => date.set(v),
 *   placeholder: 'Select a date',
 * })
 * ```
 */
export function NullableDateSelect(options: NullableDateSelectOptions): TNode {
  const {
    value,
    onChange,
    isDateDisabled,
    color = 'primary',
    weekStartsOn = 0,
    formatDate = (d: PlainDate) => d.toString(),
    placeholder = defaultMessages.dateRangeSelectDate,
    disabled,
    ...rest
  } = options

  const displayText = Value.map(value, v =>
    v != null ? formatDate(v) : placeholder
  )

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return DateRangeSelectShell({
    ...rest,
    disabled,
    displayText,
    after: rest.after != null ? Fragment(resetAfter, rest.after) : resetAfter,
    panelContent: DatePicker({
      value,
      onSelect: date => onChange?.(date),
      isDateDisabled,
      color,
      size: options.size,
      disabled,
      weekStartsOn,
    }),
  })
}
