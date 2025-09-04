import { html, attr, prop, ForEach } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Tag } from '@tempots/beatui'

export default function TagsPage() {
  // For closable example
  const closable = prop<string[]>(['alpha', 'beta', 'gamma', 'delta'])
  const removeClosable = (v: string) =>
    closable.set(closable.value.filter(t => t !== v))

  return ScrollablePanel({
    body: Stack(
      attr.class('bu-gap-4 bu-p-4 bu-h-full bu-overflow-hidden'),

      // Basic colors
      Card(
        {},
        html.div(
          attr.class('bu-space-y-3'),
          html.h2(attr.class('bu-text-xl bu-font-semibold'), 'Tag – Basic'),
          html.p(
            attr.class('bu-text-sm bu-text-gray-600'),
            'Simple Tag component with common colors.'
          ),
          html.div(
            attr.class('bu-flex-row bu-flex-wrap bu-gap-2'),
            Tag({ value: 'Base' }),
            Tag({ value: 'Primary', color: 'primary' }),
            Tag({ value: 'Secondary', color: 'secondary' }),
            Tag({ value: 'Success', color: 'success' }),
            Tag({ value: 'Warning', color: 'warning' }),
            Tag({ value: 'Error', color: 'error' }),
            Tag({ value: 'Disabled', class: 'bc-tag--disabled' })
          )
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('bu-space-y-3'),
          html.h2(attr.class('bu-text-lg bu-font-semibold'), 'Sizes'),
          html.div(
            attr.class('bu-flex-row bu-flex-wrap bu-gap-2 bu-items-center'),
            Tag({ value: 'XS', size: 'xs', color: 'primary' }),
            Tag({ value: 'SM', size: 'sm', color: 'primary' }),
            Tag({ value: 'MD', size: 'md', color: 'primary' }),
            Tag({ value: 'LG', size: 'lg', color: 'primary' }),
            Tag({ value: 'XL', size: 'xl', color: 'primary' })
          )
        )
      ),

      // Closable tags
      Card(
        {},
        html.div(
          attr.class('bu-space-y-3'),
          html.h2(attr.class('bu-text-lg bu-font-semibold'), 'Closable'),
          html.p(
            attr.class('bu-text-sm bu-text-gray-600'),
            'Tags can display a close button when onClose is provided.'
          ),
          html.div(
            attr.class('bu-flex-row bu-flex-wrap bu-gap-2'),
            ForEach(closable, v =>
              Tag({
                value: v,
                color: 'info',
                onClose: removeClosable,
                disabled: v.map(v => v === 'delta'),
              })
            )
          )
        )
      )
    ),
  })
}
