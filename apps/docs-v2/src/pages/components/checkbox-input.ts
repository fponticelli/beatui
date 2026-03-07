import { CheckboxInput, Group } from '@tempots/beatui'
import { html, attr, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'CheckboxInput',
  category: 'Selection',
  component: 'CheckboxInput',
  description: 'A custom icon-based checkbox with ARIA semantics, keyboard support, and optional text label.',
  icon: 'lucide:square-check',
  order: 4,
}

export default function CheckboxInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('CheckboxInput', signals => {
      const value = signals.value as Prop<boolean>
      return CheckboxInput({ ...signals, value, onChange: (v: boolean) => value.set(v) } as never)
    }),
    sections: [
      ...AutoSections('CheckboxInput', props =>
        CheckboxInput({ ...props, value: false } as never)
      ),
      Section(
        'With Labels',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            CheckboxInput({
              value: true,
              onChange: () => {},
              placeholder: 'I accept the terms and conditions',
            }),
            CheckboxInput({
              value: false,
              onChange: () => {},
              placeholder: 'Subscribe to newsletter',
            })
          ),
        'The placeholder prop is used as the clickable label next to the checkbox.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                CheckboxInput({
                  value: true,
                  onChange: () => {},
                  placeholder: `Size ${size}`,
                  size,
                })
              )
            )
          ),
        'CheckboxInput is available in five sizes.'
      ),
      Section(
        'Disabled',
        () =>
          Group(
            attr.class('gap-4'),
            CheckboxInput({ value: true, onChange: () => {}, disabled: true, placeholder: 'Checked disabled' }),
            CheckboxInput({ value: false, onChange: () => {}, disabled: true, placeholder: 'Unchecked disabled' })
          ),
        'Disabled checkboxes are non-interactive.'
      ),
    ],
  })
}
