import { html, attr, prop, ForEach } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Badge } from '@tempots/beatui'

export default function TagsPage() {
  // For closable example
  const closable = prop<string[]>(['alpha', 'beta', 'gamma', 'delta'])
  const removeClosable = (v: string) =>
    closable.set(closable.value.filter(t => t !== v))

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-hidden'),

      // Basic colors
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Badge – Basic'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Simple Badge component with common colors.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2'),
            Badge({ variant: 'light' }, 'Base'),
            Badge({ variant: 'light', color: 'primary' }, 'Primary'),
            Badge({ variant: 'light', color: 'secondary' }, 'Secondary'),
            Badge({ variant: 'light', color: 'success' }, 'Success'),
            Badge({ variant: 'light', color: 'warning' }, 'Warning'),
            Badge({ variant: 'light', color: 'danger' }, 'Danger'),
            Badge({ variant: 'light', disabled: true }, 'Disabled')
          )
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Sizes'),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            Badge({ variant: 'light', size: 'xs', color: 'primary' }, 'XS'),
            Badge({ variant: 'light', size: 'sm', color: 'primary' }, 'SM'),
            Badge({ variant: 'light', size: 'md', color: 'primary' }, 'MD'),
            Badge({ variant: 'light', size: 'lg', color: 'primary' }, 'LG'),
            Badge({ variant: 'light', size: 'xl', color: 'primary' }, 'XL')
          )
        )
      ),

      // Closable badges
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Closable'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Badges can display a close button when onClose is provided.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2'),
            ForEach(closable, v =>
              Badge(
                {
                  variant: 'light',
                  color: 'info',
                  onClose: () => removeClosable(v.value),
                  disabled: v.map(v => v === 'delta'),
                },
                v
              )
            )
          )
        )
      )
    ),
  })
}
