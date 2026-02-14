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
  buildCalendarGrid,
  createCalendarNav,
  renderCalendarShell,
  plainDateToDate,
  dateToPlainDate,
} from './calendar-shared'

/**
 * Configuration options for the {@link Calendar} component.
 * Uses Temporal `PlainDate` for date values — no time or timezone concerns.
 */
export interface CalendarOptions {
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
  /** Visual size of the calendar. @default 'md' */
  size?: Value<ControlSize>
  /** Whether the calendar is disabled. @default false */
  disabled?: Value<boolean>
  /**
   * The day the week starts on.
   * 0 = Sunday, 1 = Monday, etc.
   * @default 0
   */
  weekStartsOn?: number
}

/**
 * Configuration options for the {@link DateCalendar} component.
 * Convenience wrapper that uses JavaScript `Date` objects.
 */
export interface DateCalendarOptions {
  /** The currently selected date (year, month, day). */
  value?: Value<Date | null>
  /** Callback invoked when a date is selected. */
  onSelect?: (date: Date) => void
  /**
   * Predicate that returns `true` if the given date should be disabled (unselectable).
   * Replaces min/max — use e.g. `d => d < minDate || d > maxDate` for range constraints.
   */
  isDateDisabled?: (date: Date) => boolean
  /** Theme color for selected and today highlights. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Visual size of the calendar. @default 'md' */
  size?: Value<ControlSize>
  /** Whether the calendar is disabled. @default false */
  disabled?: Value<boolean>
  /**
   * The day the week starts on.
   * 0 = Sunday, 1 = Monday, etc.
   * @default 0
   */
  weekStartsOn?: number
}

function renderCalendar(
  T: BeatUITemporal,
  {
    value = null,
    onSelect,
    isDateDisabled,
    color = 'primary',
    size = 'md',
    disabled = false,
    weekStartsOn = 0,
  }: CalendarOptions
): TNode {
  const initialDate = value != null ? Value.get(value) : null
  const nav = createCalendarNav(
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
    return buildCalendarGrid(
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

  return renderCalendarShell(
    nav,
    { size, disabled, color, ariaLabel: 'Calendar' },
    () =>
      html.div(
        attr.class('bc-calendar__grid'),
        ForEach(gridCells, cellSignal => {
          const classes = cellSignal.map(cell => {
            const cls = ['bc-calendar__day']
            if (!cell.inMonth) cls.push('bc-calendar__day--outside')
            if (cell.isToday) cls.push('bc-calendar__day--today')
            if (cell.isSelected) cls.push('bc-calendar__day--selected')
            if (cell.isDisabled) cls.push('bc-calendar__day--disabled')
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
 * A calendar component for date selection with month/year navigation.
 *
 * Uses Temporal `PlainDate` internally — a date-only type with no time or
 * timezone concerns, 1-based months, and proper date arithmetic.
 *
 * Renders a full month grid with day-of-week headers, previous/next month
 * navigation, and a flexible `isDateDisabled` predicate for controlling which
 * dates are selectable. The calendar highlights the currently selected date
 * and today's date. Navigation buttons allow moving between months and years.
 *
 * @param options - Configuration for the calendar
 * @returns A calendar element with date selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { Calendar, PlainDate } from '@tempots/beatui'
 *
 * const date = prop<PlainDate | null>(null)
 * Calendar({
 *   value: date,
 *   onSelect: date.set,
 * })
 * ```
 */
export function Calendar(options?: CalendarOptions): Renderable {
  return WithTemporal(T => renderCalendar(T, options ?? {}))
}

/**
 * A convenience calendar wrapper that uses JavaScript `Date` objects.
 *
 * Accepts and fires `Date` values, converting to/from `PlainDate` internally.
 * Use this when integrating with existing `Date`-based code.
 *
 * @param options - Configuration for the calendar (uses `Date` objects)
 * @returns A calendar element with date selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateCalendar } from '@tempots/beatui'
 *
 * const date = prop<Date | null>(new Date())
 * DateCalendar({
 *   value: date,
 *   onSelect: date.set,
 * })
 * ```
 */
export function DateCalendar(options?: DateCalendarOptions): Renderable {
  const { value, onSelect, isDateDisabled, ...rest } = options ?? {}

  return WithTemporal(T => {
    const plainValue: Value<PlainDate | null> | undefined =
      value != null
        ? Value.map(value, d =>
            d != null ? dateToPlainDate(T, d) : null
          )
        : undefined

    const plainOnSelect: ((pd: PlainDate) => void) | undefined = onSelect
      ? pd => onSelect(plainDateToDate(pd))
      : undefined

    const plainIsDateDisabled: ((pd: PlainDate) => boolean) | undefined =
      isDateDisabled
        ? pd => isDateDisabled(plainDateToDate(pd))
        : undefined

    return renderCalendar(T, {
      ...rest,
      value: plainValue,
      onSelect: plainOnSelect,
      isDateDisabled: plainIsDateDisabled,
    })
  })
}
