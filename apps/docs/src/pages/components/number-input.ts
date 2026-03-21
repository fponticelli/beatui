import { NumberInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NumberInput',
  category: 'Inputs',
  component: 'NumberInput',
  description: 'A numeric input with optional stepper buttons, min/max constraints, and scroll-to-step support.',
  icon: 'lucide:hash',
  order: 3,
}

export default function NumberInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NumberInput', signals => {
      const value = signals.value as Prop<number>
      return NumberInput({ ...signals, value, onChange: (v: number) => value.set(v) })
    }),
    sections: [
      ...AutoSections('NumberInput', props =>
        NumberInput({ ...props, value: 42 })
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
        'With Unit',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NumberInput({
              value: prop(75),
              onChange: () => {},
              step: 1,
              min: 0,
              max: 100,
              unit: 'kg',
              placeholder: 'Weight',
            }),
            NumberInput({
              value: prop(1920),
              onChange: () => {},
              step: 1,
              min: 1,
              unit: 'px',
              placeholder: 'Width',
            }),
            NumberInput({
              value: prop(50),
              onChange: () => {},
              step: 5,
              min: 0,
              max: 100,
              unit: '%',
              placeholder: 'Opacity',
            }),
            NumberInput({
              value: prop(22.5),
              onChange: () => {},
              step: 0.5,
              min: -40,
              max: 60,
              unit: '°C',
              placeholder: 'Temperature',
            })
          ),
        'Use the `unit` option to display a unit of measurement label next to the input, before the stepper buttons.'
      ),
      Section(
        'Formatted',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            NumberInput({
              value: prop(1234567.89),
              onChange: () => {},
              step: 0.01,
              formatted: true,
              placeholder: 'Currency',
              unit: '$',
            }),
            NumberInput({
              value: prop(50000),
              onChange: () => {},
              step: 1,
              formatted: true,
              placeholder: 'Population',
            }),
            NumberInput({
              value: prop(3.14159),
              onChange: () => {},
              step: 0.001,
              formatted: true,
              placeholder: 'Precision',
            })
          ),
        'When `formatted` is true, the value is displayed with locale-aware grouping and decimal formatting when the input is not focused. Click to edit the raw value.'
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
