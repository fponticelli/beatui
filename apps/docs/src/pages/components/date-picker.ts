import { DatePicker, DateRangePicker } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'DatePicker',
  category: 'Date & Time',
  component: 'DatePicker',
  description:
    'A date selection panel with month/year navigation. Uses Temporal PlainDate internally.',
  icon: 'lucide:calendar-range',
  order: 9,
}

export default function DatePickerPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('DatePicker', signals => {
      const selectedDate = prop<{ year: number; month: number; day: number } | null>(null)
      return html.div(
        attr.class('flex flex-col gap-3 items-center'),
        DatePicker({
          ...signals,
          value: selectedDate as never,
          onSelect: (d: { year: number; month: number; day: number }) => selectedDate.set(d),
        } as never),
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
        'Basic DatePicker',
        () => {
          const selected = prop<{ year: number; month: number; day: number } | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            DatePicker({
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
          const selected = prop<{ year: number; month: number; day: number } | null>(null)
          const today = new Date()
          return DatePicker({
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
        'Disabled DatePicker',
        () =>
          DatePicker({
            value: { year: 2025, month: 6, day: 15 } as never,
            disabled: true,
          }),
        'A fully disabled date picker displays the selection but prevents all interaction.'
      ),
      Section(
        'DateRangePicker',
        () => {
          const range = prop<[{ year: number; month: number; day: number }, { year: number; month: number; day: number }] | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            DateRangePicker({
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
        'DateRangePicker supports two-click range selection using Temporal PlainDate. Click a start date, hover to preview, then click an end date to complete the range.'
      ),
    ],
  })
}
