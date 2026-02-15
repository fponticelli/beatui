import { html, attr, prop } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  InputWrapper,
  TagsInput,
  SelectTagsInput,
  ComboboxTagsInput,
  Option,
} from '@tempots/beatui'

export default function TagsInputPage() {
  const tags = prop<string[]>(['alpha', 'beta'])

  // Predefined options for select/combobox tags
  const colorOptions = [
    Option.value('red', 'Red'),
    Option.value('green', 'Green'),
    Option.value('blue', 'Blue'),
    Option.group('Warm Colors', [
      Option.value('orange', 'Orange'),
      Option.value('yellow', 'Yellow'),
    ]),
  ]

  const selectedColors1 = prop<string[]>(['red'])
  const selectedColors2 = prop<string[]>([])

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full'),

      // Basic example
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Basic TagsInput'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Type a tag, then unfocus the field (or submit the change) to add it. Click × to remove.'
          ),
          InputWrapper({
            label: 'Tags',
            description: 'Examples: alpha, beta',
            content: TagsInput({
              id: 'basic-tags',
              value: tags,
              onChange: v => tags.set(v),
              placeholder: 'Type and unfocus to add',
            }),
          }),
          html.div(
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            html.strong('Current value: '),
            tags.map(list => list.join(', '))
          )
        )
      ),

      // SelectTagsInput example
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'Select Tags (predefined options)'
          ),
          InputWrapper({
            label: 'Colors',
            description: 'Choose one or more colors',
            content: SelectTagsInput({
              value: selectedColors1,
              onChange: v => selectedColors1.set(v),
              options: colorOptions,
              placeholder: 'Select colors',
            }),
          }),
          html.div(
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            html.strong('Current value: '),
            selectedColors1.map(list => list.join(', '))
          )
        )
      ),

      // ComboboxTagsInput example
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'Combobox Tags (searchable)'
          ),
          InputWrapper({
            label: 'Colors',
            description: 'Search and choose multiple colors',
            content: ComboboxTagsInput({
              value: selectedColors2,
              onChange: v => selectedColors2.set(v),
              options: colorOptions,
              placeholder: 'Select colors',
              searchPlaceholder: 'Search colors',
            }),
          }),
          html.div(
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            html.strong('Current value: '),
            selectedColors2.map(list => list.join(', '))
          )
        )
      ),

      // Disabled example
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Disabled state'),
          InputWrapper({
            label: 'Disabled Tags',
            content: TagsInput({
              value: prop<string[]>(['read', 'only']),
              placeholder: 'Disabled',
              disabled: true,
            }),
          })
        )
      )
    ),
  })
}
