import { html, attr, prop } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  InputWrapper,
  TagsInput,
} from '@tempots/beatui'

export const TagsInputPage = () => {
  const tags = prop<string[]>(['alpha', 'beta'])

  return ScrollablePanel({
    body: Stack(
      attr.class('bu-gap-4 bu-p-4 bu-h-full bu-overflow-hidden'),

      // Basic example
      Card(
        {},
        html.div(
          attr.class('bu-space-y-3'),
          html.h2(attr.class('bu-text-xl bu-font-semibold'), 'Basic TagsInput'),
          html.p(
            attr.class('bu-text-sm bu-text-gray-600'),
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
            attr.class('bu-text-sm bu-text-muted'),
            html.strong('Current value: '),
            tags.map(list => list.join(', '))
          )
        )
      ),

      // Disabled example
      Card(
        {},
        html.div(
          attr.class('bu-space-y-3'),
          html.h2(attr.class('bu-text-lg bu-font-semibold'), 'Disabled state'),
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
