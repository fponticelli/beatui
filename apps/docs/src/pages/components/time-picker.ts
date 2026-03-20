import { TimePicker, type PlainTime } from '@tempots/beatui'
import { Temporal } from '@js-temporal/polyfill'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section, createOptionsPanel } from '../../framework'
import { componentMeta } from '../../registry/component-meta'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TimePicker',
  category: 'Pickers',
  component: 'TimePicker',
  description:
    'A time selection panel with scrollable hour and minute columns. Uses Temporal PlainTime internally.',
  icon: 'lucide:clock',
  order: 10,
}

function formatTime(t: PlainTime): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:${String(t.second).padStart(2, '0')}`
}

export default function TimePickerPage() {
  const cmeta = componentMeta['TimePicker']
  const { panel: autoPanel, signals } = createOptionsPanel(cmeta!)

  const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))

  const preview = html.div(
    attr.class('flex flex-col gap-3'),
    TimePicker({
      ...signals,
      value: time,
      onSelect: t => time.set(t),
    }),
    html.p(
      attr.class('text-sm text-gray-500 font-mono'),
      time.map(t => (t ? `Selected: ${formatTime(t)}` : 'No time selected'))
    )
  )

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
          preview
        ),
        html.div(attr.class('lg:w-72 shrink-0'), panel)
      )
    ),
    sections: [
      Section(
        'Basic',
        () => {
          const t = prop<PlainTime | null>(
            Temporal.PlainTime.from('10:00')
          )
          return html.div(
            attr.class('flex flex-col gap-3'),
            TimePicker({ value: t, onSelect: v => t.set(v) }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v =>
                v ? `Selected: ${formatTime(v)}` : 'No time selected'
              )
            )
          )
        },
        'Click an hour and minute to select a time.'
      ),
      Section(
        'With Seconds',
        () => {
          const t = prop<PlainTime | null>(
            Temporal.PlainTime.from('14:30:45')
          )
          return html.div(
            attr.class('flex flex-col gap-3'),
            TimePicker({
              value: t,
              onSelect: v => t.set(v),
              showSeconds: true,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v =>
                v ? `Selected: ${formatTime(v)}` : 'No time selected'
              )
            )
          )
        },
        'Enable the seconds column with showSeconds.'
      ),
      Section(
        'With Now Button',
        () => {
          const t = prop<PlainTime | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3'),
            TimePicker({
              value: t,
              onSelect: v => t.set(v),
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
        'Show a "Now" button that sets the time to the current local time.'
      ),
      Section(
        'Minute Step',
        () => {
          const t = prop<PlainTime | null>(
            Temporal.PlainTime.from('09:00')
          )
          return html.div(
            attr.class('flex flex-col gap-3'),
            TimePicker({
              value: t,
              onSelect: v => t.set(v),
              minuteStep: 15,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v =>
                v ? `Selected: ${formatTime(v)}` : 'No time selected'
              )
            )
          )
        },
        'Use minuteStep to limit minute options to 15-minute intervals.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            TimePicker({
              value: Temporal.PlainTime.from('14:30'),
              disabled: true,
            })
          ),
        'The picker can be disabled to prevent interaction.'
      ),
      Section(
        'Sizes',
        () => {
          const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
          return html.div(
            attr.class('flex flex-wrap gap-4'),
            ...sizes.map(size => {
              const t = prop<PlainTime | null>(
                Temporal.PlainTime.from('14:30')
              )
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                TimePicker({
                  value: t,
                  onSelect: v => t.set(v),
                  size,
                })
              )
            })
          )
        },
        'Available in all standard control sizes.'
      ),
      Section(
        'Null Value',
        () => {
          const t = prop<PlainTime | null>(null)
          return html.div(
            attr.class('flex flex-col gap-3'),
            TimePicker({
              value: t,
              onSelect: v => t.set(v),
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              t.map(v =>
                v ? `Selected: ${formatTime(v)}` : 'No time selected'
              )
            )
          )
        },
        'Starts with no selection. Click to select a time.'
      ),
    ],
  })
}
