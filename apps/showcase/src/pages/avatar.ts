import { html, attr } from '@tempots/dom'
import { Avatar, AvatarGroup, AvatarGroupOverflow } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { Section, SectionBlock } from '../views/section'

export default function AvatarPage() {
  return WidgetPage({
    id: 'avatar',
    title: 'Avatar',
    description: 'User avatars with initials, icons, and grouping.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      Section(
        'Basic',
        Avatar({ name: 'Alice Johnson' }),
        Avatar({ name: 'Bob Smith' }),
        Avatar({ name: 'Charlie Brown' }),
        Avatar({ icon: 'mdi:account' })
      ),

      Section(
        'Sizes',
        Avatar({ name: 'XS', size: 'xs' }),
        Avatar({ name: 'SM', size: 'sm' }),
        Avatar({ name: 'MD', size: 'md' }),
        Avatar({ name: 'LG', size: 'lg' }),
        Avatar({ name: 'XL', size: 'xl' }),
        Avatar({ name: '2X', size: '2xl' })
      ),

      SectionBlock(
        'Variants & Colors',
        html.div(
          attr.class('space-y-3'),
          html.p(attr.class('text-sm font-medium'), 'Circle'),
          html.div(
            attr.class('flex flex-wrap gap-2'),
            Avatar({ name: 'PR', color: 'primary' }),
            Avatar({ name: 'SE', color: 'secondary' }),
            Avatar({ name: 'SU', color: 'success' }),
            Avatar({ name: 'WA', color: 'warning' }),
            Avatar({ name: 'DA', color: 'danger' }),
            Avatar({ name: 'IN', color: 'info' })
          )
        ),
        html.div(
          attr.class('space-y-3 mt-4'),
          html.p(attr.class('text-sm font-medium'), 'Square'),
          html.div(
            attr.class('flex flex-wrap gap-2'),
            Avatar({ name: 'PR', variant: 'square', color: 'primary' }),
            Avatar({ name: 'SE', variant: 'square', color: 'secondary' }),
            Avatar({ name: 'SU', variant: 'square', color: 'success' }),
            Avatar({ name: 'WA', variant: 'square', color: 'warning' }),
            Avatar({ name: 'DA', variant: 'square', color: 'danger' }),
            Avatar({ name: 'IN', variant: 'square', color: 'info' })
          )
        )
      ),

      Section(
        'Bordered & Icons',
        Avatar({ name: 'AB', bordered: true, color: 'primary' }),
        Avatar({ name: 'CD', bordered: true, color: 'success', size: 'lg' }),
        Avatar({ icon: 'mdi:account', bordered: true, color: 'danger' }),
        Avatar({ icon: 'mdi:account', color: 'base' }),
        Avatar({ icon: 'mdi:briefcase', color: 'primary' }),
        Avatar({ icon: 'mdi:shield-account', color: 'success' }),
        Avatar({ icon: 'mdi:robot', color: 'info' })
      ),

      SectionBlock(
        'Avatar Groups',
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('space-y-2'),
            html.p(attr.class('text-sm font-medium'), 'Tight (overlapping)'),
            AvatarGroup(
              { spacing: 'tight' },
              Avatar({ name: 'Alice', color: 'primary' }),
              Avatar({ name: 'Bob', color: 'success' }),
              Avatar({ name: 'Charlie', color: 'warning' }),
              Avatar({ name: 'Diana', color: 'danger' })
            )
          ),
          html.div(
            attr.class('space-y-2'),
            html.p(attr.class('text-sm font-medium'), 'With overflow'),
            AvatarGroup(
              { spacing: 'tight', size: 'lg' },
              Avatar({ name: 'Alice', color: 'primary' }),
              Avatar({ name: 'Bob', color: 'success' }),
              Avatar({ name: 'Charlie', color: 'warning' }),
              AvatarGroupOverflow({ count: 12, color: 'base' })
            )
          ),
          html.div(
            attr.class('space-y-2'),
            html.p(attr.class('text-sm font-medium'), 'Normal spacing'),
            AvatarGroup(
              { spacing: 'normal' },
              Avatar({ name: 'Alice', color: 'primary' }),
              Avatar({ name: 'Bob', color: 'success' }),
              Avatar({ name: 'Charlie', color: 'warning' })
            )
          )
        )
      )
    ),
  })
}
