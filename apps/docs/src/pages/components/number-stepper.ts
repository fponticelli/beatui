import { NumberStepper, Field } from '@tempots/beatui'
import { html, attr, prop, Value, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NumberStepper',
  category: 'Inputs',
  component: 'NumberStepper',
  description:
    'A quantity selector with compact +/- buttons and a displayed value. Unlike NumberInput, this has no text field — ideal for cart quantities and counters.',
  icon: 'lucide:plus-minus',
  order: 22,
}

export default function NumberStepperPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NumberStepper', signals => {
      const value = signals.value as Prop<number>
      return NumberStepper({
        ...signals,
        value,
        onChange: (v: number) => value.set(v),
      })
    }),
    sections: [
      ...AutoSections('NumberStepper', props =>
        NumberStepper({ ...props, value: 3, onChange: () => {} })
      ),
      Section(
        'Basic',
        () => {
          const v = prop(1)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            NumberStepper({ value: v, onChange: v.set }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              Value.map(v, n => `Value: ${n}`)
            )
          )
        },
        'Click + or - to adjust the value.'
      ),
      Section(
        'Min / Max',
        () => {
          const v = prop(5)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            NumberStepper({ value: v, onChange: v.set, min: 0, max: 10 }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              Value.map(v, n => `Value: ${n} (min: 0, max: 10)`)
            )
          )
        },
        'Buttons disable at the boundaries.'
      ),
      Section(
        'Custom Step',
        () => {
          const v = prop(0)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            NumberStepper({ value: v, onChange: v.set, step: 5 }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              Value.map(v, n => `Value: ${n} (step: 5)`)
            )
          )
        },
        'Use step to control the increment/decrement amount.'
      ),
      Section(
        'Vertical',
        () => {
          const v = prop(5)
          return html.div(
            attr.class('flex flex-col gap-3 items-start'),
            NumberStepper({
              value: v,
              onChange: v.set,
              orientation: 'vertical',
              min: 0,
              max: 10,
            }),
            html.p(
              attr.class('text-sm text-gray-500 font-mono'),
              Value.map(v, n => `Value: ${n}`)
            )
          )
        },
        'Set orientation to "vertical" for a top-to-bottom layout.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap items-end gap-6'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const v = prop(3)
              return html.div(
                attr.class('flex flex-col items-center gap-1'),
                NumberStepper({ value: v, onChange: v.set, size }),
                html.span(
                  attr.class('text-xs font-mono text-gray-500'),
                  size
                )
              )
            })
          ),
        'Available in all standard sizes. Buttons scale proportionally.'
      ),
      Section(
        'Disabled',
        () =>
          NumberStepper({
            value: 3,
            onChange: () => {},
            disabled: true,
          }),
        'Disabled state prevents interaction.'
      ),
      Section(
        'In a Field',
        () => {
          const v = prop(1)
          return html.div(
            attr.class('max-w-xs'),
            Field({
              label: 'Quantity',
              description: 'Select how many items',
              content: NumberStepper({
                value: v,
                onChange: v.set,
                min: 1,
                max: 99,
              }),
            })
          )
        },
        'Works inside a Field with label and description.'
      ),
    ],
  })
}
