import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Badge, Icon } from '@tempots/beatui'

export default function BadgePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic variants
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Badge – Variants'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Badge component with different visual variants.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            Badge({ variant: 'filled', color: 'primary' }, 'Filled'),
            Badge({ variant: 'light', color: 'primary' }, 'Light'),
            Badge({ variant: 'outline', color: 'primary' }, 'Outline'),
            Badge({ variant: 'default', color: 'primary' }, 'Default'),
            Badge({ variant: 'text', color: 'primary' }, 'Text')
          )
        )
      ),

      // Colors
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Colors'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Badges support all theme colors.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2'),
            Badge({ color: 'base' }, 'Base'),
            Badge({ color: 'primary' }, 'Primary'),
            Badge({ color: 'secondary' }, 'Secondary'),
            Badge({ color: 'success' }, 'Success'),
            Badge({ color: 'warning' }, 'Warning'),
            Badge({ color: 'danger' }, 'Danger'),
            Badge({ color: 'info' }, 'Info')
          )
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Sizes'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Badges come in 5 different sizes.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            Badge({ size: 'xs', color: 'primary' }, 'XS'),
            Badge({ size: 'sm', color: 'primary' }, 'SM'),
            Badge({ size: 'md', color: 'primary' }, 'MD'),
            Badge({ size: 'lg', color: 'primary' }, 'LG'),
            Badge({ size: 'xl', color: 'primary' }, 'XL')
          )
        )
      ),

      // Roundedness
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Roundedness'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Control the border radius of badges.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            Badge({ roundedness: 'none', color: 'primary' }, 'None'),
            Badge({ roundedness: 'xs', color: 'primary' }, 'XS'),
            Badge({ roundedness: 'sm', color: 'primary' }, 'SM'),
            Badge({ roundedness: 'md', color: 'primary' }, 'MD'),
            Badge({ roundedness: 'lg', color: 'primary' }, 'LG'),
            Badge({ roundedness: 'xl', color: 'primary' }, 'XL'),
            Badge({ roundedness: 'full', color: 'primary' }, 'Full')
          )
        )
      ),

      // Circle badges
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Circle Badges'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Circle badges are perfect for notification counts and status indicators.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            Badge({ circle: true, size: 'xs', color: 'danger' }, '1'),
            Badge({ circle: true, size: 'sm', color: 'danger' }, '5'),
            Badge({ circle: true, size: 'md', color: 'danger' }, '12'),
            Badge({ circle: true, size: 'lg', color: 'danger' }, '99'),
            Badge({ circle: true, size: 'xl', color: 'danger' }, '999')
          )
        )
      ),

      // With icons
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Icons'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Badges can contain icons and text with automatic spacing.'
          ),
          html.div(
            attr.class('flex flex-row flex-wrap gap-2 items-center'),
            Badge(
              { color: 'success' },
              Icon({ icon: 'lucide:check', size: 'sm' }),
              'Verified'
            ),
            Badge(
              { color: 'warning' },
              Icon({ icon: 'lucide:alert-triangle', size: 'sm' }),
              'Warning'
            ),
            Badge(
              { color: 'danger' },
              Icon({ icon: 'lucide:x', size: 'sm' }),
              'Error'
            ),
            Badge(
              { color: 'info' },
              Icon({ icon: 'lucide:info', size: 'sm' }),
              'Info'
            )
          )
        )
      ),

      // Full width
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Full Width'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Badges can expand to fill their container width.'
          ),
          html.div(
            attr.class('flex flex-col gap-2'),
            Badge(
              { fullWidth: true, color: 'primary' },
              Icon({ icon: 'lucide:star', size: 'sm' }),
              'Featured Item'
            ),
            Badge(
              { fullWidth: true, variant: 'light', color: 'success' },
              Icon({ icon: 'lucide:check-circle', size: 'sm' }),
              'Completed'
            ),
            Badge(
              { fullWidth: true, variant: 'outline', color: 'warning' },
              Icon({ icon: 'lucide:clock', size: 'sm' }),
              'Pending'
            )
          )
        )
      ),

      // Use cases
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Common Use Cases'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Examples of common badge usage patterns.'
          ),
          html.div(
            attr.class('space-y-4'),
            // Status badges
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Status Indicators'),
              html.div(
                attr.class('flex flex-row flex-wrap gap-2'),
                Badge(
                  { variant: 'light', color: 'success', size: 'sm' },
                  'Active'
                ),
                Badge(
                  { variant: 'light', color: 'warning', size: 'sm' },
                  'Pending'
                ),
                Badge(
                  { variant: 'light', color: 'danger', size: 'sm' },
                  'Inactive'
                ),
                Badge({ variant: 'light', color: 'base', size: 'sm' }, 'Draft')
              )
            ),
            // Category badges
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Categories'),
              html.div(
                attr.class('flex flex-row flex-wrap gap-2'),
                Badge({ variant: 'outline', size: 'sm' }, 'TypeScript'),
                Badge({ variant: 'outline', size: 'sm' }, 'React'),
                Badge({ variant: 'outline', size: 'sm' }, 'CSS'),
                Badge({ variant: 'outline', size: 'sm' }, 'Design')
              )
            ),
            // Notification badges
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Notifications'),
              html.div(
                attr.class('flex flex-row flex-wrap gap-2 items-center'),
                html.div(
                  attr.class('relative inline-block'),
                  Icon({ icon: 'lucide:bell', size: 'lg' }),
                  html.span(
                    attr.class('absolute -top-1 -right-1'),
                    Badge({ circle: true, size: 'xs', color: 'danger' }, '3')
                  )
                ),
                html.div(
                  attr.class('relative inline-block'),
                  Icon({ icon: 'lucide:mail', size: 'lg' }),
                  html.span(
                    attr.class('absolute -top-1 -right-1'),
                    Badge({ circle: true, size: 'xs', color: 'primary' }, '12')
                  )
                )
              )
            )
          )
        )
      )
    ),
  })
}
