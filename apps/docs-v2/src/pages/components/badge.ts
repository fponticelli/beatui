import { Badge, Icon } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
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
  description: 'Small label for status indicators, counts, or categories.',
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
    ],
  })
}
