import {
  TimeSelect,
  NullableTimeSelect,
  Field,
  type PlainTime,
} from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section, createOptionsPanel } from '../../framework'
import { componentMeta } from '../../registry/component-meta'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TimeSelect',
  category: 'Pickers',
  component: 'TimeSelect',
  description:
    'A dropdown time selector that opens a time picker panel. The selected time is always required — use NullableTimeSelect when null is allowed.',
  icon: 'lucide:clock',
  order: 15,
}

function formatTime(t: PlainTime): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

export default function TimeSelectPage() {
  const cmeta = componentMeta['TimeSelect']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  const selectedTime = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

  const onTimeChange = (t: PlainTime) => {
    selectedTime.set(t)
  }

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
    TimeSelect({
      ...signals,
      value: selectedTime,
      onChange: onTimeChange,
    }),
    html.p(
      attr.class('text-sm text-gray-500 font-mono'),
      selectedTime.map(t => `Selected: ${formatTime(t)}`)
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
          const t = prop<PlainTime>(Temporal.PlainTime.from('09:00'))
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            TimeSelect({ value: t, onChange: t.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v => `Selected: ${formatTime(v)}`)
            )
          )
        },
        'Click to open a time picker and select a time.'
      ),
      Section(
        'Custom Format',
        () => {
          const t = prop<PlainTime>(Temporal.PlainTime.from('14:30'))
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            TimeSelect({
              value: t,
              onChange: t.set,
              formatTime: time =>
                `${time.hour % 12 || 12}:${String(time.minute).padStart(2, '0')} ${time.hour >= 12 ? 'PM' : 'AM'}`,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v => `Selected: ${formatTime(v)}`)
            )
          )
        },
        'Use formatTime to customize how the selected time is displayed in the trigger.'
      ),
      Section(
        'With Seconds',
        () => {
          const t = prop<PlainTime>(Temporal.PlainTime.from('14:30:15'))
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            TimeSelect({
              value: t,
              onChange: t.set,
              showSeconds: true,
              formatTime: time => time.toString(),
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v => `Selected: ${v.toString()}`)
            )
          )
        },
        'Enable the seconds column in the picker.'
      ),
      Section(
        'With Now Button',
        () => {
          const t = prop<PlainTime>(Temporal.PlainTime.from('09:00'))
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            TimeSelect({
              value: t,
              onChange: t.set,
              showNow: true,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v => `Selected: ${formatTime(v)}`)
            )
          )
        },
        'Show a "Now" button inside the picker panel to quickly set the current local time.'
      ),
      Section(
        'Minute Step',
        () => {
          const t = prop<PlainTime>(Temporal.PlainTime.from('09:00'))
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            TimeSelect({
              value: t,
              onChange: t.set,
              minuteStep: 15,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v => `Selected: ${formatTime(v)}`)
            )
          )
        },
        'Use minuteStep to show only 15-minute intervals.'
      ),
      Section(
        'Nullable',
        () => {
          const t = prop<PlainTime | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NullableTimeSelect({
              value: t,
              onChange: t.set,
              placeholder: 'Pick a time',
              showNow: true,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v =>
                v ? `Selected: ${formatTime(v)}` : 'No time selected'
              )
            )
          )
        },
        'Use NullableTimeSelect when the value can be null. A clear button appears when a time is set.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('max-w-xs'),
            TimeSelect({
              value: Temporal.PlainTime.from('14:30'),
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
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...sizes.map(size => {
              const t = prop<PlainTime>(Temporal.PlainTime.from('14:30'))
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                TimeSelect({ value: t, onChange: t.set, size })
              )
            })
          )
        },
        'Available in all standard control sizes.'
      ),
      Section(
        'In a Field',
        () => {
          const t = prop<PlainTime>(Temporal.PlainTime.from('09:00'))
          return html.div(
            attr.class('max-w-xs'),
            Field({
              label: 'Meeting Time',
              description: 'Select the meeting start time',
              content: TimeSelect({ value: t, onChange: t.set }),
            })
          )
        },
        'TimeSelect works inside a Field with label and description.'
      ),
    ],
  })
}
