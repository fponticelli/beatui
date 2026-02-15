import { html, attr } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  Avatar,
  AvatarGroup,
  AvatarGroupOverflow,
} from '@tempots/beatui'

export default function AvatarPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic avatars
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Avatar – Basic'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Display user avatars with initials or icon fallbacks.'
          ),
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Avatar({ name: 'Alice Johnson' }),
            Avatar({ name: 'Bob Smith' }),
            Avatar({ name: 'Charlie Brown' }),
            Avatar({ icon: 'mdi:account' })
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
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Avatars come in six different sizes from xs to 2xl.'
          ),
          html.div(
            attr.class('flex flex-wrap gap-3 items-end'),
            Avatar({ name: 'XS', size: 'xs' }),
            Avatar({ name: 'SM', size: 'sm' }),
            Avatar({ name: 'MD', size: 'md' }),
            Avatar({ name: 'LG', size: 'lg' }),
            Avatar({ name: 'XL', size: 'xl' }),
            Avatar({ name: '2XL', size: '2xl' })
          )
        )
      ),

      // Variants and colors
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Variants & Colors'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Circle or square variants with different theme colors.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Circle (default)'),
              html.div(
                attr.class('flex flex-wrap gap-2'),
                Avatar({ name: 'BA', color: 'base' }),
                Avatar({ name: 'PR', color: 'primary' }),
                Avatar({ name: 'SE', color: 'secondary' }),
                Avatar({ name: 'SU', color: 'success' }),
                Avatar({ name: 'WA', color: 'warning' }),
                Avatar({ name: 'DA', color: 'danger' }),
                Avatar({ name: 'IN', color: 'info' })
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Square'),
              html.div(
                attr.class('flex flex-wrap gap-2'),
                Avatar({ name: 'BA', variant: 'square', color: 'base' }),
                Avatar({ name: 'PR', variant: 'square', color: 'primary' }),
                Avatar({ name: 'SE', variant: 'square', color: 'secondary' }),
                Avatar({ name: 'SU', variant: 'square', color: 'success' }),
                Avatar({ name: 'WA', variant: 'square', color: 'warning' }),
                Avatar({ name: 'DA', variant: 'square', color: 'danger' }),
                Avatar({ name: 'IN', variant: 'square', color: 'info' })
              )
            )
          )
        )
      ),

      // Bordered and with icons
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Bordered & Icons'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Avatars with borders or custom icons as fallbacks.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'With borders'),
              html.div(
                attr.class('flex flex-wrap gap-2'),
                Avatar({ name: 'AB', bordered: true, color: 'primary' }),
                Avatar({
                  name: 'CD',
                  bordered: true,
                  color: 'success',
                  size: 'lg',
                }),
                Avatar({ icon: 'mdi:account', bordered: true, color: 'danger' })
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Icon fallbacks'),
              html.div(
                attr.class('flex flex-wrap gap-2'),
                Avatar({ icon: 'mdi:account', color: 'base' }),
                Avatar({ icon: 'mdi:briefcase', color: 'primary' }),
                Avatar({ icon: 'mdi:shield-account', color: 'success' }),
                Avatar({ icon: 'mdi:robot', color: 'info' })
              )
            )
          )
        )
      ),

      // Avatar groups
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Avatar Groups'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Group multiple avatars with overlapping or normal spacing.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'Tight spacing (overlapping)'
              ),
              AvatarGroup(
                { spacing: 'tight' },
                Avatar({ name: 'Alice Johnson', color: 'primary' }),
                Avatar({ name: 'Bob Smith', color: 'success' }),
                Avatar({ name: 'Charlie Brown', color: 'warning' }),
                Avatar({ name: 'Diana Prince', color: 'danger' })
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'With overflow indicator'
              ),
              AvatarGroup(
                { spacing: 'tight', size: 'lg' },
                Avatar({ name: 'Alice Johnson', color: 'primary' }),
                Avatar({ name: 'Bob Smith', color: 'success' }),
                Avatar({ name: 'Charlie Brown', color: 'warning' }),
                AvatarGroupOverflow({ count: 12, color: 'base' })
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Normal spacing'),
              AvatarGroup(
                { spacing: 'normal' },
                Avatar({ name: 'Alice Johnson', color: 'primary' }),
                Avatar({ name: 'Bob Smith', color: 'success' }),
                Avatar({ name: 'Charlie Brown', color: 'warning' }),
                Avatar({ name: 'Diana Prince', color: 'danger' })
              )
            )
          )
        )
      )
    ),
  })
}
