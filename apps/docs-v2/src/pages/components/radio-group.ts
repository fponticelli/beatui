import { RadioGroup } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'RadioGroup',
  category: 'Form Inputs',
  component: 'RadioGroup',
  description: 'A group of radio buttons for selecting one option from a mutually exclusive list.',
  icon: 'lucide:circle-dot',
  order: 8,
}

const sampleOptions = [
  { value: 'light', label: 'Light Mode' },
  { value: 'dark', label: 'Dark Mode' },
  { value: 'system', label: 'System Default' },
]

export default function RadioGroupPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('RadioGroup', signals => {
      const value = prop('light')
      return RadioGroup({
        ...signals,
        options: sampleOptions,
        value,
        onChange: v => value.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('RadioGroup', props =>
        RadioGroup({
          ...props,
          options: sampleOptions,
          value: 'light',
        } as never)
      ),
      Section(
        'Horizontal Layout',
        () => {
          const value = prop('light')
          return RadioGroup({
            options: sampleOptions,
            value,
            onChange: v => value.set(v),
            orientation: 'horizontal',
          })
        },
        'Radio groups can be displayed horizontally.'
      ),
      Section(
        'With Descriptions',
        () => {
          const value = prop('basic')
          return RadioGroup({
            options: [
              {
                value: 'basic',
                label: 'Basic Plan',
                description: '$10/month - Essential features',
              },
              {
                value: 'pro',
                label: 'Pro Plan',
                description: '$30/month - Advanced features',
              },
              {
                value: 'enterprise',
                label: 'Enterprise',
                description: 'Contact sales for custom pricing',
                disabled: true,
              },
            ],
            value,
            onChange: v => value.set(v),
          })
        },
        'Options can include a description and individual disabled states.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const value = prop('light')
              return html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-2'), size),
                RadioGroup({
                  options: [
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ],
                  value,
                  onChange: v => value.set(v),
                  orientation: 'horizontal',
                  size,
                })
              )
            })
          ),
        'RadioGroup is available in five sizes.'
      ),
    ],
  })
}
