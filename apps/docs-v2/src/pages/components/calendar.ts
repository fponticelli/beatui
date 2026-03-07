import { Calendar, DateCalendar, RangeCalendar, DateRangeCalendar } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Calendar',
  category: 'Tables & Media',
  component: 'Calendar',
  description:
    'A date selection calendar with month/year navigation. Uses Temporal PlainDate internally, with a DateCalendar convenience wrapper for JavaScript Date objects.',
  icon: 'lucide:calendar',
  order: 9,
}

export default function CalendarPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Calendar', signals => {
      const selectedDate = prop<{ year: number; month: number; day: number } | null>(null)
      return html.div(
        attr.class('flex flex-col gap-3 items-center'),
        Calendar({
          color: signals.color as never,
          size: signals.size as never,
          disabled: signals.disabled as never,
          weekStartsOn: signals.weekStartsOn as never,
          value: selectedDate as never,
          onSelect: (d) => selectedDate.set(d as never),
        }),
        html.p(
          attr.class('text-sm text-gray-500'),
          selectedDate.map(d =>
            d != null
              ? `Selected: ${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
              : 'No date selected'
          )
        )
      )
    }),
    sections: [
      Section(
        'Basic Calendar',
        () => {
          const selected = prop<{ year: number; month: number; day: number } | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            Calendar({
              value: selected as never,
              onSelect: (d) => selected.set(d as never),
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              selected.map(d =>
                d != null
                  ? `Selected: ${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
                  : 'Click a date to select'
              )
            )
          )
        },
        'A standalone calendar for date selection. Uses Temporal PlainDate for all date logic.'
      ),
      Section(
        'DateCalendar (JavaScript Date)',
        () => {
          const selected = prop<Date | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            DateCalendar({
              value: selected,
              onSelect: d => selected.set(d),
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              selected.map(d =>
                d != null
                  ? `Selected: ${d.toLocaleDateString()}`
                  : 'Click a date to select'
              )
            )
          )
        },
        'DateCalendar is a convenience wrapper that works with JavaScript Date objects instead of PlainDate.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            Calendar({ color: 'primary' }),
            Calendar({ color: 'success' }),
            Calendar({ color: 'danger' })
          ),
        'The color prop controls the highlight color for the selected date and today\'s date.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-start'),
            html.div(
              attr.class('flex flex-col gap-1 items-center'),
              html.span(attr.class('text-xs font-mono text-gray-500'), 'sm'),
              Calendar({ size: 'sm' })
            ),
            html.div(
              attr.class('flex flex-col gap-1 items-center'),
              html.span(attr.class('text-xs font-mono text-gray-500'), 'md'),
              Calendar({ size: 'md' })
            ),
            html.div(
              attr.class('flex flex-col gap-1 items-center'),
              html.span(attr.class('text-xs font-mono text-gray-500'), 'lg'),
              Calendar({ size: 'lg' })
            )
          ),
        'Calendar sizes adjust cell dimensions and typography for different contexts.'
      ),
      Section(
        'Week Starts On Monday',
        () =>
          Calendar({ weekStartsOn: 1, color: 'info' }),
        'Set weekStartsOn to 1 to start the week on Monday (ISO standard) instead of Sunday.'
      ),
      Section(
        'Disabled Dates',
        () => {
          const selected = prop<{ year: number; month: number; day: number } | null>(null)
          const today = new Date()
          return Calendar({
            value: selected as never,
            onSelect: (d: { year: number; month: number; day: number }) => selected.set(d),
            isDateDisabled: (d: { year: number; month: number; day: number }) => {
              const date = new Date(d.year, d.month - 1, d.day)
              return date < today
            },
          } as never)
        },
        'Use isDateDisabled to prevent selecting past dates, weekends, or any custom range.'
      ),
      Section(
        'Disabled Calendar',
        () =>
          Calendar({
            value: { year: 2025, month: 6, day: 15 } as never,
            disabled: true,
          }),
        'A fully disabled calendar displays the selection but prevents all interaction.'
      ),
      Section(
        'RangeCalendar (PlainDate)',
        () => {
          const range = prop<[{ year: number; month: number; day: number }, { year: number; month: number; day: number }] | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            RangeCalendar({
              value: range as never,
              onChange: (r) => range.set(r as never),
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              range.map(r =>
                r != null
                  ? `Range: ${r[0].year}-${String(r[0].month).padStart(2, '0')}-${String(r[0].day).padStart(2, '0')} to ${r[1].year}-${String(r[1].month).padStart(2, '0')}-${String(r[1].day).padStart(2, '0')}`
                  : 'Click a start date, then an end date'
              )
            )
          )
        },
        'RangeCalendar supports two-click range selection using Temporal PlainDate. Click a start date, hover to preview, then click an end date to complete the range.'
      ),
      Section(
        'DateRangeCalendar (JavaScript Date)',
        () => {
          const range = prop<[Date, Date] | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            DateRangeCalendar({
              value: range,
              onChange: r => range.set(r),
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              range.map(r =>
                r != null
                  ? `Range: ${r[0].toLocaleDateString()} to ${r[1].toLocaleDateString()}`
                  : 'Click two dates to select a range'
              )
            )
          )
        },
        'DateRangeCalendar is a convenience wrapper for DateRangeCalendar that uses JavaScript Date objects. Internally converts to and from PlainDate.'
      ),
    ],
  })
}
