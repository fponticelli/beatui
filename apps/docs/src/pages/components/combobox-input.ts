import { ComboboxInput, Option } from '@tempots/beatui'
import { html, attr, prop, type Signal } from '@tempots/dom'
import type { DropdownOption } from '@tempots/beatui'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ComboboxInput',
  category: 'Dropdowns',
  component: 'Combobox',
  description: 'A searchable combobox with async option loading, keyboard navigation, and custom option rendering.',
  icon: 'lucide:search',
  order: 17,
}

type Fruit = { id: string; name: string; emoji: string }

const allFruits: Fruit[] = [
  { id: 'apple', name: 'Apple', emoji: '' },
  { id: 'banana', name: 'Banana', emoji: '' },
  { id: 'cherry', name: 'Cherry', emoji: '' },
  { id: 'grape', name: 'Grape', emoji: '' },
  { id: 'mango', name: 'Mango', emoji: '' },
  { id: 'orange', name: 'Orange', emoji: '' },
  { id: 'peach', name: 'Peach', emoji: '' },
  { id: 'pear', name: 'Pear', emoji: '' },
  { id: 'pineapple', name: 'Pineapple', emoji: '' },
  { id: 'strawberry', name: 'Strawberry', emoji: '' },
]

function searchFruits(query: string): Promise<DropdownOption<Fruit>[]> {
  const q = query.toLowerCase()
  const results = allFruits
    .filter(f => f.name.toLowerCase().includes(q))
    .map(f => Option.value(f, f.name))
  return Promise.resolve(results)
}

function slowSearch(query: string): Promise<DropdownOption<string>[]> {
  return new Promise(resolve =>
    setTimeout(() => {
      const frameworks = ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Tempo']
      resolve(
        frameworks
          .filter(f => f.toLowerCase().includes(query.toLowerCase()))
          .map(f => Option.value(f, f))
      )
    }, 500)
  )
}

export default function ComboboxInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ComboboxInput', signals => {
      const value = prop<Fruit>(null!)
      return html.div(
        attr.class('w-64'),
        ComboboxInput<Fruit>({
          ...signals,
          value,
          loadOptions: searchFruits,
          renderOption: (fruitSignal: Signal<Fruit>) => fruitSignal.map(f => f?.name ?? ''),
          onChange: (f: Fruit) => value.set(f),
          equality: (a: Fruit, b: Fruit) => a?.id === b?.id,
        })
      )
    }),
    sections: [
      Section(
        'Basic Usage',
        () => {
          const value = prop<Fruit>(null!)
          return html.div(
            attr.class('flex flex-col gap-2 w-64'),
            ComboboxInput<Fruit>({
              value,
              loadOptions: searchFruits,
              renderOption: fruitSignal => fruitSignal.map(f => f?.name ?? ''),
              placeholder: 'Search fruits...',
              onChange: (f: Fruit) => value.set(f),
              equality: (a: Fruit, b: Fruit) => a?.id === b?.id,
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              value.map(f => f ? `Selected: ${f.name}` : 'No selection')
            )
          )
        },
        'Type to search. Options are loaded asynchronously via the loadOptions callback.'
      ),
      Section(
        'Custom Option Rendering',
        () => {
          const value = prop<Fruit>(null!)
          return html.div(
            attr.class('w-64'),
            ComboboxInput<Fruit>({
              value,
              loadOptions: searchFruits,
              renderOption: fruitSignal =>
                html.span(
                  attr.class('flex items-center gap-2'),
                  html.span(fruitSignal.map(f => f?.emoji ?? '')),
                  html.span(fruitSignal.map(f => f?.name ?? ''))
                ),
              renderValue: fruitSignal =>
                html.span(
                  attr.class('flex items-center gap-2'),
                  html.span(fruitSignal.map(f => f?.emoji ?? '')),
                  html.span(fruitSignal.map(f => f?.name ?? ''))
                ),
              placeholder: 'Choose a fruit...',
              onChange: (f: Fruit) => value.set(f),
              equality: (a: Fruit, b: Fruit) => a?.id === b?.id,
            })
          )
        },
        'Use renderOption for dropdown list items and renderValue for the closed trigger display.'
      ),
      Section(
        'Debounce Delay',
        () => {
          const value = prop<string>(null!)
          return html.div(
            attr.class('w-64'),
            ComboboxInput<string>({
              value,
              loadOptions: slowSearch,
              renderOption: s => s.map(v => v ?? ''),
              placeholder: 'Search frameworks... (500ms debounce)',
              debounceMs: 500,
              onChange: (v: string) => value.set(v),
            })
          )
        },
        'Increase debounceMs to reduce the number of requests made to slower APIs.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('w-64'),
            ComboboxInput<Fruit>({
              value: prop<Fruit>(null!),
              loadOptions: searchFruits,
              renderOption: s => s.map(f => f?.name ?? ''),
              placeholder: 'Disabled combobox',
              disabled: true,
              onChange: () => {},
            })
          ),
        'Disabled comboboxes cannot be opened or interacted with.'
      ),
    ],
  })
}
