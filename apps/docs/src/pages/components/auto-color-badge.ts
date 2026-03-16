import { AutoColorBadge, RangeSlider } from '@tempots/beatui'
import type { HSLRange } from '@tempots/beatui'
import { html, attr, on, prop, Value, ForEach } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'AutoColorBadge',
  category: 'Data Display',
  component: 'AutoColorBadge',
  description:
    'A badge that derives a stable background color from its text content. The text is hashed to produce deterministic HSL values, with automatic black/white text for contrast.',
  icon: 'lucide:palette',
  order: 3,
}

const SAMPLE_TAGS = [
  'TypeScript',
  'React',
  'Rust',
  'Python',
  'Go',
  'Swift',
  'Kotlin',
  'Ruby',
  'Elixir',
  'Haskell',
  'C++',
  'Java',
  'Scala',
  'Zig',
  'Lua',
  'Dart',
]

export default function AutoColorBadgePage() {
  return ComponentPage(meta, {
    playground: manualPlayground('AutoColorBadge', signals => {
      const text = prop('TypeScript')
      return html.div(
        attr.class('flex flex-col gap-4 w-full'),
        html.div(
          attr.class('flex flex-wrap gap-2'),
          AutoColorBadge(signals, text)
        ),
        html.div(
          attr.class('flex items-center gap-2'),
          html.label(attr.class('text-sm'), 'Text:'),
          html.input(
            attr.type('text'),
            attr.value('TypeScript'),
            attr.class(
              'px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800'
            ),
            on.input(e => text.set((e.target as HTMLInputElement).value))
          )
        )
      )
    }),
    sections: [
      Section(
        'Automatic Color from Text',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2'),
            ...SAMPLE_TAGS.map(tag => AutoColorBadge({}, tag))
          ),
        'Each badge derives a unique, stable color from its text content. The same text always produces the same color.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            AutoColorBadge({ size: 'xs' }, 'Extra Small'),
            AutoColorBadge({ size: 'sm' }, 'Small'),
            AutoColorBadge({ size: 'md' }, 'Medium'),
            AutoColorBadge({ size: 'lg' }, 'Large'),
            AutoColorBadge({ size: 'xl' }, 'Extra Large')
          ),
        'Supports all standard control sizes via the size prop.'
      ),
      Section(
        'Warm Hues',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2'),
            ...['Sunset', 'Ember', 'Amber', 'Coral', 'Flame', 'Peach'].map(
              tag => AutoColorBadge({ hue: { min: 0, max: 50 } }, tag)
            )
          ),
        'Restrict the hue range to warm tones (reds, oranges, yellows).'
      ),
      Section(
        'Cool Hues',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2'),
            ...['Ocean', 'Sky', 'Frost', 'Cobalt', 'Mint', 'Teal'].map(tag =>
              AutoColorBadge({ hue: { min: 180, max: 270 } }, tag)
            )
          ),
        'Restrict the hue range to cool tones (blues, cyans, purples).'
      ),
      Section(
        'Pastel Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2'),
            ...['Design', 'UX', 'Branding', 'Motion', 'Layout', 'Color'].map(
              tag =>
                AutoColorBadge(
                  {
                    saturation: { min: 40, max: 60 },
                    lightness: { min: 72, max: 85 },
                  },
                  tag
                )
            )
          ),
        'Use high lightness and moderate saturation for soft pastel badges.'
      ),
      Section(
        'Vivid Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2'),
            ...['Critical', 'Urgent', 'Warning', 'Active', 'Live', 'Hot'].map(
              tag =>
                AutoColorBadge(
                  {
                    saturation: { min: 80, max: 95 },
                    lightness: { min: 40, max: 50 },
                  },
                  tag
                )
            )
          ),
        'High saturation and low lightness for bold, vivid badges.'
      ),
      Section(
        'Reactive HSL Ranges',
        () => {
          const lightness = prop<HSLRange>({ min: 40, max: 65 })
          const tags = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']

          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            html.div(
              attr.class('flex flex-wrap gap-2'),
              ...tags.map(tag => AutoColorBadge({ lightness }, tag))
            ),
            html.div(
              attr.class('flex items-center gap-3'),
              html.label(attr.class('text-sm w-24'), 'Lightness:'),
              RangeSlider({
                min: 0,
                max: 100,
                value: lightness.$.min,
                onChange: v => lightness.set({ min: v, max: v }),
                ticks: [
                  { value: 10, label: '10%' },
                  { value: 20, label: '20%' },
                  { value: 30, label: '30%' },
                  { value: 40, label: '40%' },
                  { value: 50, label: '50%' },
                  { value: 60, label: '60%' },
                  { value: 70, label: '70%' },
                  { value: 80, label: '80%' },
                  { value: 90, label: '90%' },
                ],
              })
              // html.input(
              //   attr.type('range'),
              //   attr.min(10),
              //   attr.max(90),
              //   attr.value('40'),
              //   attr.class('flex-1'),
              //   on.input(e => {
              //     const v = Number((e.target as HTMLInputElement).value)
              //     lightness.set({ min: v, max: Math.min(v + 25, 95) })
              //   })
              // )
            )
          )
        },
        'HSL range options accept reactive signals. Move the slider to change lightness — text color flips for contrast.'
      ),
      Section(
        'Dynamic Tag List',
        () => {
          const tags = prop<string[]>(['React', 'Vue', 'Svelte'])
          const input = prop('')

          return html.div(
            attr.class('flex flex-col gap-3 w-full'),
            html.div(
              attr.class('flex flex-wrap gap-2 min-h-[2rem]'),
              ForEach(tags, tag => AutoColorBadge({ size: 'sm' }, tag))
            ),
            html.div(
              attr.class('flex gap-2'),
              html.input(
                attr.type('text'),
                attr.placeholder('Add a tag...'),
                attr.class(
                  'px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 flex-1'
                ),
                on.input(e => input.set((e.target as HTMLInputElement).value)),
                on.keydown(e => {
                  const el = e.target as HTMLInputElement
                  if (e.key === 'Enter' && el.value.trim()) {
                    tags.update(t => [...t, el.value.trim()])
                    el.value = ''
                    input.set('')
                  }
                })
              )
            )
          )
        },
        'Type a tag name and press Enter. Each new tag gets a unique, deterministic color.'
      ),
    ],
  })
}
