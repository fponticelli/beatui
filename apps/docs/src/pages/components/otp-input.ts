import { OtpInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'OtpInput',
  category: 'Text Inputs',
  component: 'OtpInput',
  description:
    'A one-time password input with individual cells, keyboard navigation, paste support, and masking.',
  icon: 'lucide:key-round',
  order: 10,
}

export default function OtpInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('OtpInput', signals => {
      const value = signals.value as Prop<string>
      return OtpInput({
        ...signals,
        value,
        onChange: (v: string) => value.set(v),
      })
    }),
    sections: [
      ...AutoSections('OtpInput', props =>
        OtpInput({ ...props, value: '', onChange: () => {} })
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
                OtpInput({ value: '', onChange: () => {}, length })
              )
            )
          ),
        'OtpInput supports any number of input cells.'
      ),
      Section(
        'Masked PIN',
        () =>
          OtpInput({
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
          OtpInput({
            value: '',
            onChange: () => {},
            length: 6,
            type: 'alphanumeric',
            placeholder: '-',
          }),
        'OtpInput can accept alphanumeric characters in addition to digits.'
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
                OtpInput({ value: '', onChange: () => {}, size, length: 6 })
              )
            )
          ),
        'OtpInput is available in five sizes.'
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
                OtpInput({ value: '', onChange: () => {}, color, length: 6 })
              )
            )
          ),
        'The focused cell border color follows the theme color.'
      ),
    ],
  })
}
