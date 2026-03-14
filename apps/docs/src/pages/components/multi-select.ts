import { MultiSelect, Option } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import type { DropdownOption } from '@tempots/beatui'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'MultiSelect',
  category: 'Dropdowns',
  component: 'MultiSelect',
  description:
    'A fully-featured multi-select dropdown with search, keyboard navigation, async loading, and select/clear all actions.',
  icon: 'lucide:list-checks',
  order: 18,
}

const colorOptions: DropdownOption<string>[] = [
  Option.value('red', 'Red'),
  Option.value('green', 'Green'),
  Option.value('blue', 'Blue'),
  Option.value('orange', 'Orange'),
  Option.value('purple', 'Purple'),
  Option.value('teal', 'Teal'),
  Option.value('pink', 'Pink'),
  Option.value('yellow', 'Yellow'),
]

const groupedOptions: DropdownOption<string>[] = [
  Option.group('Frontend', [
    Option.value('react', 'React'),
    Option.value('vue', 'Vue'),
    Option.value('angular', 'Angular'),
    Option.value('svelte', 'Svelte'),
    Option.value('tempo', 'Tempo'),
  ]),
  Option.break,
  Option.group('Backend', [
    Option.value('node', 'Node.js'),
    Option.value('deno', 'Deno'),
    Option.value('bun', 'Bun'),
    Option.value('express', 'Express'),
  ]),
]

const allFrameworks = [
  'React',
  'Vue',
  'Angular',
  'Svelte',
  'Solid',
  'Tempo',
  'Preact',
  'Lit',
  'Qwik',
  'Astro',
  'Next.js',
  'Nuxt',
  'Remix',
]

function asyncLoadOptions(query: string): Promise<DropdownOption<string>[]> {
  return new Promise(resolve =>
    setTimeout(() => {
      const q = query.toLowerCase()
      resolve(
        allFrameworks
          .filter(f => f.toLowerCase().includes(q))
          .map(f => Option.value(f.toLowerCase(), f))
      )
    }, 400)
  )
}

export default function MultiSelectPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('MultiSelect', signals => {
      const values = prop<string[]>(['red', 'blue'])
      return html.div(
        attr.class('w-80'),
        MultiSelect<string>({
          size: signals.size,
          disabled: signals.disabled,
          placeholder: signals.placeholder,
          value: values,
          options: colorOptions,
          showActions: true,
          onChange: (v: string[]) => values.set(v),
        })
      )
    }),
    sections: [
      Section(
        'Basic Usage',
        () => {
          const selected = prop<string[]>([])
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            MultiSelect<string>({
              value: selected,
              options: colorOptions,
              placeholder: 'Select colors...',
              searchPlaceholder: 'Search colors...',
              onChange: (v: string[]) => selected.set(v),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v =>
                v.length > 0 ? `Selected: ${v.join(', ')}` : 'None selected'
              )
            )
          )
        },
        'Click to open the dropdown, search to filter, and click options to toggle selection. Selected values appear as removable chips.'
      ),
      Section(
        'Grouped Options',
        () => {
          const selected = prop<string[]>(['tempo'])
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            MultiSelect<string>({
              value: selected,
              options: groupedOptions,
              placeholder: 'Select frameworks...',
              searchPlaceholder: 'Search...',
              onChange: (v: string[]) => selected.set(v),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v =>
                v.length > 0 ? `Selected: ${v.join(', ')}` : 'None selected'
              )
            )
          )
        },
        'Options can be organized into labeled groups with separators between them.'
      ),
      Section(
        'Async Loading',
        () => {
          const selected = prop<string[]>([])
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            MultiSelect<string>({
              value: selected,
              options: [],
              loadOptions: asyncLoadOptions,
              loadDebounce: 300,
              placeholder: 'Search frameworks...',
              searchPlaceholder: 'Type to search...',
              onChange: (v: string[]) => selected.set(v),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v =>
                v.length > 0 ? `Selected: ${v.join(', ')}` : 'None selected'
              )
            )
          )
        },
        'Use loadOptions to fetch options asynchronously. A loading indicator appears while results are being fetched.'
      ),
      Section(
        'Max Selection Limit',
        () => {
          const selected = prop<string[]>([])
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            MultiSelect<string>({
              value: selected,
              options: colorOptions,
              maxSelection: 3,
              placeholder: 'Select up to 3...',
              searchPlaceholder: 'Search...',
              onChange: (v: string[]) => selected.set(v),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v => `${v.length} / 3 selected`)
            )
          )
        },
        'Limit selections with maxSelection. Once the limit is reached, unselected options become disabled.'
      ),
      Section(
        'Select All / Clear All',
        () => {
          const selected = prop<string[]>([])
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            MultiSelect<string>({
              value: selected,
              options: colorOptions,
              showActions: true,
              placeholder: 'Select colors...',
              searchPlaceholder: 'Search...',
              onChange: (v: string[]) => selected.set(v),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v =>
                v.length > 0 ? `Selected: ${v.join(', ')}` : 'None selected'
              )
            )
          )
        },
        'Enable showActions to display "Select all" and "Clear all" buttons in the dropdown header.'
      ),
      Section(
        'Custom Option Rendering',
        () => {
          const selected = prop<string[]>([])
          const emojiOptions: DropdownOption<string>[] = [
            Option.value('fire', 'Fire'),
            Option.value('star', 'Star'),
            Option.value('heart', 'Heart'),
            Option.value('bolt', 'Lightning'),
            Option.value('gem', 'Diamond'),
          ]
          const emojis: Record<string, string> = {
            fire: '\u{1F525}',
            star: '\u2B50',
            heart: '\u2764\uFE0F',
            bolt: '\u26A1',
            gem: '\u{1F48E}',
          }
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            MultiSelect<string>({
              value: selected,
              options: emojiOptions,
              placeholder: 'Pick icons...',
              searchPlaceholder: 'Search...',
              renderOption: (opt, _selected) =>
                html.span(
                  attr.class('flex items-center gap-2'),
                  html.span(emojis[opt.value] ?? ''),
                  html.span(opt.label)
                ),
              onChange: (v: string[]) => selected.set(v),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              selected.map(v =>
                v.length > 0
                  ? v.map(k => emojis[k] ?? k).join(' ')
                  : 'None selected'
              )
            )
          )
        },
        'Use renderOption to customize how each option is displayed in the dropdown list.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('w-80'),
            MultiSelect<string>({
              value: ['red', 'blue'],
              options: colorOptions,
              disabled: true,
              onChange: () => {},
            })
          ),
        'Disabled MultiSelect prevents opening the dropdown or modifying selections.'
      ),
    ],
  })
}
