import { BigintInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'BigintInput',
  category: 'Text Inputs',
  component: 'BigintInput',
  description:
    'A numeric input for arbitrarily large integers (bigint), with optional stepper buttons, min/max clamping, and digit-only masking.',
  icon: 'lucide:sigma',
  order: 9,
}

export default function BigintInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground(
      'BigintInput',
      signals => {
        const value = signals.value as Prop<bigint>
        return BigintInput({
          ...signals,
          value,
          onChange: (v: bigint) => value.set(v),
        })
      },
      { defaults: { value: 42n } }
    ),
    sections: [
      ...AutoSections('BigintInput', props =>
        BigintInput({ ...props, value: 42n })
      ),
      Section(
        'With Steppers',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            BigintInput({
              value: prop(5n),
              onChange: () => {},
              step: 1n,
              min: 0n,
              max: 100n,
            }),
            BigintInput({
              value: prop(1000n),
              onChange: () => {},
              step: 100n,
            })
          ),
        'When step is provided, increment/decrement buttons appear. Hold Shift for a 10x multiplier.'
      ),
      Section(
        'Min / Max',
        () => {
          const value = prop(50n)
          return html.div(
            attr.class('flex flex-col gap-2 max-w-xs'),
            BigintInput({
              value,
              onChange: (v: bigint) => value.set(v),
              step: 1n,
              min: 0n,
              max: 100n,
            }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(v => `Value: ${v} (clamped to 0–100)`)
            )
          )
        },
        'Values are clamped to the min/max bounds on every change.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-xs'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                BigintInput({ value: 0n, step: 1n, size })
              )
            )
          ),
        'BigintInput is available in five sizes.'
      ),
    ],
  })
}
