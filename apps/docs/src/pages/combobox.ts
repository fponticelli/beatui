import { attr, html, prop, style } from '@tempots/dom'
import {
  ComboboxInput,
  Group,
  Icon,
  Option,
  ScrollablePanel,
  Stack,
  useController,
} from '@tempots/beatui'

type Fruit = { id: string; name: string; color: string; emoji: string }

export const ComboboxPage = () => {
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
  const basicValue = prop<Fruit | null>(null)

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
        after: html.span(attr.class('bu-ml-2'), f.emoji),
      })
    )
  }

  // Custom renderers
  const renderOption = (f: Fruit | null) =>
    Group(
      attr.class('bu-gap-2 bu-items-center'),
      html.span(attr.class('bu-font-medium'), f?.name ?? ''),
      html.span(attr.class('bu-text-xs bu-text-light-gray'), `(${f?.id ?? ''})`)
    )

  const renderValue = (f: Fruit | null) =>
    Group(
      attr.class('bu-gap-2 bu-items-center'),
      html.div(
        style.width('0.75rem'),
        style.height('0.75rem'),
        style.borderRadius('50%'),
        style.backgroundColor(f?.color ?? 'transparent')
      ),
      html.span(f?.name ?? '')
    )

  // Form integration example
  const { controller: fruitController } = useController<Fruit | null>({
    initialValue: null,
  })

  return ScrollablePanel({
    body: Stack(
      attr.class('bu-p-6 bu-gap-8'),

      html.h1(attr.class('bu-text-3xl bu-font-bold bu-text-gray'), 'Combobox'),
      html.p(
        attr.class('bu-text-lg bu-text-light-gray'),
        'Searchable dropdown with dynamic options and custom renderers.'
      ),

      // Basic
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Basic Usage'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'Type to search and load matching fruits.'
        ),
        Group(
          attr.class('bu-gap-4 bu-items-end'),
          Stack(
            attr.class('bu-gap-2'),
            style.width('20rem'),
            html.label(
              attr.class('bu-text-sm bu-font-medium bu-text-gray'),
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
            attr.class('bu-text-sm bu-text-light-gray'),
            'Selected: ',
            basicValue.map(v => (v ? v.name : 'None'))
          )
        )
      ),

      // Form integration
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Form Integration'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'Combobox works with BeatUI form controllers.'
        ),
        Group(
          attr.class('bu-gap-4 bu-items-end'),
          Stack(
            attr.class('bu-gap-2'),
            style.width('20rem'),
            ComboboxInput<Fruit | null>({
              value: fruitController.value,
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
            attr.class('bu-text-sm bu-text-light-gray'),
            'Controller value: ',
            fruitController.value.map(v => (v ? v.name : 'None'))
          )
        )
      ),

      // Advanced display (show icons in label)
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Decorated Options'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'Options support before/after slots and custom rendering.'
        ),
        Stack(
          attr.class('bu-gap-2'),
          style.width('20rem'),
          ComboboxInput<Fruit | null>({
            value: basicValue,
            placeholder: 'Choose...',
            loadOptions: async q => {
              const opts = await loadFruitOptions(q)
              // Mark some favorites with an icon in the "after" slot
              return opts.map(o =>
                o.type === 'value' &&
                (o.value.id === 'mango' || o.value.id === 'strawberry')
                  ? {
                      ...o,
                      after: Icon({ icon: 'line-md:star-filled', size: 'sm' }),
                    }
                  : o
              )
            },
            renderOption,
            renderValue,
            onChange: v => basicValue.set(v),
            equality: (a, b) => a?.id === b?.id,
          })
        )
      )
    ),
  })
}
