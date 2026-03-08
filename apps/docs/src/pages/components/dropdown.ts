import { DropdownInput, Option } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import type { DropdownOption } from '@tempots/beatui'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Dropdown',
  category: 'Dropdowns',
  component: 'Dropdown',
  description:
    'A select dropdown with keyboard navigation, searchable filtering, grouped options, and rich content support.',
  icon: 'lucide:chevron-down-circle',
  order: 4,
}

const fruitOptions: DropdownOption<string>[] = [
  Option.value('apple', 'Apple'),
  Option.value('banana', 'Banana'),
  Option.value('cherry', 'Cherry'),
  Option.value('mango', 'Mango'),
  Option.value('grape', 'Grape'),
]

export default function DropdownPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Dropdown', signals => {
      const value = prop<string>('')
      const options = prop(fruitOptions)
      return html.div(
        attr.class('w-56'),
        DropdownInput({
          value,
          options,
          size: signals.size,
          disabled: signals.disabled,
          searchable: signals.searchable,
          placeholder: 'Select a fruit...',
          onChange: (v: string) => value.set(v),
        })
      )
    }),
    sections: [
      Section(
        'Grouped Options',
        () => {
          const value = prop<string>('')
          return html.div(
            attr.class('w-56'),
            DropdownInput({
              value,
              options: prop([
                Option.group('Fruits', [
                  Option.value('apple', 'Apple'),
                  Option.value('banana', 'Banana'),
                  Option.value('cherry', 'Cherry'),
                ]),
                Option.break,
                Option.group('Vegetables', [
                  Option.value('carrot', 'Carrot'),
                  Option.value('broccoli', 'Broccoli'),
                  Option.value('spinach', 'Spinach'),
                ]),
              ] as DropdownOption<string>[]),
              placeholder: 'Choose a category...',
              onChange: v => value.set(v),
            })
          )
        },
        'Options can be organized into named groups with break separators.'
      ),
      Section(
        'Searchable',
        () => {
          const value = prop<string>('')
          return html.div(
            attr.class('w-56'),
            DropdownInput({
              value,
              options: prop([
                Option.value('react', 'React'),
                Option.value('vue', 'Vue'),
                Option.value('angular', 'Angular'),
                Option.value('svelte', 'Svelte'),
                Option.value('solid', 'Solid'),
                Option.value('tempo', 'Tempo'),
              ] as DropdownOption<string>[]),
              placeholder: 'Search frameworks...',
              searchable: true,
              onChange: v => value.set(v),
            })
          )
        },
        'Enable the searchable option to let users filter results by typing.'
      ),
      Section(
        'Disabled',
        () => {
          const value = prop<string>('apple')
          return html.div(
            attr.class('w-56'),
            DropdownInput({
              value,
              options: prop(fruitOptions),
              disabled: true,
              onChange: v => value.set(v),
            })
          )
        },
        'Disabled dropdowns cannot be interacted with.'
      ),
      Section(
        'With Placeholder',
        () => {
          const value = prop<string>('')
          return html.div(
            attr.class('w-56'),
            DropdownInput({
              value,
              options: prop(fruitOptions),
              placeholder: 'Pick your favourite...',
              onChange: v => value.set(v),
            })
          )
        },
        'Placeholder text is shown when no option is selected.'
      ),
    ],
  })
}
