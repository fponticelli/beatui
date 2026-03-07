import {
  attr,
  computedOf,
  html,
  on,
  Value,
  ForEach,
  type Renderable,
  type TNode,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { WithTemporal } from '../../temporal/with-temporal'
import type { BeatUITemporal, PlainDate } from '../../temporal/types'
import {
  buildDatePickerGrid,
  createDatePickerNav,
  renderDatePickerShell,
} from './date-picker-shared'

/**
 * Configuration options for the {@link DatePicker} component.
 * Uses Temporal `PlainDate` for date values — no time or timezone concerns.
 */
export interface DatePickerOptions {
  /** The currently selected date. */
  value?: Value<PlainDate | null>
  /** Callback invoked when a date is selected. */
  onSelect?: (date: PlainDate) => void
  /**
   * Predicate that returns `true` if the given date should be disabled (unselectable).
   * Replaces min/max — use e.g. `d => PlainDate.compare(d, minDate) < 0` for range constraints.
   */
  isDateDisabled?: (date: PlainDate) => boolean
  /** Theme color for selected and today highlights. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Visual size of the date picker. @default 'md' */
  size?: Value<ControlSize>
  /** Whether the date picker is disabled. @default false */
  disabled?: Value<boolean>
  /**
   * The day the week starts on.
   * 0 = Sunday, 1 = Monday, etc.
   * @default 0
   */
  weekStartsOn?: number
}

function renderDatePicker(
  T: BeatUITemporal,
  {
    value = null,
    onSelect,
    isDateDisabled,
    color = 'primary',
    size = 'md',
    disabled = false,
    weekStartsOn = 0,
  }: DatePickerOptions
): TNode {
  const initialDate = value != null ? Value.get(value) : null
  const nav = createDatePickerNav(
    T,
    initialDate?.year ?? T.Now.plainDateISO().year,
    initialDate?.month ?? T.Now.plainDateISO().month,
    disabled,
    weekStartsOn
  )

  // Build the grid of day cells reactively
  const gridCells = computedOf(
    nav.currentYear,
    nav.currentMonth,
    value
  )((year, month, selectedDate) => {
    return buildDatePickerGrid(
      T,
      year,
      month,
      weekStartsOn,
      nav.today,
      isDateDisabled
    ).map(cell => ({
      ...cell,
      isSelected: selectedDate != null && cell.date.equals(selectedDate),
    }))
  })

  return renderDatePickerShell(
    nav,
    { size, disabled, color, ariaLabel: 'Date picker' },
    () =>
      html.div(
        attr.class('bc-date-picker__grid'),
        ForEach(gridCells, cellSignal => {
          const classes = cellSignal.map(cell => {
            const cls = ['bc-date-picker__day']
            if (!cell.inMonth) cls.push('bc-date-picker__day--outside')
            if (cell.isToday) cls.push('bc-date-picker__day--today')
            if (cell.isSelected) cls.push('bc-date-picker__day--selected')
            if (cell.isDisabled) cls.push('bc-date-picker__day--disabled')
            return cls.join(' ')
          })

          const isDisabled = cellSignal.map(cell => cell.isDisabled)
          const day = cellSignal.map(cell => String(cell.day))

          return html.button(
            attr.type('button'),
            attr.class(classes),
            attr.disabled(
              computedOf(
                isDisabled,
                disabled
              )((cDisabled, gDisabled) => cDisabled || gDisabled)
            ),
            on.click(e => {
              e.preventDefault()
              const cell = Value.get(cellSignal)
              if (!cell.isDisabled && !Value.get(disabled)) {
                if (!cell.inMonth) {
                  nav.currentYear.set(cell.date.year)
                  nav.currentMonth.set(cell.date.month)
                }
                onSelect?.(cell.date)
              }
            }),
            day
          )
        })
      )
  )
}

/**
 * A date picker component for date selection with month/year navigation.
 *
 * Uses Temporal `PlainDate` internally — a date-only type with no time or
 * timezone concerns, 1-based months, and proper date arithmetic.
 *
 * Renders a full month grid with day-of-week headers, previous/next month
 * navigation, and a flexible `isDateDisabled` predicate for controlling which
 * dates are selectable. The date picker highlights the currently selected date
 * and today's date. Navigation buttons allow moving between months and years.
 *
 * @param options - Configuration for the date picker
 * @returns A date picker element with date selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DatePicker, PlainDate } from '@tempots/beatui'
 *
 * const date = prop<PlainDate | null>(null)
 * DatePicker({
 *   value: date,
 *   onSelect: date.set,
 * })
 * ```
 */
export function DatePicker(options?: DatePickerOptions): Renderable {
  return WithTemporal(T => renderDatePicker(T, options ?? {}))
}
