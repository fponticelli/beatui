import { SliderInput, NullableSliderInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'SliderInput',
  category: 'Pickers',
  component: 'SliderInput',
  description:
    'A range slider input with configurable min, max, and step values for selecting a numeric value.',
  icon: 'lucide:sliders-horizontal',
  order: 14,
}

export default function SliderInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('SliderInput', signals => {
      const value = signals.value as Prop<number>
      return html.div(
        attr.class('w-64'),
        SliderInput({
          size: signals.size,
          color: signals.color,
          disabled: signals.disabled,
          value,
          onChange: (v: number) => value.set(v),
          min: 0,
          max: 100,
          step: 1,
        } as never)
      )
    }),
    sections: [
      ...AutoSections('SliderInput', props =>
        html.div(
          attr.class('w-48'),
          SliderInput({ ...props, value: 50, min: 0, max: 100 } as never)
        )
      ),
      Section(
        'Min, Max, and Step',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-xs'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'step: 10 (0–100)'),
              SliderInput({ value: prop(40), onChange: () => {}, min: 0, max: 100, step: 10 })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'step: 0.01 (0–1)'),
              SliderInput({ value: prop(0.5), onChange: () => {}, min: 0, max: 1, step: 0.01 })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'step: 5 (0–50)'),
              SliderInput({ value: prop(20), onChange: () => {}, min: 0, max: 50, step: 5 })
            )
          ),
        'Control the range and granularity with min, max, and step props.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                SliderInput({ value: 50, min: 0, max: 100, size })
              )
            )
          ),
        'SliderInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Default'),
              SliderInput({ value: 60, min: 0, max: 100 })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Disabled'),
              SliderInput({ value: 60, min: 0, max: 100, disabled: true })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Error'),
              SliderInput({ value: 60, min: 0, max: 100, hasError: true })
            )
          ),
        'SliderInput supports disabled and error states.'
      ),
      Section(
        'Nullable Slider',
        () => {
          const value = prop<number | null>(null)
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            NullableSliderInput({
              value,
              onChange: v => value.set(v),
              min: 0,
              max: 100,
              step: 1,
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              value.map(v => (v == null ? 'Value: null (unset)' : `Value: ${v}`))
            )
          )
        },
        'NullableSliderInput supports a null (unset) state with a reset button that appears when a value is selected.'
      ),
    ],
  })
}
