import {
  attr,
  computedOf,
  html,
  on,
  prop,
  Value,
  aria,
  ForEach,
  OneOfValue,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { backgroundValue } from '../theme/style-utils'

const YEARS_PER_PAGE = 20

/**
 * Configuration options for the {@link Calendar} component.
 */
export interface CalendarOptions {
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

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type CalendarView = 'days' | 'months' | 'years'

function generateCalendarClasses(size: ControlSize, disabled: boolean): string {
  const classes = ['bc-calendar', `bc-calendar--size-${size}`]
  if (disabled) classes.push('bc-calendar--disabled')
  return classes.join(' ')
}

function generateCalendarStyles(color: ThemeColorName): string {
  const light = backgroundValue(color, 'solid', 'light')
  const dark = backgroundValue(color, 'solid', 'dark')
  const lightSubtle = backgroundValue(color, 'light', 'light')
  const darkSubtle = backgroundValue(color, 'light', 'dark')
  return [
    `--cal-selected-bg: ${light.backgroundColor}`,
    `--cal-selected-text: ${light.textColor}`,
    `--cal-selected-bg-dark: ${dark.backgroundColor}`,
    `--cal-selected-text-dark: ${dark.textColor}`,
    `--cal-today-bg: ${lightSubtle.backgroundColor}`,
    `--cal-today-text: ${lightSubtle.textColor}`,
    `--cal-today-bg-dark: ${darkSubtle.backgroundColor}`,
    `--cal-today-text-dark: ${darkSubtle.textColor}`,
  ].join('; ')
}

/**
 * A calendar component for date selection with month/year navigation.
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
 * const min = new Date(2024, 0, 1)
 * const max = new Date(2024, 11, 31)
 * Calendar({
 *   value: prop(null),
 *   onSelect: (d) => console.log('Selected:', d),
 *   isDateDisabled: d => d < min || d > max,
 *   weekStartsOn: 1, // Monday
 * })
 * ```
 */
export function Calendar({
  value = null,
  onSelect,
  isDateDisabled,
  color = 'primary',
  size = 'md',
  disabled = false,
  weekStartsOn = 0,
}: CalendarOptions = {}) {
  const today = new Date()
  const currentYear = prop(
    value != null
      ? (Value.get(value)?.getFullYear() ?? today.getFullYear())
      : today.getFullYear()
  )
  const currentMonth = prop(
    value != null
      ? (Value.get(value)?.getMonth() ?? today.getMonth())
      : today.getMonth()
  )

  const view = prop<CalendarView>('days')
  const yearPageStart = prop(
    Math.floor(currentYear.value / YEARS_PER_PAGE) * YEARS_PER_PAGE
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

  const prevYearPage = () => {
    if (Value.get(disabled)) return
    yearPageStart.update(y => y - YEARS_PER_PAGE)
  }

  const nextYearPage = () => {
    if (Value.get(disabled)) return
    yearPageStart.update(y => y + YEARS_PER_PAGE)
  }

  const switchToMonthsView = () => {
    if (Value.get(disabled)) return
    view.set('months')
  }

  const switchToYearsView = () => {
    if (Value.get(disabled)) return
    // Update yearPageStart to center around currentYear
    const yr = currentYear.value
    yearPageStart.set(Math.floor(yr / YEARS_PER_PAGE) * YEARS_PER_PAGE)
    view.set('years')
  }

  const selectMonth = (monthIndex: number) => {
    if (Value.get(disabled)) return
    currentMonth.set(monthIndex)
    view.set('days')
  }

  const selectYear = (year: number) => {
    if (Value.get(disabled)) return
    currentYear.set(year)
    view.set('months')
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
        isDisabled: isDateDisabled?.(date) ?? false,
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
        isDisabled: isDateDisabled?.(date) ?? false,
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
          isDisabled: isDateDisabled?.(date) ?? false,
        })
      }
    }

    return cells
  })

  return html.div(
    attr.class(computedOf(size, disabled)(generateCalendarClasses)),
    attr.style(Value.map(color, generateCalendarStyles)),
    attr.role('grid'),
    aria.label('Calendar'),

    // Navigation header
    OneOfValue(view, {
      days: () =>
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
          html.div(
            attr.class('bc-calendar__title'),
            html.button(
              attr.type('button'),
              attr.class('bc-calendar__title-btn'),
              attr.disabled(disabled),
              aria.label('Select month'),
              on.click(e => {
                e.preventDefault()
                switchToMonthsView()
              }),
              Value.map(currentMonth, m => MONTH_NAMES[m]!)
            ),
            html.button(
              attr.type('button'),
              attr.class('bc-calendar__title-btn'),
              attr.disabled(disabled),
              aria.label('Select year'),
              on.click(e => {
                e.preventDefault()
                switchToYearsView()
              }),
              Value.map(currentYear, String)
            )
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
      months: () =>
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
          html.span(
            attr.class('bc-calendar__title'),
            Value.map(currentYear, String)
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
      years: () =>
        html.div(
          attr.class('bc-calendar__nav'),
          html.button(
            attr.type('button'),
            attr.class('bc-calendar__nav-btn'),
            attr.disabled(disabled),
            aria.label(`Previous ${YEARS_PER_PAGE} years`),
            on.click(e => {
              e.preventDefault()
              prevYearPage()
            }),
            '\u00AB' // «
          ),
          html.span(
            attr.class('bc-calendar__title'),
            Value.map(
              yearPageStart,
              start => `${start} \u2013 ${start + YEARS_PER_PAGE - 1}`
            )
          ),
          html.button(
            attr.type('button'),
            attr.class('bc-calendar__nav-btn'),
            attr.disabled(disabled),
            aria.label(`Next ${YEARS_PER_PAGE} years`),
            on.click(e => {
              e.preventDefault()
              nextYearPage()
            }),
            '\u00BB' // »
          )
        ),
    }),

    // Content area (view-specific)
    OneOfValue(view, {
      days: () =>
        html.div(
          attr.class('bc-calendar__days-view'),
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
                      currentYear.set(cell.date.getFullYear())
                      currentMonth.set(cell.date.getMonth())
                    }
                    onSelect?.(cell.date)
                  }
                }),
                day
              )
            })
          )
        ),
      months: () =>
        html.div(
          attr.class(
            'bc-calendar__picker-grid bc-calendar__picker-grid--months'
          ),
          ...SHORT_MONTH_NAMES.map((monthName, monthIndex) =>
            html.button(
              attr.type('button'),
              attr.class(
                computedOf(
                  currentMonth,
                  currentYear
                )((m, y) => {
                  const cls = ['bc-calendar__month-cell']
                  if (m === monthIndex)
                    cls.push('bc-calendar__month-cell--current')
                  if (
                    today.getMonth() === monthIndex &&
                    today.getFullYear() === y
                  )
                    cls.push('bc-calendar__month-cell--active')
                  return cls.join(' ')
                })
              ),
              attr.disabled(disabled),
              on.click(e => {
                e.preventDefault()
                selectMonth(monthIndex)
              }),
              monthName
            )
          )
        ),
      years: () =>
        html.div(
          attr.class(
            'bc-calendar__picker-grid bc-calendar__picker-grid--years'
          ),
          ForEach(
            Value.map(yearPageStart, start => {
              const years: number[] = []
              for (let i = 0; i < YEARS_PER_PAGE; i++) {
                years.push(start + i)
              }
              return years
            }),
            yearSignal =>
              html.button(
                attr.type('button'),
                attr.class(
                  computedOf(
                    currentYear,
                    yearSignal
                  )((cy, year) => {
                    const cls = ['bc-calendar__year-cell']
                    if (cy === year) cls.push('bc-calendar__year-cell--current')
                    if (today.getFullYear() === year)
                      cls.push('bc-calendar__year-cell--active')
                    return cls.join(' ')
                  })
                ),
                attr.disabled(disabled),
                on.click(e => {
                  e.preventDefault()
                  selectYear(Value.get(yearSignal))
                }),
                Value.map(yearSignal, String)
              )
          )
        ),
    })
  )
}
