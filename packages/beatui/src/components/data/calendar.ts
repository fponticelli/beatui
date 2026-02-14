import {
  attr,
  computedOf,
  html,
  on,
  prop,
  Value,
  aria,
} from '@tempots/dom'
import { ControlSize } from '../theme'

/**
 * Configuration options for the {@link Calendar} component.
 */
export interface CalendarOptions {
  /** The currently selected date (year, month, day). */
  value?: Value<Date | null>
  /** Callback invoked when a date is selected. */
  onSelect?: (date: Date) => void
  /** Minimum selectable date. */
  min?: Date
  /** Maximum selectable date. */
  max?: Date
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

const DAYS_IN_WEEK = 7

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isDateInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min != null && date < min) return false
  if (max != null && date > max) return false
  return true
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function generateCalendarClasses(
  size: ControlSize,
  disabled: boolean
): string {
  const classes = ['bc-calendar', `bc-calendar--size-${size}`]
  if (disabled) classes.push('bc-calendar--disabled')
  return classes.join(' ')
}

/**
 * A calendar component for date selection with month/year navigation.
 *
 * Renders a full month grid with day-of-week headers, previous/next month
 * navigation, and support for date range constraints (min/max). The calendar
 * highlights the currently selected date and today's date. Navigation buttons
 * allow moving between months and years.
 *
 * @param options - Configuration for the calendar
 * @returns A calendar element with date selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { Calendar } from '@tempots/beatui'
 *
 * const date = prop<Date | null>(new Date())
 * Calendar({
 *   value: date,
 *   onSelect: date.set,
 * })
 * ```
 *
 * @example
 * ```ts
 * // With date range constraints
 * Calendar({
 *   value: prop(null),
 *   onSelect: (d) => console.log('Selected:', d),
 *   min: new Date(2024, 0, 1),
 *   max: new Date(2024, 11, 31),
 *   weekStartsOn: 1, // Monday
 * })
 * ```
 */
export function Calendar({
  value = null,
  onSelect,
  min,
  max,
  size = 'md',
  disabled = false,
  weekStartsOn = 0,
}: CalendarOptions = {}) {
  const today = new Date()
  const currentYear = prop(
    value != null ? Value.get(value)?.getFullYear() ?? today.getFullYear() : today.getFullYear()
  )
  const currentMonth = prop(
    value != null ? Value.get(value)?.getMonth() ?? today.getMonth() : today.getMonth()
  )

  const prevMonth = () => {
    if (Value.get(disabled)) return
    const m = currentMonth.value
    const y = currentYear.value
    if (m === 0) {
      currentMonth.set(11)
      currentYear.set(y - 1)
    } else {
      currentMonth.set(m - 1)
    }
  }

  const nextMonth = () => {
    if (Value.get(disabled)) return
    const m = currentMonth.value
    const y = currentYear.value
    if (m === 11) {
      currentMonth.set(0)
      currentYear.set(y + 1)
    } else {
      currentMonth.set(m + 1)
    }
  }

  const prevYear = () => {
    if (Value.get(disabled)) return
    currentYear.update(y => y - 1)
  }

  const nextYear = () => {
    if (Value.get(disabled)) return
    currentYear.update(y => y + 1)
  }

  // Shifted day names based on weekStartsOn
  const shiftedDayNames: string[] = []
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    shiftedDayNames.push(DAY_NAMES[(i + weekStartsOn) % DAYS_IN_WEEK]!)
  }

  // Build the grid of day cells reactively
  const gridCells = computedOf(
    currentYear,
    currentMonth,
    value
  )((year, month, selectedDate) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const startOffset = (firstDay - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK

    // Previous month filler days
    const prevMonthDays = getDaysInMonth(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1
    )

    const cells: Array<{
      day: number
      date: Date
      inMonth: boolean
      isToday: boolean
      isSelected: boolean
      isDisabled: boolean
    }> = []

    // Previous month days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const date = new Date(
        month === 0 ? year - 1 : year,
        month === 0 ? 11 : month - 1,
        d
      )
      cells.push({
        day: d,
        date,
        inMonth: false,
        isToday: isSameDay(date, today),
        isSelected: selectedDate != null && isSameDay(date, selectedDate),
        isDisabled: !isDateInRange(date, min, max),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      cells.push({
        day: d,
        date,
        inMonth: true,
        isToday: isSameDay(date, today),
        isSelected: selectedDate != null && isSameDay(date, selectedDate),
        isDisabled: !isDateInRange(date, min, max),
      })
    }

    // Next month filler days (fill to complete last row)
    const remaining = DAYS_IN_WEEK - (cells.length % DAYS_IN_WEEK)
    if (remaining < DAYS_IN_WEEK) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(
          month === 11 ? year + 1 : year,
          month === 11 ? 0 : month + 1,
          d
        )
        cells.push({
          day: d,
          date,
          inMonth: false,
          isToday: isSameDay(date, today),
          isSelected: selectedDate != null && isSameDay(date, selectedDate),
          isDisabled: !isDateInRange(date, min, max),
        })
      }
    }

    return cells
  })

  return html.div(
    attr.class(
      computedOf(size, disabled)((s, d) =>
        generateCalendarClasses(s ?? 'md', d ?? false)
      )
    ),
    attr.role('grid'),
    aria.label('Calendar'),

    // Navigation header
    html.div(
      attr.class('bc-calendar__nav'),
      html.button(
        attr.type('button'),
        attr.class('bc-calendar__nav-btn'),
        attr.disabled(disabled),
        aria.label('Previous year'),
        on.click(e => {
          e.preventDefault()
          prevYear()
        }),
        '\u00AB' // «
      ),
      html.button(
        attr.type('button'),
        attr.class('bc-calendar__nav-btn'),
        attr.disabled(disabled),
        aria.label('Previous month'),
        on.click(e => {
          e.preventDefault()
          prevMonth()
        }),
        '\u2039' // ‹
      ),
      html.span(
        attr.class('bc-calendar__title'),
        computedOf(
          currentYear,
          currentMonth
        )((y, m) => `${MONTH_NAMES[m]} ${y}`)
      ),
      html.button(
        attr.type('button'),
        attr.class('bc-calendar__nav-btn'),
        attr.disabled(disabled),
        aria.label('Next month'),
        on.click(e => {
          e.preventDefault()
          nextMonth()
        }),
        '\u203A' // ›
      ),
      html.button(
        attr.type('button'),
        attr.class('bc-calendar__nav-btn'),
        attr.disabled(disabled),
        aria.label('Next year'),
        on.click(e => {
          e.preventDefault()
          nextYear()
        }),
        '\u00BB' // »
      )
    ),

    // Day-of-week headers
    html.div(
      attr.class('bc-calendar__weekdays'),
      ...shiftedDayNames.map(name =>
        html.div(
          attr.class('bc-calendar__weekday'),
          aria.label(name),
          name
        )
      )
    ),

    // Day grid
    html.div(
      attr.class('bc-calendar__grid'),
      gridCells.map(cells =>
        cells.map(cell => {
          const classes = ['bc-calendar__day']
          if (!cell.inMonth) classes.push('bc-calendar__day--outside')
          if (cell.isToday) classes.push('bc-calendar__day--today')
          if (cell.isSelected) classes.push('bc-calendar__day--selected')
          if (cell.isDisabled) classes.push('bc-calendar__day--disabled')

          return html.button(
            attr.type('button'),
            attr.class(classes.join(' ')),
            attr.disabled(cell.isDisabled || Value.get(disabled)),
            on.click(e => {
              e.preventDefault()
              if (!cell.isDisabled && !Value.get(disabled)) {
                onSelect?.(cell.date)
              }
            }),
            String(cell.day)
          )
        })
      )
    )
  )
}
