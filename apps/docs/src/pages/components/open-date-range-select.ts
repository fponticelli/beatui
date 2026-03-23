import {
  OpenDateRangeSelect,
  NullableDateInput,
  Field,
  type OpenDateRange,
  type PlainDate,
} from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop, Value, type Prop } from '@tempots/dom'
import { ComponentPage, Section, createOptionsPanel } from '../../framework'
import { componentMeta } from '../../registry/component-meta'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'OpenDateRangeSelect',
  category: 'Pickers',
  component: 'OpenDateRangeSelect',
  description:
    'A dropdown date range selector where either or both dates can be null, allowing open-ended ranges.',
  icon: 'lucide:calendar-range',
  order: 12,
}

function formatDate(d: PlainDate | null | undefined): string {
  if (d == null) return '—'
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

function plainDateToDate(d: PlainDate): Date {
  return new Date(d.year, d.month - 1, d.day)
}

function dateToPlainDate(d: Date): PlainDate {
  return Temporal.PlainDate.from({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  })
}

function nullableDateInput(label: string, value: Prop<PlainDate | null>) {
  const asDate = prop<Date | null>(
    value.value != null ? plainDateToDate(value.value) : null
  )
  value.onChange(d => asDate.set(d != null ? plainDateToDate(d) : null))
  return Field({
    label,
    content: NullableDateInput({
      value: asDate as Value<Date | null>,
      onChange: d => value.set(d != null ? dateToPlainDate(d) : null),
      size: 'xs',
    }),
  })
}

export default function OpenDateRangeSelectPage() {
  const today = Temporal.Now.plainDateISO()

  // Build auto-generated options panel for standard props
  const cmeta = componentMeta['OpenDateRangeSelect']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  // Create separate start/end signals
  const startDate = prop<PlainDate | null>(today)
  const endDate = prop<PlainDate | null>(null)
  const range = prop<OpenDateRange>([today, null])

  startDate.onChange(s => range.set([s, endDate.value]))
  endDate.onChange(e => range.set([startDate.value, e]))

  const onRangeChange = (r: OpenDateRange) => {
    range.set(r)
    startDate.set(r[0] ?? null)
    endDate.set(r[1] ?? null)
  }

  const panel = html.div(
    attr.class(
      'flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[400px]'
    ),
    html.div(
      attr.class(
        'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'
      ),
      'Value'
    ),
    nullableDateInput('Start', startDate),
    nullableDateInput('End', endDate),
    autoPanel
  )

  const preview = html.div(
    attr.class('flex flex-col gap-3 w-full'),
    OpenDateRangeSelect({
      ...signals,
      value: range,
      onChange: onRangeChange,
      emptyPlaceholder: 'No limit',
    }),
    html.p(
      attr.class('text-sm text-gray-500 font-mono'),
      range.map(r => `${formatDate(r[0])} → ${formatDate(r[1])}`)
    )
  )

  return ComponentPage(meta, {
    playground: html.div(
      attr.class('space-y-2'),
      html.div(
        attr.class(
          'flex flex-col lg:flex-row gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
        ),
        html.div(
          attr.class(
            'relative flex-1 flex items-center justify-center p-6 min-h-[120px] rounded-lg bg-gray-50 dark:bg-gray-800/30 playground-preview'
          ),
          html.div(attr.class('min-w-48 min-h-16 text-center'), preview)
        ),
        html.div(attr.class('lg:w-72 shrink-0'), panel)
      )
    ),
    sections: [
      Section(
        'Open Start',
        () => {
          const r = prop<OpenDateRange>([null, today.add({ days: 30 })])
          return html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            OpenDateRangeSelect({
              value: r,
              onChange: v => r.set(v),
              emptyPlaceholder: 'No limit',
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              r.map(v => `${formatDate(v[0])} → ${formatDate(v[1])}`)
            )
          )
        },
        'Start date is null — representing "up to" a specific date.'
      ),
      Section(
        'Open End',
        () => {
          const r = prop<OpenDateRange>([today, null])
          return html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            OpenDateRangeSelect({
              value: r,
              onChange: v => r.set(v),
              emptyPlaceholder: 'Ongoing',
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              r.map(v => `${formatDate(v[0])} → ${formatDate(v[1])}`)
            )
          )
        },
        'End date is null — representing "from" a date onwards.'
      ),
      Section(
        'Both Open',
        () => {
          const r = prop<OpenDateRange>([null, null])
          return html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            OpenDateRangeSelect({
              value: r,
              onChange: v => r.set(v),
              emptyPlaceholder: 'Any',
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              r.map(v => `${formatDate(v[0])} → ${formatDate(v[1])}`)
            )
          )
        },
        'Both dates are null — no date constraints. Select either date independently.'
      ),
    ],
  })
}
