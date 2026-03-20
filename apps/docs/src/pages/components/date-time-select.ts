import {
  DateTimeSelect,
  NullableDateTimeSelect,
  Field,
  type PlainDateTime,
} from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section, createOptionsPanel } from '../../framework'
import { componentMeta } from '../../registry/component-meta'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'DateTimeSelect',
  category: 'Specialized Inputs',
  component: 'DateTimeSelect',
  description:
    'A dropdown date-time selector combining a calendar picker and a time picker. The selected date-time is always required — use NullableDateTimeSelect when null is allowed.',
  icon: 'lucide:calendar-clock',
  order: 16,
}

function formatDT(dt: PlainDateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')} ${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}`
}

export default function DateTimeSelectPage() {
  const now = Temporal.Now.plainDateTimeISO()
  const cmeta = componentMeta['DateTimeSelect']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  const selectedDT = prop<PlainDateTime>(now)

  const panel = html.div(
    attr.class(
      'flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[400px]'
    ),
    html.div(
      attr.class(
        'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'
      ),
      'Options'
    ),
    autoPanel
  )

  const preview = html.div(
    attr.class('flex flex-col gap-3'),
    DateTimeSelect({
      ...signals,
      value: selectedDT,
      onChange: dt => selectedDT.set(dt),
    }),
    html.p(
      attr.class('text-sm text-gray-500 font-mono'),
      selectedDT.map(dt => `Selected: ${formatDT(dt)}`)
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
          const dt = prop<PlainDateTime>(now)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            DateTimeSelect({ value: dt, onChange: dt.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              dt.map(v => `Selected: ${formatDT(v)}`)
            )
          )
        },
        'Click to open a combined date and time picker.'
      ),
      Section(
        'With Seconds & Now',
        () => {
          const dt = prop<PlainDateTime>(now)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            DateTimeSelect({
              value: dt,
              onChange: dt.set,
              showSeconds: true,
              showNow: true,
              formatDateTime: d =>
                `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')} ${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}:${String(d.second).padStart(2, '0')}`,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              dt.map(v => `Selected: ${v.toString()}`)
            )
          )
        },
        'Enable seconds and the "Now" button in the time picker.'
      ),
      Section(
        'Nullable',
        () => {
          const dt = prop<PlainDateTime | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            NullableDateTimeSelect({
              value: dt,
              onChange: dt.set,
              showNow: true,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              dt.map(v =>
                v ? `Selected: ${formatDT(v)}` : 'No date-time selected'
              )
            )
          )
        },
        'Use NullableDateTimeSelect when the value can be null. A clear button appears when set.'
      ),
      Section(
        'Custom Format',
        () => {
          const dt = prop<PlainDateTime>(now)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            DateTimeSelect({
              value: dt,
              onChange: dt.set,
              formatDateTime: d =>
                `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year} ${d.hour % 12 || 12}:${String(d.minute).padStart(2, '0')} ${d.hour >= 12 ? 'PM' : 'AM'}`,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              dt.map(v => `Selected: ${formatDT(v)}`)
            )
          )
        },
        'Use formatDateTime to customize how the value is displayed in the trigger.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('max-w-md'),
            DateTimeSelect({
              value: now,
              disabled: true,
            })
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
              const dt = prop<PlainDateTime>(now)
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                DateTimeSelect({ value: dt, onChange: dt.set, size })
              )
            })
          )
        },
        'Available in all standard control sizes.'
      ),
      Section(
        'In a Field',
        () => {
          const dt = prop<PlainDateTime>(now)
          return html.div(
            attr.class('max-w-md'),
            Field({
              label: 'Appointment',
              description: 'Select the appointment date and time',
              content: DateTimeSelect({ value: dt, onChange: dt.set }),
            })
          )
        },
        'DateTimeSelect works inside a Field with label and description.'
      ),
    ],
  })
}
