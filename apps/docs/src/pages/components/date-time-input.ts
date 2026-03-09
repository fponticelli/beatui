import { NativeDateTimeInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NativeDateTimeInput',
  category: 'Date & Time',
  component: 'NativeDateTimeInput',
  description:
    'A native datetime-local input that binds to a JavaScript Date object.',
  icon: 'lucide:calendar-clock',
  order: 14,
}

export default function NativeDateTimeInputPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const value = prop(new Date())
      return html.div(
        attr.class('flex flex-col gap-2 max-w-xs'),
        NativeDateTimeInput({ value, onChange: (v: Date) => value.set(v) }),
        html.p(
          attr.class('text-xs text-gray-500'),
          value.map(d => `Value: ${d.toLocaleString()}`)
        )
      )
    })(),
    sections: [
      Section(
        'Basic Usage',
        () => {
          const value = prop(new Date())
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            NativeDateTimeInput({ value, onChange: (v: Date) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Selected: ${d.toISOString()}`)
            )
          )
        },
        'NativeDateTimeInput uses the browser native datetime-local picker. Values are stored in local time without timezone conversion.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                NativeDateTimeInput({ value: new Date(), size })
              )
            )
          ),
        'NativeDateTimeInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NativeDateTimeInput({ value: new Date() }),
            NativeDateTimeInput({ value: new Date(), disabled: true }),
            NativeDateTimeInput({ value: new Date(), hasError: true })
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}
