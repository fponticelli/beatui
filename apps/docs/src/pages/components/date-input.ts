import { NativeDateInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NativeDateInput',
  category: 'Pickers',
  component: 'NativeDateInput',
  description:
    'A native date input (type="date") that binds to a JavaScript Date object.',
  icon: 'lucide:calendar',
  order: 13,
}

export default function NativeDateInputPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const value = prop(new Date())
      return html.div(
        attr.class('flex flex-col gap-2 max-w-xs'),
        NativeDateInput({ value, onChange: (v: Date) => value.set(v) }),
        html.p(
          attr.class('text-xs text-gray-500'),
          value.map(d => `Value: ${d.toLocaleDateString()}`)
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
            NativeDateInput({ value, onChange: (v: Date) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(d => `Selected: ${d.toISOString().split('T')[0]}`)
            )
          )
        },
        'NativeDateInput uses the browser native date picker via type="date". The value is bound as a Date object using valueAsDate.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                NativeDateInput({ value: new Date(), size })
              )
            )
          ),
        'NativeDateInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NativeDateInput({ value: new Date() }),
            NativeDateInput({ value: new Date(), disabled: true }),
            NativeDateInput({ value: new Date(), hasError: true })
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}
