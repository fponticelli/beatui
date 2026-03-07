import { Badge, Icon } from '@tempots/beatui'
import { html, attr, prop, MapSignal, Value } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Badge',
  category: 'Data Display',
  component: 'Badge',
  description: 'Small label for status indicators, counts, or categories. Supports removable badges with a close button.',
  icon: 'lucide:tag',
  order: 2,
}

export default function BadgePage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Badge', props =>
      Badge(props as Record<string, Value<unknown>>, 'Badge')
    ),
    sections: [
      ...AutoSections('Badge', props => Badge(props, 'Badge')),
      Section(
        'Circle Badges',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Badge({ circle: true, size: 'xs', color: 'danger' }, '1'),
            Badge({ circle: true, size: 'sm', color: 'danger' }, '5'),
            Badge({ circle: true, size: 'md', color: 'danger' }, '12'),
            Badge({ circle: true, size: 'lg', color: 'danger' }, '99')
          ),
        'Circle badges are ideal for notification counts.'
      ),
      Section(
        'With Icons',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
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
            )
          ),
        'Badges can contain icons with automatic spacing.'
      ),
      Section(
        'Removable Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            Badge({ variant: 'light', size: 'xs', color: 'primary', onClose: () => {} }, 'XS'),
            Badge({ variant: 'light', size: 'sm', color: 'primary', onClose: () => {} }, 'SM'),
            Badge({ variant: 'light', size: 'md', color: 'primary', onClose: () => {} }, 'MD'),
            Badge({ variant: 'light', size: 'lg', color: 'primary', onClose: () => {} }, 'LG'),
            Badge({ variant: 'light', size: 'xl', color: 'primary', onClose: () => {} }, 'XL')
          ),
        'The close button scales proportionally with the badge size.'
      ),
      Section(
        'Removable Badges',
        () => {
          const tags = prop(['React', 'Vue', 'Solid', 'Svelte', 'Angular'])
          return html.div(
            attr.class('flex flex-wrap gap-2 items-center min-h-[32px]'),
            MapSignal(tags, items =>
              html.div(
                attr.class('flex flex-wrap gap-2 items-center'),
                ...items.map(item =>
                  Badge(
                    {
                      variant: 'light',
                      color: 'primary',
                      onClose: () => tags.set(tags.value.filter(t => t !== item)),
                    },
                    item
                  )
                )
              )
            )
          )
        },
        'When onClose is provided, a close button appears. Click the X to remove a badge.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            Badge({ variant: 'light', disabled: true }, 'Disabled'),
            Badge({ variant: 'light', color: 'primary', disabled: true }, 'Disabled Primary'),
            Badge(
              {
                variant: 'light',
                color: 'danger',
                disabled: true,
                onClose: () => {},
              },
              'Disabled with Close'
            )
          ),
        'Disabled badges and their close buttons cannot be interacted with.'
      ),
    ],
  })
}
