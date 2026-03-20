import { type TNode, Value, type Merge } from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { TimeSelectShell } from './time-select-base'
import { TimePicker } from '../../data/time-picker'
import type { PlainTime } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'

/**
 * Configuration options for the {@link TimeSelect} component.
 */
export type TimeSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected time. */
    value: Value<PlainTime>
    /** Callback invoked when the time changes. */
    onChange?: (time: PlainTime) => void
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
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

/**
 * A dropdown time selector.
 *
 * Displays the selected time in a styled trigger button. Clicking opens a
 * flyout panel with a {@link TimePicker} for selecting a time.
 *
 * Use {@link NullableTimeSelect} when the time can be null/unset.
 *
 * @param options - Configuration for the time selector
 * @returns A time selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { TimeSelect } from '@tempots/beatui'
 * import { Temporal } from '@js-temporal/polyfill'
 *
 * const time = prop(Temporal.PlainTime.from('14:30'))
 * TimeSelect({
 *   value: time,
 *   onChange: time.set,
 * })
 * ```
 */
export function TimeSelect(options: TimeSelectOptions): TNode {
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
    ...rest
  } = options

  const displayText = Value.map(value, v => formatTime(v))

  return TimeSelectShell({
    ...rest,
    displayText,
    panelContent: TimePicker({
      value: Value.map(value, (v): PlainTime | null => v),
      onSelect: time => onChange?.(time),
      color,
      size: options.size,
      disabled: options.disabled,
      showSeconds,
      use12Hour,
      minuteStep,
      secondStep,
      showNow,
    }),
  })
}
