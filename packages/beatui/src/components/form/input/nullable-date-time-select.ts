import {
  type TNode,
  Value,
  type Merge,
  Fragment,
  html,
  attr,
  Use,
  computedOf,
} from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { DateTimeSelectShell } from './date-time-select-base'
import { DatePicker } from '../../data/date-picker'
import { TimePicker } from '../../data/time-picker'
import { NullableResetAfter } from './nullable-utils'
import type {
  PlainDate,
  PlainDateTime,
  PlainTime,
} from '../../../temporal/types'
import { WithTemporal } from '../../../temporal/with-temporal'
import { ThemeColorName } from '../../../tokens'
import { defaultMessages } from '../../../beatui-i18n'
import { Locale } from '../../i18n'
import { localeUses12Hour, formatTimeAuto } from './time-format'

/**
 * Configuration options for the {@link NullableDateTimeSelect} component.
 */
export type NullableDateTimeSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected date-time, or null when unset. */
    value: Value<PlainDateTime | null>
    /** Callback invoked when the date-time changes (receives null when cleared). */
    onChange?: (dateTime: PlainDateTime | null) => void
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
    /** Placeholder shown when no date-time is selected. @default i18n dateTimeSelectDateTime */
    placeholder?: string
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

function formatDatePart(dt: PlainDateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`
}

/**
 * A dropdown date-time selector where the value may be null.
 *
 * Displays the selected date-time in a styled trigger button, or a placeholder
 * when nothing is selected. A reset (clear) button is shown when a date-time
 * is set, allowing the user to clear back to null.
 *
 * When no custom `formatDateTime` is provided, the time portion adapts to the
 * locale's 12/24-hour convention (or the explicit `use12Hour` prop).
 *
 * Use {@link DateTimeSelect} when a date-time is always required.
 *
 * @param options - Configuration for the nullable date-time selector
 * @returns A nullable date-time selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { NullableDateTimeSelect } from '@tempots/beatui'
 *
 * const dt = prop<PlainDateTime | null>(null)
 * NullableDateTimeSelect({
 *   value: dt,
 *   onChange: dt.set,
 *   placeholder: 'Select date and time',
 * })
 * ```
 */
export function NullableDateTimeSelect(
  options: NullableDateTimeSelectOptions
): TNode {
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
    placeholder = defaultMessages.dateTimeSelectDateTime,
    disabled,
    ...rest
  } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)
  const afterContent =
    rest.after != null ? Fragment(resetAfter, rest.after) : resetAfter

  return WithTemporal(T => {
    const now = T.Now.plainDateTimeISO()

    const handleDateSelect = (date: PlainDate) => {
      const current = Value.get(value) ?? now
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

    const handleTimeSelect = (time: {
      hour: number
      minute: number
      second: number
    }) => {
      const current = Value.get(value) ?? now
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
      v != null
        ? T.PlainDate.from({ year: v.year, month: v.month, day: v.day })
        : null
    )
    const timeValue = Value.map(value, (v): PlainTime | null =>
      v != null
        ? T.PlainTime.from({
            hour: v.hour,
            minute: v.minute,
            second: v.second,
          })
        : null
    )

    const panelContent = html.div(
      attr.class('bc-date-time-select__pickers'),
      DatePicker({
        value: dateValue,
        onSelect: handleDateSelect,
        isDateDisabled,
        color,
        size: options.size,
        disabled,
        weekStartsOn,
      }),
      html.div(attr.class('bc-date-time-select__separator')),
      TimePicker({
        value: timeValue,
        onSelect: handleTimeSelect as (time: unknown) => void,
        color,
        size: options.size,
        disabled,
        showSeconds,
        use12Hour,
        minuteStep,
        secondStep,
        showNow,
      })
    )

    // Custom format: use it directly
    if (formatDateTime != null) {
      const displayText = Value.map(value, v =>
        v != null ? formatDateTime(v) : placeholder
      )
      return DateTimeSelectShell({
        ...rest,
        disabled,
        displayText,
        after: afterContent,
        panelContent,
      })
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
      )((v, h12, sec): string => {
        if (v == null) return placeholder
        const d = formatDatePart(v)
        const timePart = formatTimeAuto(v, h12, sec)
        return `${d} \u00b7 ${timePart}`
      })

      return DateTimeSelectShell({
        ...rest,
        disabled,
        displayText,
        after: afterContent,
        panelContent,
      })
    })
  })
}
