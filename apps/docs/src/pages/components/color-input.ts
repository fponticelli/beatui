import { ColorInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ColorInput',
  category: 'Inputs',
  component: 'ColorInput',
  description:
    'A color picker combining a text field and a clickable color swatch that opens the native color picker.',
  icon: 'lucide:palette',
  order: 9,
}

export default function ColorInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ColorInput', signals => {
      const value = signals.value as Prop<string>
      return ColorInput({
        ...signals,
        value,
        onChange: (v: string) => value.set(v),
        onInput: (v: string) => value.set(v),
      })
    }),
    sections: [
      ...AutoSections('ColorInput', props =>
        ColorInput({ ...props, value: '#3b82f6' })
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...([20, 28, 36, 48, 64] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), `${size}px`),
                ColorInput({
                  value: prop('#3b82f6'),
                  onChange: () => {},
                  swatchSize: size,
                })
              )
            )
          ),
        'The size prop controls the swatch preview size in pixels.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ColorInput({ value: '#3b82f6', placeholder: 'Default' }),
            ColorInput({ value: '#3b82f6', disabled: true, placeholder: 'Disabled' }),
            ColorInput({ value: '#ef4444', hasError: true, placeholder: 'Error' })
          ),
        'ColorInput supports disabled and error states.'
      ),
    ],
  })
}
