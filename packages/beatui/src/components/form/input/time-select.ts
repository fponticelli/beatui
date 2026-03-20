import { type TNode, Value, type Merge, Use, computedOf } from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { TimeSelectShell } from './time-select-base'
import { TimePicker } from '../../data/time-picker'
import type { PlainTime } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'
import { Locale } from '../../i18n'
import { localeUses12Hour, formatTimeAuto } from './time-format'

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
    /** Whether to use 12-hour format. When omitted, auto-detected from the current locale. */
    use12Hour?: Value<boolean>
    /** Step for minutes column. @default 1 */
    minuteStep?: Value<number>
    /** Step for seconds column. @default 1 */
    secondStep?: Value<number>
    /** Whether to show a "Now" button. @default false */
    showNow?: Value<boolean>
    /** Format a PlainTime for display. When omitted, uses locale-aware 12/24-hour format. */
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
 * When no custom `formatTime` is provided, the display adapts to the
 * locale's 12/24-hour convention (or the explicit `use12Hour` prop).
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
    use12Hour,
    minuteStep,
    secondStep,
    showNow,
    formatTime,
    ...rest
  } = options

  // When a custom formatTime is provided, use it directly
  if (formatTime != null) {
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

  // Otherwise, derive format from locale / use12Hour
  return Use(Locale, ({ locale }) => {
    const is12 =
      use12Hour != null
        ? Value.toSignal(use12Hour)
        : locale.map(localeUses12Hour)

    const ss = Value.toSignal(showSeconds)
    const displayText = computedOf(
      value,
      is12,
      ss
    )((v, h12, sec) => formatTimeAuto(v, h12, sec))

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
  })
}
