import { TagInput, SelectTagsInput, ComboboxTagsInput, Option } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TagInput',
  category: 'Dropdowns',
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
        size: signals.size,
        disabled: signals.disabled,
        placeholder: signals.placeholder,
        maxTags: signals.maxTags,
        hasError: signals.hasError,
        values,
        onChange: (v: string[]) => values.set(v),
      })
    }),
    sections: [
      ...AutoSections('TagInput', props =>
        TagInput({ ...props, values: ['Tag A', 'Tag B'] })
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
                  onChange: (v: string[]) => values.set(v),
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
            onChange: (v: string[]) => values.set(v),
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
      Section(
        'SelectTagsInput (predefined options)',
        () => {
          const selected = prop<string[]>(['red'])
          const options = [
            Option.value('red', 'Red'),
            Option.value('green', 'Green'),
            Option.value('blue', 'Blue'),
            Option.value('orange', 'Orange'),
            Option.value('purple', 'Purple'),
          ]
          return html.div(
            attr.class('flex flex-col gap-2 max-w-sm'),
            SelectTagsInput({
              value: selected,
              onChange: (v: string[]) => selected.set(v),
              options,
              placeholder: 'Select colors...',
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v => v.length > 0 ? `Selected: ${v.join(', ')}` : 'None selected')
            )
          )
        },
        'SelectTagsInput renders selected values as tag chips and provides a click-to-open dropdown for choosing from a predefined list of options.'
      ),
      Section(
        'ComboboxTagsInput (searchable)',
        () => {
          const selected = prop<string[]>([])
          const options = [
            Option.value('typescript', 'TypeScript'),
            Option.value('javascript', 'JavaScript'),
            Option.value('rust', 'Rust'),
            Option.value('go', 'Go'),
            Option.value('python', 'Python'),
            Option.value('swift', 'Swift'),
            Option.value('kotlin', 'Kotlin'),
          ]
          return html.div(
            attr.class('flex flex-col gap-2 max-w-sm'),
            ComboboxTagsInput({
              value: selected,
              onChange: (v: string[]) => selected.set(v),
              options,
              placeholder: 'Choose languages...',
              searchPlaceholder: 'Search...',
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v => v.length > 0 ? `Selected: ${v.join(', ')}` : 'None selected')
            )
          )
        },
        'ComboboxTagsInput adds a search input to the dropdown, filtering options as the user types. Ideal for large option sets.'
      ),
    ],
  })
}
