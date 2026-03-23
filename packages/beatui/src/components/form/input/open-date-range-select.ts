import {
  type TNode,
  Value,
  type Merge,
  computedOf,
  html,
  attr,
  on,
  When,
} from '@tempots/dom'
import { CommonInputOptions } from './input-options'
import { DateRangeSelectShell } from './date-range-select-base'
import { DatePicker } from '../../data/date-picker'
import type { PlainDate } from '../../../temporal/types'
import { ThemeColorName } from '../../../tokens'
import { defaultMessages } from '../../../beatui-i18n'

/**
 * An open date range where either or both dates may be null/undefined.
 */
export type OpenDateRange = [
  PlainDate | null | undefined,
  PlainDate | null | undefined,
]

/**
 * Configuration options for the {@link OpenDateRangeSelect} component.
 *
 * Either or both dates can be null/undefined, allowing open-ended ranges
 * like "from X onwards" or "up to Y".
 */
export type OpenDateRangeSelectOptions = Merge<
  CommonInputOptions,
  {
    /** The selected date range as `[start, end]`. Either value may be null/undefined. */
    value: Value<OpenDateRange>
    /** Callback invoked when the range changes. */
    onChange?: (range: OpenDateRange) => void
    /** Callback invoked on blur. */
    onBlur?: () => void
    /** Predicate returning true if a date should be disabled. */
    isDateDisabled?: (date: PlainDate) => boolean
    /** Theme color. @default 'primary' */
    color?: Value<ThemeColorName>
    /** The day the week starts on (0=Sun, 1=Mon). @default 0 */
    weekStartsOn?: Value<number>
    /** Format a PlainDate for display. Defaults to ISO string. */
    formatDate?: (date: PlainDate) => string
    /** Label for the start picker. @default i18n dateRangeStart */
    startLabel?: string
    /** Label for the end picker. @default i18n dateRangeEnd */
    endLabel?: string
    /** Placeholder when no date is selected. @default i18n dateRangeNoLimit */
    emptyPlaceholder?: string
    /** Content to render before the display text. */
    before?: TNode
    /** Content to render after the display text. */
    after?: TNode
  }
>

/**
 * A date range selector that allows open-ended ranges.
 *
 * Displays the selected range in a styled trigger button. Clicking opens a
 * flyout panel with two side-by-side {@link DatePicker} components for
 * selecting start and end dates independently. Either or both dates can be
 * null/undefined, enabling "from X onwards" or "up to Y" ranges.
 *
 * Use {@link DateRangeSelect} when both dates are always required.
 *
 * @param options - Configuration for the open date range selector
 * @returns An open date range selector element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { OpenDateRangeSelect } from '@tempots/beatui'
 * import { Temporal } from '@js-temporal/polyfill'
 *
 * // Open-ended range: from a date onwards
 * const range = prop<OpenDateRange>([
 *   Temporal.PlainDate.from('2026-01-01'),
 *   null,
 * ])
 * OpenDateRangeSelect({
 *   value: range,
 *   onChange: v => range.set(v),
 *   emptyPlaceholder: 'No limit',
 * })
 * ```
 */
export function OpenDateRangeSelect(
  options: OpenDateRangeSelectOptions
): TNode {
  const {
    value,
    onChange,
    isDateDisabled,
    color = 'primary',
    weekStartsOn = 0,
    formatDate = (d: PlainDate) => d.toString(),
    startLabel = defaultMessages.dateRangeStart,
    endLabel = defaultMessages.dateRangeEnd,
    emptyPlaceholder = defaultMessages.dateRangeNoLimit,
    ...rest
  } = options

  const displayText = computedOf(value)(v => {
    const sText = v[0] != null ? formatDate(v[0]) : emptyPlaceholder
    const eText = v[1] != null ? formatDate(v[1]) : emptyPlaceholder
    return `${sText}  →  ${eText}`
  })

  const startValue = Value.map(value, (v): PlainDate | null => v[0] ?? null)
  const endValue = Value.map(value, (v): PlainDate | null => v[1] ?? null)

  const clearLabel = defaultMessages.clearValue

  return DateRangeSelectShell({
    ...rest,
    displayText,
    panelContent: html.div(
      attr.class('bc-date-range-select__pickers'),
      html.div(
        attr.class('bc-date-range-select__picker'),
        html.div(
          attr.class('bc-date-range-select__picker-header'),
          html.span(
            attr.class('bc-date-range-select__picker-label'),
            startLabel
          ),
          When(
            Value.map(startValue, s => s != null),
            () =>
              html.button(
                attr.type('button'),
                attr.class('bc-date-range-select__clear-btn'),
                attr.title(clearLabel),
                on.click((e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const current = Value.get(value)
                  onChange?.([null, current[1]])
                }),
                clearLabel
              )
          )
        ),
        DatePicker({
          value: startValue as Value<PlainDate | null>,
          onSelect: date => {
            const current = Value.get(value)
            onChange?.([date, current[1]])
          },
          isDateDisabled,
          color,
          size: options.size,
          disabled: options.disabled,
          weekStartsOn,
        })
      ),
      html.div(
        attr.class('bc-date-range-select__picker'),
        html.div(
          attr.class('bc-date-range-select__picker-header'),
          html.span(attr.class('bc-date-range-select__picker-label'), endLabel),
          When(
            Value.map(endValue, e => e != null),
            () =>
              html.button(
                attr.type('button'),
                attr.class('bc-date-range-select__clear-btn'),
                attr.title(clearLabel),
                on.click((e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const current = Value.get(value)
                  onChange?.([current[0], null])
                }),
                clearLabel
              )
          )
        ),
        DatePicker({
          value: endValue as Value<PlainDate | null>,
          onSelect: date => {
            const current = Value.get(value)
            onChange?.([current[0], date])
          },
          isDateDisabled,
          color,
          size: options.size,
          disabled: options.disabled,
          weekStartsOn,
        })
      )
    ),
  })
}
