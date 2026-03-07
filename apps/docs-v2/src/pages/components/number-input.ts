import { NumberInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NumberInput',
  category: 'Text Inputs',
  component: 'NumberInput',
  description: 'A numeric input with optional stepper buttons, min/max constraints, and scroll-to-step support.',
  icon: 'lucide:hash',
  order: 3,
}

export default function NumberInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NumberInput', signals => {
      const value = signals.value as Prop<number>
      return NumberInput({ ...signals, value, onChange: (v: number) => value.set(v) } as never)
    }),
    sections: [
      ...AutoSections('NumberInput', props =>
        NumberInput({ ...props, value: 42 } as never)
      ),
      Section(
        'With Steppers',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NumberInput({
              value: prop(5),
              onChange: () => {},
              step: 1,
              min: 0,
              max: 10,
              placeholder: 'Quantity',
            }),
            NumberInput({
              value: prop(0.5),
              onChange: () => {},
              step: 0.1,
              min: 0,
              max: 1,
              placeholder: 'Float step',
            })
          ),
        'When a step is provided, increment/decrement buttons appear. Hold Shift for a 10x multiplier.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                NumberInput({ value: 0, onChange: () => {}, step: 1, size })
              )
            )
          ),
        'NumberInput is available in five sizes.'
      ),
    ],
  })
}
