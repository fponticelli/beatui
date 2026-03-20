import { DatePicker, DateRangePicker, type PlainDate } from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'DatePicker',
  category: 'Pickers',
  component: 'DatePicker',
  description:
    'A date selection panel with month/year navigation. Uses Temporal PlainDate internally.',
  icon: 'lucide:calendar-range',
  order: 9,
}

function formatDate(d: PlainDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

export default function DatePickerPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('DatePicker', signals => {
      const selectedDate = prop<PlainDate | null>(null)
      return html.div(
        attr.class('flex flex-col gap-3 items-center'),
        DatePicker({
          ...signals,
          value: selectedDate,
          onSelect: (d: PlainDate) => selectedDate.set(d),
        }),
        html.p(
          attr.class('text-sm text-gray-500'),
          selectedDate.map(d =>
            d != null ? `Selected: ${formatDate(d)}` : 'No date selected'
          )
        )
      )
    }),
    sections: [
      Section(
        'Basic DatePicker',
        () => {
          const selected = prop<PlainDate | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            DatePicker({
              value: selected,
              onSelect: (d) => selected.set(d),
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              selected.map(d =>
                d != null ? `Selected: ${formatDate(d)}` : 'Click a date to select'
              )
            )
          )
        },
        'A standalone date picker for date selection. Uses Temporal PlainDate for all date logic.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            DatePicker({ color: 'primary' }),
            DatePicker({ color: 'success' }),
            DatePicker({ color: 'danger' })
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
              DatePicker({ size: 'sm' })
            ),
            html.div(
              attr.class('flex flex-col gap-1 items-center'),
              html.span(attr.class('text-xs font-mono text-gray-500'), 'md'),
              DatePicker({ size: 'md' })
            ),
            html.div(
              attr.class('flex flex-col gap-1 items-center'),
              html.span(attr.class('text-xs font-mono text-gray-500'), 'lg'),
              DatePicker({ size: 'lg' })
            )
          ),
        'DatePicker sizes adjust cell dimensions and typography for different contexts.'
      ),
      Section(
        'Week Starts On Monday',
        () =>
          DatePicker({ weekStartsOn: 1, color: 'info' }),
        'Set weekStartsOn to 1 to start the week on Monday (ISO standard) instead of Sunday.'
      ),
      Section(
        'Disabled Dates',
        () => {
          const selected = prop<PlainDate | null>(null)
          const today = Temporal.Now.plainDateISO()
          return DatePicker({
            value: selected,
            onSelect: (d: PlainDate) => selected.set(d),
            isDateDisabled: (d: PlainDate) =>
              Temporal.PlainDate.compare(d, today) < 0,
          })
        },
        'Use isDateDisabled to prevent selecting past dates, weekends, or any custom range.'
      ),
      Section(
        'Disabled DatePicker',
        () =>
          DatePicker({
            value: Temporal.PlainDate.from({ year: 2025, month: 6, day: 15 }),
            disabled: true,
          }),
        'A fully disabled date picker displays the selection but prevents all interaction.'
      ),
      Section(
        'DateRangePicker',
        () => {
          const range = prop<[PlainDate, PlainDate] | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            DateRangePicker({
              value: range,
              onChange: (r) => range.set(r),
            }),
            html.p(
              attr.class('text-sm text-gray-500'),
              range.map(r =>
                r != null
                  ? `Range: ${formatDate(r[0])} to ${formatDate(r[1])}`
                  : 'Click a start date, then an end date'
              )
            )
          )
        },
        'DateRangePicker supports two-click range selection using Temporal PlainDate. Click a start date, hover to preview, then click an end date to complete the range.'
      ),
    ],
  })
}
