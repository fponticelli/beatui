import { type TNode, Value, type Merge, Fragment } from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { TimeSelectShell } from './time-select-base'
import { TimePicker } from '../../data/time-picker'
import { NullableResetAfter } from './nullable-utils'
import type { PlainTime } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'
import { defaultMessages } from '../../../beatui-i18n'

/**
 * Configuration options for the {@link NullableTimeSelect} component.
 */
export type NullableTimeSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected time, or null when unset. */
    value: Value<PlainTime | null>
    /** Callback invoked when the time changes (receives null when cleared). */
    onChange?: (time: PlainTime | null) => void
    /** Callback invoked on blur. */
    onBlur?: () => void
    /** Theme color. @default 'primary' */
    color?: Value<ThemeColorName>
    /** Whether to show seconds. @default false */
    showSeconds?: Value<boolean>
    /** Whether to use 12-hour format. @default false */
    use12Hour?: Value<boolean>
    /** Step for minutes column. @default 1 */
    minuteStep?: Value<number>
    /** Step for seconds column. @default 1 */
    secondStep?: Value<number>
    /** Whether to show a "Now" button. @default false */
    showNow?: Value<boolean>
    /** Format a PlainTime for display. Defaults to HH:MM or HH:MM:SS. */
    formatTime?: (time: PlainTime) => string
    /** Placeholder shown when no time is selected. @default i18n timeSelectTime */
    placeholder?: string
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

/**
 * A dropdown time selector where the value may be null.
 *
 * Displays the selected time in a styled trigger button, or a placeholder when
 * no time is selected. A reset (clear) button is shown in the trigger when a
 * time is set, allowing the user to clear back to null.
 *
 * Use {@link TimeSelect} when a time is always required.
 *
 * @param options - Configuration for the nullable time selector
 * @returns A nullable time selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { NullableTimeSelect } from '@tempots/beatui'
 *
 * const time = prop<PlainTime | null>(null)
 * NullableTimeSelect({
 *   value: time,
 *   onChange: time.set,
 *   placeholder: 'Select a time',
 * })
 * ```
 */
export function NullableTimeSelect(options: NullableTimeSelectOptions): TNode {
  const {
    value,
    onChange,
    color = 'primary',
    showSeconds = false,
    use12Hour = false,
    minuteStep,
    secondStep,
    showNow,
    formatTime = (t: PlainTime) => t.toString({ smallestUnit: 'minute' }),
    placeholder = defaultMessages.timeSelectTime,
    disabled,
    ...rest
  } = options

  const displayText = Value.map(value, v =>
    v != null ? formatTime(v) : placeholder
  )

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return TimeSelectShell({
    ...rest,
    disabled,
    displayText,
    after: rest.after != null ? Fragment(resetAfter, rest.after) : resetAfter,
    panelContent: TimePicker({
      value,
      onSelect: time => onChange?.(time),
      color,
      size: options.size,
      disabled,
      showSeconds,
      use12Hour,
      minuteStep,
      secondStep,
      showNow,
    }),
  })
}
