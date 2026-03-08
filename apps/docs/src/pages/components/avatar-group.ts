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
  name: 'AvatarGroup',
  category: 'Data Display',
  component: 'AvatarGroup',
  description:
    'Arranges multiple avatars in a row with overlapping or spaced layout and an overflow indicator.',
  icon: 'lucide:users',
  order: 7,
}

export default function AvatarGroupPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('AvatarGroup', props =>
      AvatarGroup(
        props,
        Avatar({ name: 'Alice Johnson', color: 'primary' }),
        Avatar({ name: 'Bob Smith', color: 'success' }),
        Avatar({ name: 'Carol White', color: 'warning' }),
        Avatar({ name: 'David Lee', color: 'info' }),
        AvatarGroupOverflow({ count: 3 })
      )
    ),
    sections: [
      ...AutoSections('AvatarGroup', props =>
        AvatarGroup(
          props,
          Avatar({ name: 'Alice Johnson', color: 'primary' }),
          Avatar({ name: 'Bob Smith', color: 'success' }),
          Avatar({ name: 'Carol White', color: 'warning' }),
          AvatarGroupOverflow({ count: 2 })
        )
      ),
      Section(
        'Tight Spacing (Overlapping)',
        () =>
          AvatarGroup(
            { spacing: 'tight' },
            Avatar({ name: 'Alice Johnson', color: 'primary' }),
            Avatar({ name: 'Bob Smith', color: 'success' }),
            Avatar({ name: 'Carol White', color: 'warning' }),
            Avatar({ name: 'David Lee', color: 'danger' }),
            AvatarGroupOverflow({ count: 8, color: 'base' })
          ),
        'With tight spacing, avatars overlap to create a compact stacked appearance.'
      ),
      Section(
        'Normal Spacing',
        () =>
          AvatarGroup(
            { spacing: 'normal' },
            Avatar({ name: 'Alice Johnson', color: 'primary' }),
            Avatar({ name: 'Bob Smith', color: 'success' }),
            Avatar({ name: 'Carol White', color: 'warning' }),
            Avatar({ name: 'David Lee', color: 'info' })
          ),
        'Normal spacing places avatars side by side with a standard gap.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                attr.class('flex items-center gap-4'),
                html.span(
                  attr.class('text-xs font-mono text-gray-500 w-6'),
                  size
                ),
                AvatarGroup(
                  { size, spacing: 'tight' },
                  Avatar({ name: 'Alice Johnson', color: 'primary', size }),
                  Avatar({ name: 'Bob Smith', color: 'success', size }),
                  Avatar({ name: 'Carol White', color: 'warning', size }),
                  AvatarGroupOverflow({ count: 5, size })
                )
              )
            )
          ),
        'AvatarGroup sizes range from xs to xl. Pass a matching size to both the group and its children.'
      ),
      Section(
        'Overflow Indicator Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            AvatarGroup(
              { spacing: 'tight' },
              Avatar({ name: 'Alice', color: 'primary' }),
              Avatar({ name: 'Bob', color: 'success' }),
              AvatarGroupOverflow({ count: 7, color: 'primary' })
            ),
            AvatarGroup(
              { spacing: 'tight' },
              Avatar({ name: 'Carol', color: 'danger' }),
              Avatar({ name: 'David', color: 'warning' }),
              AvatarGroupOverflow({ count: 4, color: 'danger' })
            ),
            AvatarGroup(
              { spacing: 'tight' },
              Avatar({ name: 'Eve', color: 'info' }),
              Avatar({ name: 'Frank', color: 'secondary' }),
              AvatarGroupOverflow({ count: 12, color: 'info' })
            )
          ),
        'The overflow indicator supports all theme colors to match the group context.'
      ),
      Section(
        'With Icon Avatars',
        () =>
          AvatarGroup(
            { spacing: 'tight' },
            Avatar({ icon: 'mdi:account', color: 'primary' }),
            Avatar({ icon: 'mdi:robot', color: 'secondary' }),
            Avatar({ icon: 'mdi:shield-account', color: 'success' }),
            AvatarGroupOverflow({ count: 3, color: 'base' })
          ),
        'Icon-based avatars work seamlessly within an AvatarGroup.'
      ),
    ],
  })
}
