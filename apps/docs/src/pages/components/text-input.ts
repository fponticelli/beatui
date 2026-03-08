import { TextInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TextInput',
  category: 'Text Inputs',
  component: 'TextInput',
  description: 'A single-line text input with support for prefix, suffix, icons, and all standard input states.',
  icon: 'lucide:type',
  order: 2,
}

export default function TextInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('TextInput', signals => {
      const value = signals.value as Prop<string>
      return TextInput({ ...signals, value, onInput: (v: string) => value.set(v) })
    }),
    sections: [
      ...AutoSections('TextInput', props =>
        TextInput({ ...props, value: 'Sample text' })
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                TextInput({
                  value: 'Sample text',
                  size,
                  placeholder: `Size ${size}`,
                })
              )
            )
          ),
        'TextInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            TextInput({ value: '', placeholder: 'Default' }),
            TextInput({ value: '', placeholder: 'Disabled', disabled: true }),
            TextInput({ value: 'Error state', hasError: true }),
            TextInput({ value: '', placeholder: 'Read only', disabled: true })
          ),
        'TextInput supports disabled, error, and read-only states.'
      ),
    ],
  })
}
