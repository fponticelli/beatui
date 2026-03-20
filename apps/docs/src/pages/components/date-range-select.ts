import {
  DateRangeSelect,
  DateInput,
  Field,
  type DateRange,
  type PlainDate,
} from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop, Value, type Prop } from '@tempots/dom'
import { ComponentPage, Section, createOptionsPanel } from '../../framework'
import { componentMeta } from '../../registry/component-meta'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'DateRangeSelect',
  category: 'Pickers',
  component: 'DateRangeSelect',
  description:
    'A dropdown date range selector with a single calendar showing range highlighting. Both start and end dates are required.',
  icon: 'lucide:calendar-range',
  order: 11,
}

function formatDate(d: PlainDate): string {
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

function dateInput(label: string, value: Prop<PlainDate>) {
  const asDate = prop(plainDateToDate(value.value))
  value.onChange(d => asDate.set(plainDateToDate(d)))
  return Field({
    label,
    content: DateInput({
      value: asDate as Value<Date>,
      onChange: d => value.set(dateToPlainDate(d)),
      size: 'xs',
    }),
  })
}

export default function DateRangeSelectPage() {
  const today = Temporal.Now.plainDateISO()
  const defaultRange: DateRange = [today, today.add({ days: 7 })]

  // Build the auto-generated options panel for standard props (size, color, etc.)
  const cmeta = componentMeta['DateRangeSelect']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  // Create separate start/end date signals
  const startDate = prop(defaultRange[0])
  const endDate = prop(defaultRange[1])
  const range = prop<DateRange>(defaultRange)

  // Sync individual signals → range
  startDate.onChange(s => range.set([s, endDate.value]))
  endDate.onChange(e => range.set([startDate.value, e]))

  // Sync range → individual signals (when component changes range)
  const onRangeChange = (r: DateRange) => {
    range.set(r)
    startDate.set(r[0])
    endDate.set(r[1])
  }

  // Custom panel: date inputs + auto-generated controls
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
    dateInput('Start', startDate),
    dateInput('End', endDate),
    autoPanel
  )

  const preview = html.div(
    attr.class('flex flex-col gap-3'),
    DateRangeSelect({
      ...signals,
      value: range,
      onChange: onRangeChange,
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
          html.div(attr.class('min-w-48 min-h-16'), preview)
        ),
        html.div(attr.class('lg:w-72 shrink-0'), panel)
      )
    ),
    sections: [
      Section(
        'Basic',
        () => {
          const r = prop<DateRange>(defaultRange)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            DateRangeSelect({ value: r, onChange: r.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              r.map(v => `${formatDate(v[0])} → ${formatDate(v[1])}`)
            )
          )
        },
        'Click to open a calendar with range selection. Click once to set the start, again to set the end.'
      ),
      Section(
        'Custom Format',
        () => {
          const r = prop<DateRange>(defaultRange)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            DateRangeSelect({
              value: r,
              onChange: r.set,
              formatDate: d =>
                `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              r.map(v => `${formatDate(v[0])} → ${formatDate(v[1])}`)
            )
          )
        },
        'Use formatDate to customize how dates are displayed in the trigger.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('max-w-sm'),
            DateRangeSelect({ value: defaultRange, disabled: true })
          ),
        'The selector can be disabled to prevent interaction.'
      ),
      Section(
        'Sizes',
        () => {
          const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
          return html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            ...sizes.map(size => {
              const r = prop<DateRange>(defaultRange)
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                DateRangeSelect({ value: r, onChange: r.set, size })
              )
            })
          )
        },
        'Available in all standard control sizes.'
      ),
    ],
  })
}
