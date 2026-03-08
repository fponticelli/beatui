import { UuidInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'UuidInput',
  category: 'Text Inputs',
  component: 'UuidInput',
  description:
    'A masked input for UUID values with automatic hyphen insertion and hex character validation.',
  icon: 'lucide:fingerprint',
  order: 8,
}

export default function UuidInputPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('max-w-md'),
      UuidInput({
        value: prop(''),
        onInput: () => {},
      })
    ),
    sections: [
      Section(
        'Auto-formatting',
        () => {
          const value = prop('')
          return html.div(
            attr.class('flex flex-col gap-2 max-w-md'),
            UuidInput({ value, onInput: (v: string) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(v => v ? `Value: ${v}` : 'Type hex characters — hyphens are inserted automatically.')
            )
          )
        },
        'Built on MaskInput with pattern xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. Only hex digits (0-9, a-f) are accepted and normalized to lowercase.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                UuidInput({ value: '', size })
              )
            )
          ),
        'UuidInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-md'),
            UuidInput({ value: '' }),
            UuidInput({ value: '', disabled: true }),
            UuidInput({ value: '550e8400-e29b-41d4-a716-44665544000', hasError: true })
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}
