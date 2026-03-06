import { OTPInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'OTPInput',
  category: 'Text Inputs',
  component: 'OTPInput',
  description:
    'A one-time password input with individual cells, keyboard navigation, paste support, and masking.',
  icon: 'lucide:key-round',
  order: 10,
}

export default function OTPInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('OTPInput', signals => {
      const value = prop('')
      return OTPInput({
        value,
        onChange: (v: string) => value.set(v),
        size: signals.size,
        color: signals.color,
        disabled: signals.disabled,
        length: signals.length,
      })
    }),
    sections: [
      ...AutoSections('OTPInput', props =>
        OTPInput({ ...props, value: '', onChange: () => {} } as never)
      ),
      Section(
        'Lengths',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...[4, 6, 8].map(length =>
              html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-2'),
                  `length: ${length}`
                ),
                OTPInput({ value: '', onChange: () => {}, length })
              )
            )
          ),
        'OTPInput supports any number of input cells.'
      ),
      Section(
        'Masked PIN',
        () =>
          OTPInput({
            value: '',
            onChange: () => {},
            length: 4,
            mask: true,
            type: 'numeric',
          }),
        'Enable masking to hide entered digits, useful for PIN entry.'
      ),
      Section(
        'Alphanumeric',
        () =>
          OTPInput({
            value: '',
            onChange: () => {},
            length: 6,
            type: 'alphanumeric',
            placeholder: '-',
          }),
        'OTPInput can accept alphanumeric characters in addition to digits.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-2'),
                  size
                ),
                OTPInput({ value: '', onChange: () => {}, size, length: 6 })
              )
            )
          ),
        'OTPInput is available in five sizes.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['primary', 'success', 'danger'] as const).map(color =>
              html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-2'),
                  color
                ),
                OTPInput({ value: '', onChange: () => {}, color, length: 6 })
              )
            )
          ),
        'The focused cell border color follows the theme color.'
      ),
    ],
  })
}
