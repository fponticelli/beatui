import { Avatar, AvatarGroup, AvatarGroupOverflow } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Avatar',
  category: 'Data Display',
  component: 'Avatar',
  description:
    'Displays a user avatar with image, initials, or icon fallback.',
  icon: 'lucide:user-circle',
  order: 1,
}

export default function AvatarPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Avatar', props =>
      Avatar(props),
      { name: 'John Doe' }
    ),
    sections: [
      ...AutoSections('Avatar', props => Avatar(props)),
      Section(
        'Initials Fallback',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Avatar({ name: 'Alice Johnson', color: 'primary' }),
            Avatar({ name: 'Bob Smith', color: 'success' }),
            Avatar({ name: 'Charlie Brown', color: 'warning' }),
            Avatar({ name: 'Diana Prince', color: 'danger' })
          ),
        'When no image is provided, initials are derived from the name prop.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Avatar({ name: 'XS', size: 'xs', color: 'primary' }),
            Avatar({ name: 'SM', size: 'sm', color: 'primary' }),
            Avatar({ name: 'MD', size: 'md', color: 'primary' }),
            Avatar({ name: 'LG', size: 'lg', color: 'primary' }),
            Avatar({ name: 'XL', size: 'xl', color: 'primary' }),
            Avatar({ name: '2XL', size: '2xl', color: 'primary' })
          ),
        'Avatars scale from xs (24px) to 2xl (96px).'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Avatar({ name: 'Circle', variant: 'circle', color: 'info' }),
            Avatar({ name: 'Square', variant: 'square', color: 'info' })
          ),
        'Avatars can be rendered as circles (default) or squares.'
      ),
      Section(
        'Bordered',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Avatar({ name: 'Alice', bordered: true, color: 'primary' }),
            Avatar({ name: 'Bob', bordered: true, color: 'success' }),
            Avatar({
              icon: 'mdi:account',
              bordered: true,
              color: 'secondary',
            })
          ),
        'Add a border ring around the avatar with the bordered prop.'
      ),
      Section(
        'Icon Fallback',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Avatar({ icon: 'mdi:account', color: 'base' }),
            Avatar({ icon: 'mdi:robot', color: 'primary' }),
            Avatar({ icon: 'mdi:shield-account', color: 'success' })
          ),
        'When no name is provided, an Iconify icon can be used as fallback.'
      ),
      Section(
        'AvatarGroup',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            AvatarGroup({ spacing: 'tight' },
              Avatar({ name: 'Alice Johnson', color: 'primary' }),
              Avatar({ name: 'Bob Smith', color: 'success' }),
              Avatar({ name: 'Carol White', color: 'warning' }),
              AvatarGroupOverflow({ count: 5 })
            ),
            AvatarGroup({ spacing: 'normal' },
              Avatar({ name: 'Alice Johnson', color: 'primary' }),
              Avatar({ name: 'Bob Smith', color: 'success' }),
              Avatar({ name: 'Carol White', color: 'warning' })
            )
          ),
        'AvatarGroup arranges multiple avatars with tight (overlapping) or normal spacing. Use AvatarGroupOverflow to indicate hidden members.'
      ),
    ],
  })
}
