import { attr, Ensure, html, prop, Signal, style } from '@tempots/dom'
import {
  ComboboxInput,
  Group,
  Option,
  ScrollablePanel,
  Stack,
  useController,
} from '@tempots/beatui'

type Fruit = { id: string; name: string; color: string; emoji: string }

export default function ComboboxPage() {
  // Demo dataset for async filtering
  const allFruits = [
    { id: 'apple', name: 'Apple', color: '#ef4444', emoji: '🍎' },
    { id: 'banana', name: 'Banana', color: '#f59e0b', emoji: '🍌' },
    { id: 'cherry', name: 'Cherry', color: '#dc2626', emoji: '🍒' },
    { id: 'date', name: 'Date', color: '#92400e', emoji: '🌰' },
    { id: 'elderberry', name: 'Elderberry', color: '#6d28d9', emoji: '🍇' },
    { id: 'fig', name: 'Fig', color: '#7c3aed', emoji: '🟣' },
    { id: 'grape', name: 'Grape', color: '#8b5cf6', emoji: '🍇' },
    { id: 'kiwi', name: 'Kiwi', color: '#16a34a', emoji: '🥝' },
    { id: 'lemon', name: 'Lemon', color: '#facc15', emoji: '🍋' },
    { id: 'mango', name: 'Mango', color: '#f97316', emoji: '🥭' },
    { id: 'orange', name: 'Orange', color: '#fb923c', emoji: '🍊' },
    { id: 'pear', name: 'Pear', color: '#84cc16', emoji: '🍐' },
    { id: 'pineapple', name: 'Pineapple', color: '#f59e0b', emoji: '🍍' },
    { id: 'strawberry', name: 'Strawberry', color: '#ef4444', emoji: '🍓' },
    { id: 'watermelon', name: 'Watermelon', color: '#10b981', emoji: '🍉' },
  ]

  // Basic example
  const basicValue = prop<Fruit | null>(allFruits[0])

  const loadFruitOptions = async (search: string) => {
    const q = search.trim().toLowerCase()
    const filtered = allFruits.filter(
      f =>
        q.length === 0 || f.name.toLowerCase().includes(q) || f.id.includes(q)
    )
    // Simulate async
    await new Promise(r => setTimeout(r, 120))
    return filtered.map(f =>
      Option.value<Fruit>(f, f.name, {
        before: html.div(
          style.width('1rem'),
          style.height('1rem'),
          style.borderRadius('50%'),
          style.backgroundColor(f.color)
        ),
        after: html.span(attr.class('ml--2'), f.emoji),
      })
    )
  }

  // Custom renderers
  const renderOption = (f: Signal<Fruit | null>) =>
    Ensure(f, f =>
      Group(
        attr.class('gap-2 items-center'),
        html.span(attr.class('font-medium'), f.$.name),
        html.span(
          attr.class('text-xs text-gray-500'),
          f.$.id.map(id => `(${id})`)
        )
      )
    )

  const renderValue = (f: Signal<Fruit | null>) =>
    Ensure(f, f =>
      Group(
        attr.class('gap-2 items-center'),
        html.div(
          style.width('0.75rem'),
          style.height('0.75rem'),
          style.borderRadius('50%'),
          style.backgroundColor(f.$.color)
        ),
        html.span(f.$.name)
      )
    )

  // Form integration example
  const { controller: fruitController } = useController<Fruit | null>({
    initialValue: null,
  })

  return ScrollablePanel({
    body: Stack(
      attr.class('p-6 gap-8'),

      html.h1(attr.class('text-3xl font-bold text-gray-600'), 'Combobox'),
      html.p(
        attr.class('text-lg text-gray-500'),
        'Searchable dropdown with dynamic options and custom renderers.'
      ),

      // Basic
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600'),
          'Basic Usage'
        ),
        html.p(
          attr.class('text-gray-500'),
          'Type to search and load matching fruits.'
        ),
        Group(
          attr.class('gap-4 items-end'),
          Stack(
            attr.class('gap-2'),
            style.width('20rem'),
            html.label(
              attr.class('text-sm font-medium text-gray-600'),
              'Select a fruit:'
            ),
            ComboboxInput<Fruit | null>({
              value: basicValue,
              placeholder: 'Choose a fruit...',
              searchPlaceholder: 'Search fruits...',
              loadOptions: loadFruitOptions,
              renderOption,
              renderValue,
              onChange: v => basicValue.set(v),
              equality: (a, b) => a?.id === b?.id,
            })
          ),
          html.div(
            attr.class('text-sm text-gray-500'),
            'Selected: ',
            basicValue.map(v => (v ? v.name : 'None'))
          )
        )
      ),

      // Form integration
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600'),
          'Form Integration'
        ),
        html.p(
          attr.class('text-gray-500'),
          'Combobox works with BeatUI form controllers.'
        ),
        Group(
          attr.class('gap-4 items-end'),
          Stack(
            attr.class('gap-2'),
            style.width('20rem'),
            ComboboxInput<Fruit | null>({
              value: fruitController.signal,
              placeholder: 'Choose...',
              searchPlaceholder: 'Type to search...',
              loadOptions: loadFruitOptions,
              renderOption,
              renderValue,
              onChange: v => fruitController.change(v),
              equality: (a, b) => a?.id === b?.id,
            })
          ),
          html.div(
            attr.class('text-sm text-gray-500'),
            'Controller value: ',
            fruitController.signal.map(v => (v ? v.name : 'None'))
          )
        )
      )
    ),
  })
}
