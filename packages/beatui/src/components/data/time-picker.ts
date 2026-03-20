import {
  attr,
  computedOf,
  html,
  on,
  Use,
  Value,
  type Renderable,
  type TNode,
  aria,
  Fragment,
  When,
  MapSignal,
  Empty,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { WithTemporal } from '../../temporal/with-temporal'
import type { BeatUITemporal, PlainTime } from '../../temporal/types'
import { BeatUII18n } from '../../beatui-i18n'
import { Locale } from '../i18n'
import { localeUses12Hour } from '../form/input/time-format'

/**
 * Configuration options for the {@link TimePicker} component.
 * Uses Temporal `PlainTime` for time values — no date or timezone concerns.
 */
export interface TimePickerOptions {
  /** The currently selected time. */
  value?: Value<PlainTime | null>
  /** Callback invoked when a time is selected. */
  onSelect?: (time: PlainTime) => void
  /** Whether to show the seconds column. @default false */
  showSeconds?: Value<boolean>
  /** Whether the picker uses 12-hour format with AM/PM. When omitted, auto-detected from the current locale. */
  use12Hour?: Value<boolean>
  /** Theme color for the selected highlight. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Visual size of the time picker. @default 'md' */
  size?: Value<ControlSize>
  /** Whether the time picker is disabled. @default false */
  disabled?: Value<boolean>
  /** Step for minutes column. @default 1 */
  minuteStep?: Value<number>
  /** Step for seconds column. @default 1 */
  secondStep?: Value<number>
  /** Whether to show a "Now" button that sets the time to the current local time. @default false */
  showNow?: Value<boolean>
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function generateTimePickerClasses(
  size: ControlSize,
  disabled: boolean
): string {
  const cls = ['bc-time-picker', `bc-time-picker--size-${size}`]
  if (disabled) cls.push('bc-time-picker--disabled')
  return cls.join(' ')
}

function renderTimePicker(
  T: BeatUITemporal,
  {
    value = null,
    onSelect,
    showSeconds = false,
    use12Hour,
    color = 'primary',
    size = 'md',
    disabled = false,
    minuteStep = 1,
    secondStep = 1,
    showNow = false,
  }: TimePickerOptions
): TNode {
  return Use(Locale, ({ locale }) =>
    Use(BeatUII18n, t => {
      // When use12Hour is not explicitly provided, derive from locale
      const resolvedUse12Hour: Value<boolean> =
        use12Hour != null ? use12Hour : locale.map(localeUses12Hour)
      const colorVar = Value.map(color, c => `--color-${c}-500`)

      const handleSelect = (hour: number, minute: number, second: number) => {
        if (Value.get(disabled)) return
        const time = T.PlainTime.from({ hour, minute, second })
        onSelect?.(time)
      }

      const selectedHour = Value.map(value, v => v?.hour ?? null)
      const selectedMinute = Value.map(value, v => v?.minute ?? null)
      const selectedSecond = Value.map(value, v => v?.second ?? null)

      const currentHour = Value.map(value, v => v?.hour ?? 0)
      const currentMinute = Value.map(value, v => v?.minute ?? 0)
      const currentSecond = Value.map(value, v => v?.second ?? 0)

      const showSecondsBool = Value.toSignal(showSeconds)
      const use12HourBool = Value.toSignal(resolvedUse12Hour)
      const showNowBool = Value.toSignal(showNow)

      // Build hours list (0-23 or 1-12)
      const hourItems = computedOf(use12HourBool)(is12 =>
        is12
          ? Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: String(i + 1),
            }))
          : Array.from({ length: 24 }, (_, i) => ({
              value: i,
              label: pad2(i),
            }))
      )

      const hoursColumn = renderColumn({
        items: hourItems,
        selected: computedOf(
          selectedHour,
          use12HourBool
        )((h, is12) => {
          if (h == null) return null
          if (is12) {
            const h12 = h % 12
            return h12 === 0 ? 12 : h12
          }
          return h
        }),
        disabled,
        colorVar,
        onItemClick: (item: number) => {
          const is12 = Value.get(resolvedUse12Hour)
          let hour = item
          if (is12) {
            const currentVal = Value.get(value)
            const isPm = currentVal != null && currentVal.hour >= 12
            if (item === 12) {
              hour = isPm ? 12 : 0
            } else {
              hour = isPm ? item + 12 : item
            }
          }
          handleSelect(hour, Value.get(currentMinute), Value.get(currentSecond))
        },
        ariaLabel: t.$.timePicker.$.selectHours,
      })

      // Build minutes list
      const minuteStepSignal = Value.toSignal(minuteStep)
      const minuteItems = minuteStepSignal.map(step => {
        const items: Array<{ value: number; label: string }> = []
        for (let i = 0; i < 60; i += step)
          items.push({ value: i, label: pad2(i) })
        return items
      })

      const minutesColumn = renderColumn({
        items: minuteItems,
        selected: selectedMinute,
        disabled,
        colorVar,
        onItemClick: (item: number) => {
          handleSelect(Value.get(currentHour), item, Value.get(currentSecond))
        },
        ariaLabel: t.$.timePicker.$.selectMinutes,
      })

      // Build seconds list
      const secondStepSignal = Value.toSignal(secondStep)
      const secondItems = secondStepSignal.map(step => {
        const items: Array<{ value: number; label: string }> = []
        for (let i = 0; i < 60; i += step)
          items.push({ value: i, label: pad2(i) })
        return items
      })

      const secondsColumn = renderColumn({
        items: secondItems,
        selected: selectedSecond,
        disabled,
        colorVar,
        onItemClick: (item: number) => {
          handleSelect(Value.get(currentHour), Value.get(currentMinute), item)
        },
        ariaLabel: t.$.timePicker.$.selectSeconds,
      })

      // AM/PM column for 12-hour mode
      const amPmColumn = html.div(
        attr.class('bc-time-picker__column'),
        aria.label(t.$.timePicker.$.selectPeriod),
        attr.role('listbox'),
        ...[
          { label: 'AM', isAm: true },
          { label: 'PM', isAm: false },
        ].map(({ label, isAm }) =>
          html.button(
            attr.type('button'),
            attr.class(
              computedOf(
                selectedHour,
                colorVar
              )((h, _cv) => {
                const isSelected = h != null && (isAm ? h < 12 : h >= 12)
                const cls = ['bc-time-picker__item']
                if (isSelected) cls.push('bc-time-picker__item--selected')
                return cls.join(' ')
              })
            ),
            attr.style(
              computedOf(
                selectedHour,
                colorVar
              )((h, cv) => {
                const isSelected = h != null && (isAm ? h < 12 : h >= 12)
                return isSelected ? `--tp-selected-bg: var(${cv})` : ''
              })
            ),
            attr.disabled(disabled),
            attr.role('option'),
            aria.selected(
              Value.map(selectedHour, h =>
                h != null ? (isAm ? h < 12 : h >= 12) : false
              ) as Value<boolean | 'undefined'>
            ),
            on.click(() => {
              if (Value.get(disabled)) return
              const h = Value.get(currentHour)
              let newHour: number
              if (isAm) {
                newHour = h >= 12 ? h - 12 : h
              } else {
                newHour = h < 12 ? h + 12 : h
              }
              handleSelect(
                newHour,
                Value.get(currentMinute),
                Value.get(currentSecond)
              )
            }),
            label
          )
        )
      )

      return html.div(
        attr.class(computedOf(size, disabled)(generateTimePickerClasses)),
        aria.label(t.$.timePicker.$.label),
        attr.role('group'),
        html.div(
          attr.class('bc-time-picker__columns'),
          // Header
          html.div(
            attr.class('bc-time-picker__header'),
            html.span(
              attr.class('bc-time-picker__header-label'),
              t.$.timePicker.$.hoursLabel
            ),
            html.span(
              attr.class('bc-time-picker__header-label'),
              t.$.timePicker.$.minutesLabel
            ),
            When(
              showSecondsBool,
              () =>
                html.span(
                  attr.class('bc-time-picker__header-label'),
                  t.$.timePicker.$.secondsLabel
                ),
              () => Empty
            ),
            When(
              use12HourBool,
              () => html.span(attr.class('bc-time-picker__header-label'), ''),
              () => Empty
            )
          ),
          // Columns
          html.div(
            attr.class('bc-time-picker__body'),
            hoursColumn,
            html.span(attr.class('bc-time-picker__separator'), ':'),
            minutesColumn,
            When(
              showSecondsBool,
              () =>
                Fragment(
                  html.span(attr.class('bc-time-picker__separator'), ':'),
                  secondsColumn
                ),
              () => Empty
            ),
            When(
              use12HourBool,
              () => amPmColumn,
              () => Empty
            )
          ),
          When(
            showNowBool,
            () =>
              html.div(
                attr.class('bc-time-picker__footer'),
                html.button(
                  attr.type('button'),
                  attr.class('bc-time-picker__now-btn'),
                  attr.disabled(disabled),
                  on.click(() => {
                    if (Value.get(disabled)) return
                    const now = T.Now.plainTimeISO()
                    onSelect?.(now)
                  }),
                  t.$.timePicker.$.nowLabel
                )
              ),
            () => Empty
          )
        )
      )
    })
  )
}

interface ColumnItem {
  value: number
  label: string
}

interface ColumnOptions {
  items: Value<ColumnItem[]>
  selected: Value<number | null>
  disabled: Value<boolean>
  colorVar: Value<string>
  onItemClick: (item: number) => void
  ariaLabel: Value<string>
}

function renderColumn(options: ColumnOptions): TNode {
  const { items, selected, disabled, colorVar, onItemClick, ariaLabel } =
    options

  return html.div(
    attr.class('bc-time-picker__column'),
    aria.label(ariaLabel),
    attr.role('listbox'),
    MapSignal(Value.toSignal(items), itemsList =>
      Fragment(
        ...itemsList.map(item =>
          html.button(
            attr.type('button'),
            attr.class(
              computedOf(
                selected,
                colorVar
              )((sel, _cv) => {
                const cls = ['bc-time-picker__item']
                if (sel === item.value)
                  cls.push('bc-time-picker__item--selected')
                return cls.join(' ')
              })
            ),
            attr.style(
              computedOf(
                selected,
                colorVar
              )((sel, cv) =>
                sel === item.value ? `--tp-selected-bg: var(${cv})` : ''
              )
            ),
            attr.disabled(disabled),
            attr.role('option'),
            aria.selected(
              Value.map(selected, s => s === item.value) as Value<
                boolean | 'undefined'
              >
            ),
            on.click(() => onItemClick(item.value)),
            item.label
          )
        )
      )
    )
  )
}

/**
 * A time picker component for selecting hours, minutes, and optionally seconds.
 *
 * Uses Temporal `PlainTime` internally — a time-only type with no date or
 * timezone concerns. Renders scrollable columns for hours and minutes (and
 * optionally seconds), with support for 12-hour format with AM/PM.
 *
 * @param options - Configuration for the time picker
 * @returns A time picker element with time selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { TimePicker } from '@tempots/beatui'
 * import { Temporal } from '@js-temporal/polyfill'
 *
 * const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))
 * TimePicker({
 *   value: time,
 *   onSelect: time.set,
 * })
 * ```
 */
export function TimePicker(options?: TimePickerOptions): Renderable {
  return WithTemporal(T => renderTimePicker(T, options ?? {}))
}
