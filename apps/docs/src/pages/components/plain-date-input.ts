import {
  PlainDateInput,
  PlainDateTimeInput,
  PlainTimeInput,
  PlainYearMonthInput,
  PlainMonthDayInput,
} from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Temporal Inputs',
  category: 'Date & Time',
  component: 'PlainDateInput',
  description:
    'A family of native date/time inputs that bind to Temporal API types (PlainDate, PlainDateTime, PlainTime, PlainYearMonth, PlainMonthDay). Requires the Temporal polyfill.',
  icon: 'lucide:clock',
  order: 15,
}

export default function PlainDateInputPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('flex flex-col gap-4 max-w-xs'),
      html.div(
        html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'PlainDateInput'),
        PlainDateInput({ value: prop(Temporal.PlainDate.from('2025-06-15')), onChange: () => {} })
      ),
      html.div(
        html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'PlainTimeInput'),
        PlainTimeInput({ value: prop(Temporal.PlainTime.from('14:30')), onChange: () => {} })
      ),
      html.div(
        html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'PlainDateTimeInput'),
        PlainDateTimeInput({ value: prop(Temporal.PlainDateTime.from('2025-06-15T14:30')), onChange: () => {} })
      )
    ),
    sections: [
      Section(
        'PlainDateInput',
        () => {
          const value = prop(Temporal.PlainDate.from('2025-06-15'))
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            PlainDateInput({ value, onChange: (v) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Value: ${d.toString()}`)
            )
          )
        },
        'Renders a native type="date" input bound to a Temporal.PlainDate.'
      ),
      Section(
        'PlainDateTimeInput',
        () => {
          const value = prop(Temporal.PlainDateTime.from('2025-06-15T14:30'))
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            PlainDateTimeInput({ value, onChange: (v) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Value: ${d.toString()}`)
            )
          )
        },
        'Renders a native type="datetime-local" input bound to a Temporal.PlainDateTime.'
      ),
      Section(
        'PlainTimeInput',
        () => {
          const value = prop(Temporal.PlainTime.from('14:30'))
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            PlainTimeInput({ value, onChange: (v) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Value: ${d.toString()}`)
            )
          )
        },
        'Renders a native type="time" input bound to a Temporal.PlainTime.'
      ),
      Section(
        'PlainYearMonthInput',
        () => {
          const value = prop(Temporal.PlainYearMonth.from('2025-06'))
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            PlainYearMonthInput({ value, onChange: (v) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Value: ${d.toString()}`)
            )
          )
        },
        'Renders a native type="month" input bound to a Temporal.PlainYearMonth.'
      ),
      Section(
        'PlainMonthDayInput',
        () => {
          const value = prop(Temporal.PlainMonthDay.from('--12-25'))
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            PlainMonthDayInput({ value, onChange: (v) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Value: ${d.toString()}`)
            )
          )
        },
        'Uses a masked input (MM-DD format) since there is no native month-day input type. Hyphens are inserted automatically.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                PlainDateInput({
                  value: Temporal.PlainDate.from('2025-06-15'),
                  size,
                })
              )
            )
          ),
        'All Temporal inputs are available in five sizes.'
      ),
    ],
  })
}
