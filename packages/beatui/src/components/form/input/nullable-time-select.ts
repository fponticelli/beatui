import {
  type TNode,
  Value,
  type Merge,
  Fragment,
  Use,
  computedOf,
} from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { TimeSelectShell } from './time-select-base'
import { TimePicker } from '../../data/time-picker'
import { NullableResetAfter } from './nullable-utils'
import type { PlainTime } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'
import { defaultMessages } from '../../../beatui-i18n'
import { Locale } from '../../i18n'
import { localeUses12Hour, formatTimeAuto } from './time-format'

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
 * When no custom `formatTime` is provided, the display adapts to the
 * locale's 12/24-hour convention (or the explicit `use12Hour` prop).
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
    use12Hour,
    minuteStep,
    secondStep,
    showNow,
    formatTime,
    placeholder = defaultMessages.timeSelectTime,
    disabled,
    ...rest
  } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)
  const afterContent =
    rest.after != null ? Fragment(resetAfter, rest.after) : resetAfter

  const pickerNode = TimePicker({
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
  })

  // When a custom formatTime is provided, use it directly
  if (formatTime != null) {
    const displayText = Value.map(value, v =>
      v != null ? formatTime(v) : placeholder
    )

    return TimeSelectShell({
      ...rest,
      disabled,
      displayText,
      after: afterContent,
      panelContent: pickerNode,
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
    )((v, h12, sec): string =>
      v != null ? formatTimeAuto(v, h12, sec) : placeholder
    )

    return TimeSelectShell({
      ...rest,
      disabled,
      displayText,
      after: afterContent,
      panelContent: pickerNode,
    })
  })
}
