import {
  DateSelect,
  NullableDateInput,
  Field,
  type PlainDate,
} from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop, Value, type Prop } from '@tempots/dom'
import { ComponentPage, Section, createOptionsPanel } from '../../framework'
import { componentMeta } from '../../registry/component-meta'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'DateSelect',
  category: 'Pickers',
  component: 'DateSelect',
  description:
    'A dropdown date selector that opens a calendar picker. The selected date is always required — use NullableDateSelect when null is allowed.',
  icon: 'lucide:calendar',
  order: 13,
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
    content: NullableDateInput({
      value: asDate as Value<Date | null>,
      onChange: d => {
        if (d != null) value.set(dateToPlainDate(d))
      },
      size: 'xs',
    }),
  })
}

export default function DateSelectPage() {
  const today = Temporal.Now.plainDateISO()

  const cmeta = componentMeta['DateSelect']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  const selectedDate = prop<PlainDate>(today)

  const onDateChange = (d: PlainDate) => {
    selectedDate.set(d)
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
    dateInput('Date', selectedDate),
    autoPanel
  )

  const preview = html.div(
    attr.class('flex flex-col gap-3'),
    DateSelect({
      ...signals,
      value: selectedDate,
      onChange: onDateChange,
    }),
    html.p(
      attr.class('text-sm text-gray-500 font-mono'),
      selectedDate.map(d => `Selected: ${formatDate(d)}`)
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
          const d = prop<PlainDate>(today)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            DateSelect({ value: d, onChange: d.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              d.map(v => `Selected: ${formatDate(v)}`)
            )
          )
        },
        'Click to open a calendar and select a single date.'
      ),
      Section(
        'Custom Format',
        () => {
          const d = prop<PlainDate>(today)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            DateSelect({
              value: d,
              onChange: v => d.set(v),
              formatDate: date =>
                `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              d.map(v => `Selected: ${formatDate(v)}`)
            )
          )
        },
        'Use formatDate to customize how the selected date is displayed in the trigger.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('max-w-xs'),
            DateSelect({ value: today, disabled: true })
          ),
        'The selector can be disabled to prevent interaction.'
      ),
      Section(
        'Sizes',
        () => {
          const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...sizes.map(size => {
              const d = prop<PlainDate>(today)
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                DateSelect({ value: d, onChange: v => d.set(v), size })
              )
            })
          )
        },
        'Available in all standard control sizes.'
      ),
    ],
  })
}
