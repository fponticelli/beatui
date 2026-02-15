import {
  attr,
  computedOf,
  html,
  on,
  prop,
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
 * Configuration options for the {@link RangeCalendar} component.
 * Uses Temporal `PlainDate` for date values — no time or timezone concerns.
 */
export interface RangeCalendarOptions {
  /** The currently selected date range as `[start, end]`. */
  value?: Value<[PlainDate, PlainDate] | null>
  /** Callback invoked when a complete range is selected. */
  onChange?: (range: [PlainDate, PlainDate]) => void
  /**
   * Predicate that returns `true` if the given date should be disabled (unselectable).
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
 * Configuration options for the {@link DateRangeCalendar} component.
 * Convenience wrapper that uses JavaScript `Date` objects.
 */
export interface DateRangeCalendarOptions {
  /** The currently selected date range as `[start, end]`. */
  value?: Value<[Date, Date] | null>
  /** Callback invoked when a complete range is selected. */
  onChange?: (range: [Date, Date]) => void
  /**
   * Predicate that returns `true` if the given date should be disabled (unselectable).
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

function renderRangeCalendar(
  T: BeatUITemporal,
  {
    value = null,
    onChange,
    isDateDisabled,
    color = 'primary',
    size = 'md',
    disabled = false,
    weekStartsOn = 0,
  }: RangeCalendarOptions
): TNode {
  const initialRange = value != null ? Value.get(value) : null
  const nav = createCalendarNav(
    T,
    initialRange?.[0]?.year ?? T.Now.plainDateISO().year,
    initialRange?.[0]?.month ?? T.Now.plainDateISO().month,
    disabled,
    weekStartsOn
  )

  // Range selection state
  const rangeStart = prop<PlainDate | null>(null)
  const hoveredDate = prop<PlainDate | null>(null)

  // Reset rangeStart when external value changes
  if (value != null) {
    Value.on(value, () => {
      rangeStart.set(null)
    })
  }

  // Build the grid of day cells reactively
  const gridCells = computedOf(
    nav.currentYear,
    nav.currentMonth,
    value,
    rangeStart,
    hoveredDate
  )((year, month, committedRange, start, hovered) => {
    // Determine effective range for highlighting
    let effectiveStart: PlainDate | null = null
    let effectiveEnd: PlainDate | null = null
    let isPreview = false

    if (start != null && hovered != null) {
      const cmp = T.PlainDate.compare(start, hovered)
      effectiveStart = cmp <= 0 ? start : hovered
      effectiveEnd = cmp <= 0 ? hovered : start
      isPreview = true
    } else if (committedRange != null) {
      effectiveStart = committedRange[0]
      effectiveEnd = committedRange[1]
    }

    return buildCalendarGrid(
      T,
      year,
      month,
      weekStartsOn,
      nav.today,
      isDateDisabled
    ).map(cell => {
      let isRangeStart = false
      let isRangeEnd = false
      let isInRange = false

      if (effectiveStart != null && effectiveEnd != null) {
        isRangeStart = cell.date.equals(effectiveStart)
        isRangeEnd = cell.date.equals(effectiveEnd)
        isInRange =
          T.PlainDate.compare(cell.date, effectiveStart) > 0 &&
          T.PlainDate.compare(cell.date, effectiveEnd) < 0
      }

      return { ...cell, isRangeStart, isRangeEnd, isInRange, isPreview }
    })
  })

  return renderCalendarShell(
    nav,
    { size, disabled, color, ariaLabel: 'Date range calendar' },
    () =>
      html.div(
        attr.class('bc-calendar__grid'),
        on.mouseleave(() => {
          hoveredDate.set(null)
        }),
        ForEach(gridCells, cellSignal => {
          const classes = cellSignal.map(cell => {
            const cls = ['bc-calendar__day']
            if (!cell.inMonth) cls.push('bc-calendar__day--outside')
            if (cell.isToday) cls.push('bc-calendar__day--today')
            if (cell.isDisabled) cls.push('bc-calendar__day--disabled')
            if (cell.isRangeStart) cls.push('bc-calendar__day--range-start')
            if (cell.isRangeEnd) cls.push('bc-calendar__day--range-end')
            if (cell.isInRange) cls.push('bc-calendar__day--in-range')
            if (
              cell.isPreview &&
              (cell.isRangeStart || cell.isRangeEnd || cell.isInRange)
            )
              cls.push('bc-calendar__day--preview')
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
            on.mouseenter(() => {
              const cell = Value.get(cellSignal)
              if (!cell.isDisabled && !Value.get(disabled)) {
                hoveredDate.set(cell.date)
              }
            }),
            on.click(e => {
              e.preventDefault()
              const cell = Value.get(cellSignal)
              if (cell.isDisabled || Value.get(disabled)) return

              if (!cell.inMonth) {
                nav.currentYear.set(cell.date.year)
                nav.currentMonth.set(cell.date.month)
              }

              const start = rangeStart.value
              if (start == null) {
                rangeStart.set(cell.date)
              } else {
                const cmp = T.PlainDate.compare(start, cell.date)
                const sorted: [PlainDate, PlainDate] =
                  cmp <= 0 ? [start, cell.date] : [cell.date, start]
                rangeStart.set(null)
                hoveredDate.set(null)
                onChange?.(sorted)
              }
            }),
            day
          )
        })
      )
  )
}

/**
 * A calendar component for date range selection with hover preview.
 *
 * Uses Temporal `PlainDate` internally — a date-only type with no time or
 * timezone concerns, 1-based months, and proper date arithmetic.
 *
 * Users click twice to select a range: the first click sets the start date,
 * hovering shows a preview, and the second click completes the range.
 * The range is auto-sorted so start is always before end.
 *
 * @param options - Configuration for the range calendar
 * @returns A calendar element with date range selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { RangeCalendar, PlainDate } from '@tempots/beatui'
 *
 * const range = prop<[PlainDate, PlainDate] | null>(null)
 * RangeCalendar({
 *   value: range,
 *   onChange: range.set,
 * })
 * ```
 */
export function RangeCalendar(options?: RangeCalendarOptions): Renderable {
  return WithTemporal(T => renderRangeCalendar(T, options ?? {}))
}

/**
 * A convenience range calendar wrapper that uses JavaScript `Date` objects.
 *
 * Accepts and fires `Date` values, converting to/from `PlainDate` internally.
 * Use this when integrating with existing `Date`-based code.
 *
 * @param options - Configuration for the range calendar (uses `Date` objects)
 * @returns A calendar element with date range selection capability
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateRangeCalendar } from '@tempots/beatui'
 *
 * const range = prop<[Date, Date] | null>(null)
 * DateRangeCalendar({
 *   value: range,
 *   onChange: range.set,
 * })
 * ```
 */
export function DateRangeCalendar(
  options?: DateRangeCalendarOptions
): Renderable {
  const { value, onChange, isDateDisabled, ...rest } = options ?? {}

  return WithTemporal(T => {
    const plainValue: Value<[PlainDate, PlainDate] | null> | undefined =
      value != null
        ? Value.map(value, d =>
            d != null
              ? [dateToPlainDate(T, d[0]), dateToPlainDate(T, d[1])]
              : null
          )
        : undefined

    const plainOnChange: ((range: [PlainDate, PlainDate]) => void) | undefined =
      onChange
        ? range =>
            onChange([plainDateToDate(range[0]), plainDateToDate(range[1])])
        : undefined

    const plainIsDateDisabled: ((pd: PlainDate) => boolean) | undefined =
      isDateDisabled ? pd => isDateDisabled(plainDateToDate(pd)) : undefined

    return renderRangeCalendar(T, {
      ...rest,
      value: plainValue,
      onChange: plainOnChange,
      isDateDisabled: plainIsDateDisabled,
    })
  })
}
