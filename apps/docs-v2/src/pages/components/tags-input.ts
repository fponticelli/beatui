import { TagInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TagInput',
  category: 'Form Inputs',
  component: 'TagInput',
  description: 'A tag/chip input that lets users type and add multiple string values, with keyboard and backspace support.',
  icon: 'lucide:tags',
  order: 11,
}

export default function TagsInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('TagInput', signals => {
      const values = prop<string[]>(['TypeScript', 'Tempo'])
      return TagInput({
        ...signals,
        values,
        onChange: v => values.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('TagInput', props =>
        TagInput({ ...props, values: ['Tag A', 'Tag B'] } as never)
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const values = prop<string[]>(['Tag'])
              return html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                TagInput({
                  values,
                  onChange: v => values.set(v),
                  size,
                  placeholder: 'Add tag...',
                })
              )
            })
          ),
        'TagInput is available in five sizes.'
      ),
      Section(
        'Max Tags',
        () => {
          const values = prop<string[]>(['One', 'Two', 'Three'])
          return TagInput({
            values,
            onChange: v => values.set(v),
            maxTags: 3,
            placeholder: 'Max 3 tags',
          })
        },
        'Limit the number of tags that can be added using maxTags.'
      ),
      Section(
        'Disabled',
        () =>
          TagInput({
            values: ['Read', 'Only', 'Tags'],
            onChange: () => {},
            disabled: true,
          }),
        'Disabled TagInput prevents adding or removing tags.'
      ),
    ],
  })
}
