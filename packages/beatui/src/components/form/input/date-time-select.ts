import {
  type TNode,
  Value,
  type Merge,
  html,
  attr,
  Use,
  computedOf,
} from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { DateTimeSelectShell } from './date-time-select-base'
import { DatePicker } from '../../data/date-picker'
import { TimePicker } from '../../data/time-picker'
import type {
  PlainDate,
  PlainDateTime,
  PlainTime,
} from '../../../temporal/types'
import { WithTemporal } from '../../../temporal/with-temporal'
import { ThemeColorName } from '../../../tokens'
import { Locale } from '../../i18n'
import { localeUses12Hour, formatTimeAuto } from './time-format'

/**
 * Configuration options for the {@link DateTimeSelect} component.
 */
export type DateTimeSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected date-time. */
    value: Value<PlainDateTime>
    /** Callback invoked when the date-time changes. */
    onChange?: (dateTime: PlainDateTime) => void
    /** Callback invoked on blur. */
    onBlur?: () => void
    /** Predicate returning true if a date should be disabled. */
    isDateDisabled?: (date: PlainDate) => boolean
    /** Theme color. @default 'primary' */
    color?: Value<ThemeColorName>
    /** The day the week starts on (0=Sun, 1=Mon). @default 0 */
    weekStartsOn?: Value<number>
    /** Whether to show seconds in the time picker. @default false */
    showSeconds?: Value<boolean>
    /** Whether to use 12-hour format. When omitted, auto-detected from locale. */
    use12Hour?: Value<boolean>
    /** Step for minutes column. @default 1 */
    minuteStep?: Value<number>
    /** Step for seconds column. @default 1 */
    secondStep?: Value<number>
    /** Whether to show a "Now" button in the time picker. @default false */
    showNow?: Value<boolean>
    /** Format a PlainDateTime for display. When omitted, uses locale-aware 12/24-hour format. */
    formatDateTime?: (dt: PlainDateTime) => string
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

function formatDate(dt: PlainDateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`
}

/**
 * A dropdown date-time selector combining a date picker and time picker.
 *
 * Displays the selected date-time in a styled trigger button. Clicking opens a
 * flyout panel with a {@link DatePicker} and {@link TimePicker} side by side,
 * separated by a visual divider.
 *
 * When no custom `formatDateTime` is provided, the time portion adapts to the
 * locale's 12/24-hour convention (or the explicit `use12Hour` prop).
 *
 * Use {@link NullableDateTimeSelect} when the date-time can be null/unset.
 *
 * @param options - Configuration for the date-time selector
 * @returns A date-time selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateTimeSelect } from '@tempots/beatui'
 * import { Temporal } from '@js-temporal/polyfill'
 *
 * const dt = prop(Temporal.Now.plainDateTimeISO())
 * DateTimeSelect({
 *   value: dt,
 *   onChange: dt.set,
 * })
 * ```
 */
export function DateTimeSelect(options: DateTimeSelectOptions): TNode {
  const {
    value,
    onChange,
    isDateDisabled,
    color = 'primary',
    weekStartsOn = 0,
    showSeconds = false,
    use12Hour,
    minuteStep,
    secondStep,
    showNow,
    formatDateTime,
    ...rest
  } = options

  return WithTemporal(T => {
    const handleDateSelect = (date: PlainDate) => {
      const current = Value.get(value)
      const updated = T.PlainDateTime.from({
        year: date.year,
        month: date.month,
        day: date.day,
        hour: current.hour,
        minute: current.minute,
        second: current.second,
      })
      onChange?.(updated)
    }

    const handleTimeSelect = (time: PlainTime) => {
      const current = Value.get(value)
      const updated = T.PlainDateTime.from({
        year: current.year,
        month: current.month,
        day: current.day,
        hour: time.hour,
        minute: time.minute,
        second: time.second,
      })
      onChange?.(updated)
    }

    const dateValue = Value.map(value, (v): PlainDate | null =>
      T.PlainDate.from({ year: v.year, month: v.month, day: v.day })
    )
    const timeValue = Value.map(value, (v): PlainTime | null =>
      T.PlainTime.from({ hour: v.hour, minute: v.minute, second: v.second })
    )

    const panelContent = html.div(
      attr.class('bc-date-time-select__pickers'),
      DatePicker({
        value: dateValue,
        onSelect: handleDateSelect,
        isDateDisabled,
        color,
        size: options.size,
        disabled: options.disabled,
        weekStartsOn,
      }),
      html.div(attr.class('bc-date-time-select__separator')),
      TimePicker({
        value: timeValue,
        onSelect: handleTimeSelect,
        color,
        size: options.size,
        disabled: options.disabled,
        showSeconds,
        use12Hour,
        minuteStep,
        secondStep,
        showNow,
      })
    )

    // Custom format: use it directly
    if (formatDateTime != null) {
      const displayText = Value.map(value, v => formatDateTime(v))
      return DateTimeSelectShell({ ...rest, displayText, panelContent })
    }

    // Auto format: locale-aware time portion
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
      )((v, h12, sec) => {
        const d = formatDate(v)
        const timePart = formatTimeAuto(v, h12, sec)
        return `${d} \u00b7 ${timePart}`
      })

      return DateTimeSelectShell({ ...rest, displayText, panelContent })
    })
  })
}
