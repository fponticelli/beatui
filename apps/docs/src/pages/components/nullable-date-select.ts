import {
  NullableDateSelect,
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
  name: 'NullableDateSelect',
  category: 'Pickers',
  component: 'NullableDateSelect',
  description:
    'A dropdown date selector where the value may be null. Includes a clear button to reset back to null. Use DateSelect when a date is always required.',
  icon: 'lucide:calendar-x',
  order: 14,
}

function formatDate(d: PlainDate | null): string {
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

export default function NullableDateSelectPage() {
  const today = Temporal.Now.plainDateISO()

  const cmeta = componentMeta['NullableDateSelect']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  const selectedDate = prop<PlainDate | null>(today)

  const onDateChange = (d: PlainDate | null) => {
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
    nullableDateInput('Date', selectedDate),
    autoPanel
  )

  const preview = html.div(
    attr.class('flex flex-col gap-3 w-full'),
    NullableDateSelect({
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
        'Basic (starts null)',
        () => {
          const d = prop<PlainDate | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NullableDateSelect({ value: d, onChange: d.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              d.map(v => `Selected: ${formatDate(v)}`)
            )
          )
        },
        'When no date is set, the placeholder is shown. The reset (x) button appears after a date is selected.'
      ),
      Section(
        'Pre-selected date',
        () => {
          const d = prop<PlainDate | null>(today)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NullableDateSelect({ value: d, onChange: d.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              d.map(v => `Selected: ${formatDate(v)}`)
            )
          )
        },
        'The reset button is shown from the start when a date is pre-set. Click x to clear back to null.'
      ),
      Section(
        'Custom placeholder',
        () => {
          const d = prop<PlainDate | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NullableDateSelect({
              value: d,
              onChange: v => d.set(v),
              placeholder: 'Choose a date...',
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              d.map(v => `Selected: ${formatDate(v)}`)
            )
          )
        },
        'Override the placeholder text shown when no date is selected.'
      ),
      Section(
        'Custom Format',
        () => {
          const d = prop<PlainDate | null>(today)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NullableDateSelect({
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
            NullableDateSelect({ value: today, disabled: true })
          ),
        'The selector can be disabled to prevent interaction. The reset button is also disabled.'
      ),
      Section(
        'Sizes',
        () => {
          const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...sizes.map(size => {
              const d = prop<PlainDate | null>(today)
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                NullableDateSelect({ value: d, onChange: v => d.set(v), size })
              )
            })
          )
        },
        'Available in all standard control sizes.'
      ),
    ],
  })
}
