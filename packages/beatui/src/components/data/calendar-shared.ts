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
  type Prop,
  type TNode,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { backgroundValue } from '../theme/style-utils'
import type { BeatUITemporal, PlainDate } from '../../temporal/types'

export const YEARS_PER_PAGE = 20
export const DAYS_IN_WEEK = 7

export const MONTH_NAMES = [
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

export const SHORT_MONTH_NAMES = [
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

export const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export type CalendarView = 'days' | 'months' | 'years'

export function generateCalendarClasses(
  size: ControlSize,
  disabled: boolean
): string {
  const classes = ['bc-calendar', `bc-calendar--size-${size}`]
  if (disabled) classes.push('bc-calendar--disabled')
  return classes.join(' ')
}

export function generateCalendarStyles(color: ThemeColorName): string {
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

/** Base cell data computed by {@link buildCalendarGrid}. */
export interface CalendarBaseCell {
  day: number
  date: PlainDate
  inMonth: boolean
  isToday: boolean
  isDisabled: boolean
}

/** Builds the base array of day cells for a given month. */
export function buildCalendarGrid(
  T: BeatUITemporal,
  year: number,
  month: number,
  weekStartsOn: number,
  today: PlainDate,
  isDateDisabled?: (date: PlainDate) => boolean
): CalendarBaseCell[] {
  const firstOfMonth = T.PlainDate.from({ year, month, day: 1 })
  const daysInMonth = firstOfMonth.daysInMonth
  // dayOfWeek: 1=Mon..7=Sun (ISO). Convert to 0=Sun..6=Sat via % 7.
  const firstDay = firstOfMonth.dayOfWeek % 7
  const startOffset = (firstDay - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK

  const prevMonthDate = firstOfMonth.subtract({ months: 1 })
  const prevMonthDays = prevMonthDate.daysInMonth

  const cells: CalendarBaseCell[] = []

  const makeCell = (date: PlainDate, day: number, inMonth: boolean) => {
    cells.push({
      day,
      date,
      inMonth,
      isToday: date.equals(today),
      isDisabled: isDateDisabled?.(date) ?? false,
    })
  }

  // Previous month days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    makeCell(prevMonthDate.with({ day: d }), d, false)
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    makeCell(T.PlainDate.from({ year, month, day: d }), d, true)
  }

  // Next month filler days (fill to complete last row)
  const remaining = DAYS_IN_WEEK - (cells.length % DAYS_IN_WEEK)
  if (remaining < DAYS_IN_WEEK) {
    const nextMonthDate = firstOfMonth.add({ months: 1 })
    for (let d = 1; d <= remaining; d++) {
      makeCell(nextMonthDate.with({ day: d }), d, false)
    }
  }

  return cells
}

/** State and actions returned by {@link createCalendarNav}. */
export interface CalendarNav {
  today: PlainDate
  currentYear: Prop<number>
  currentMonth: Prop<number>
  view: Prop<CalendarView>
  yearPageStart: Prop<number>
  shiftedDayNames: string[]
  prevMonth: () => void
  nextMonth: () => void
  prevYear: () => void
  nextYear: () => void
  prevYearPage: () => void
  nextYearPage: () => void
  switchToMonthsView: () => void
  switchToYearsView: () => void
  selectMonth: (month: number) => void
  selectYear: (year: number) => void
}

/** Creates the shared navigation state for a calendar. */
export function createCalendarNav(
  T: BeatUITemporal,
  initialYear: number,
  initialMonth: number,
  disabled: Value<boolean>,
  weekStartsOn: number
): CalendarNav {
  const today = T.Now.plainDateISO()
  const currentYear = prop(initialYear)
  const currentMonth = prop(initialMonth)
  const view = prop<CalendarView>('days')
  const yearPageStart = prop(
    Math.floor(initialYear / YEARS_PER_PAGE) * YEARS_PER_PAGE
  )

  const shiftedDayNames: string[] = []
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    shiftedDayNames.push(DAY_NAMES[(i + weekStartsOn) % DAYS_IN_WEEK]!)
  }

  return {
    today,
    currentYear,
    currentMonth,
    view,
    yearPageStart,
    shiftedDayNames,
    prevMonth: () => {
      if (Value.get(disabled)) return
      const m = currentMonth.value
      const y = currentYear.value
      if (m === 1) {
        currentMonth.set(12)
        currentYear.set(y - 1)
      } else {
        currentMonth.set(m - 1)
      }
    },
    nextMonth: () => {
      if (Value.get(disabled)) return
      const m = currentMonth.value
      const y = currentYear.value
      if (m === 12) {
        currentMonth.set(1)
        currentYear.set(y + 1)
      } else {
        currentMonth.set(m + 1)
      }
    },
    prevYear: () => {
      if (Value.get(disabled)) return
      currentYear.update(y => y - 1)
    },
    nextYear: () => {
      if (Value.get(disabled)) return
      currentYear.update(y => y + 1)
    },
    prevYearPage: () => {
      if (Value.get(disabled)) return
      yearPageStart.update(y => y - YEARS_PER_PAGE)
    },
    nextYearPage: () => {
      if (Value.get(disabled)) return
      yearPageStart.update(y => y + YEARS_PER_PAGE)
    },
    switchToMonthsView: () => {
      if (Value.get(disabled)) return
      view.set('months')
    },
    switchToYearsView: () => {
      if (Value.get(disabled)) return
      const yr = currentYear.value
      yearPageStart.set(Math.floor(yr / YEARS_PER_PAGE) * YEARS_PER_PAGE)
      view.set('years')
    },
    selectMonth: (month: number) => {
      if (Value.get(disabled)) return
      currentMonth.set(month)
      view.set('days')
    },
    selectYear: (year: number) => {
      if (Value.get(disabled)) return
      currentYear.set(year)
      view.set('months')
    },
  }
}

export interface CalendarShellOptions {
  size: Value<ControlSize>
  disabled: Value<boolean>
  color: Value<ThemeColorName>
  ariaLabel: string
}

/**
 * Renders the full calendar shell: outer wrapper, navigation header
 * (days/months/years), weekday headers, month picker, year picker,
 * and a custom day grid.
 */
export function renderCalendarShell(
  nav: CalendarNav,
  opts: CalendarShellOptions,
  renderGrid: () => TNode
): TNode {
  const { size, disabled, color, ariaLabel } = opts
  const {
    today,
    currentYear,
    currentMonth,
    view,
    yearPageStart,
    prevMonth,
    nextMonth,
    prevYear,
    nextYear,
    prevYearPage,
    nextYearPage,
    switchToMonthsView,
    switchToYearsView,
    selectMonth,
    selectYear,
  } = nav

  return html.div(
    attr.class(computedOf(size, disabled)(generateCalendarClasses)),
    attr.style(Value.map(color, generateCalendarStyles)),
    attr.role('grid'),
    aria.label(ariaLabel),

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
            '\u00AB'
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
            '\u2039'
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
              Value.map(currentMonth, m => MONTH_NAMES[m - 1]!)
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
            '\u203A'
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
            '\u00BB'
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
            '\u00AB'
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
            '\u00BB'
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
            '\u00AB'
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
            '\u00BB'
          )
        ),
    }),

    // Content area
    OneOfValue(view, {
      days: () =>
        html.div(
          attr.class('bc-calendar__days-view'),
          html.div(
            attr.class('bc-calendar__weekdays'),
            ...nav.shiftedDayNames.map(name =>
              html.div(attr.class('bc-calendar__weekday'), name)
            )
          ),
          renderGrid()
        ),
      months: () =>
        html.div(
          attr.class(
            'bc-calendar__picker-grid bc-calendar__picker-grid--months'
          ),
          ...SHORT_MONTH_NAMES.map((monthName, monthIndex) => {
            const month1 = monthIndex + 1
            return html.button(
              attr.type('button'),
              attr.class(
                computedOf(
                  currentMonth,
                  currentYear
                )((m, y) => {
                  const cls = ['bc-calendar__month-cell']
                  if (m === month1) cls.push('bc-calendar__month-cell--current')
                  if (today.month === month1 && today.year === y)
                    cls.push('bc-calendar__month-cell--active')
                  return cls.join(' ')
                })
              ),
              attr.disabled(disabled),
              on.click(e => {
                e.preventDefault()
                selectMonth(month1)
              }),
              monthName
            )
          })
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
                    if (today.year === year)
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

/** Converts a `PlainDate` to a JavaScript `Date` (local midnight). */
export function plainDateToDate(pd: PlainDate): Date {
  return new Date(pd.year, pd.month - 1, pd.day)
}

/** Converts a JavaScript `Date` to a `PlainDate`. */
export function dateToPlainDate(T: BeatUITemporal, d: Date): PlainDate {
  return T.PlainDate.from({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  })
}
