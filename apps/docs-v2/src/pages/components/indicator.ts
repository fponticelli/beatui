import { Indicator, Icon, Avatar } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Indicator',
  category: 'Data Display',
  component: 'Indicator',
  description:
    'Overlays a small dot or count badge on any child content. Useful for notification icons, unread counts, and status indicators.',
  icon: 'lucide:bell-dot',
  order: 10,
}

export default function IndicatorPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Indicator', signals =>
      Indicator(
        {
          show: signals.show,
          count: signals.count,
          maxCount: signals.maxCount,
          color: signals.color,
          placement: signals.placement,
          size: signals.size,
        },
        Icon({ icon: 'lucide:bell', size: 'xl' })
      )
    ),
    sections: [
      Section(
        'Dot Indicator',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            Indicator({}, Icon({ icon: 'lucide:bell', size: 'xl' })),
            Indicator(
              { color: 'success' },
              Icon({ icon: 'lucide:mail', size: 'xl' })
            ),
            Indicator(
              { color: 'warning' },
              Icon({ icon: 'lucide:message-circle', size: 'xl' })
            ),
            Indicator(
              { color: 'info' },
              Icon({ icon: 'lucide:user', size: 'xl' })
            )
          ),
        'A simple dot indicator. Use color to theme it.'
      ),
      Section(
        'Count Badge',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            Indicator({ count: 1 }, Icon({ icon: 'lucide:bell', size: 'xl' })),
            Indicator({ count: 5 }, Icon({ icon: 'lucide:mail', size: 'xl' })),
            Indicator(
              { count: 12 },
              Icon({ icon: 'lucide:message-circle', size: 'xl' })
            ),
            Indicator(
              { count: 99 },
              Icon({ icon: 'lucide:shopping-cart', size: 'xl' })
            )
          ),
        'Set count to a positive number to show a numeric badge.'
      ),
      Section(
        'Max Count',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            Indicator(
              { count: 10, maxCount: 9 },
              Icon({ icon: 'lucide:bell', size: 'xl' })
            ),
            Indicator(
              { count: 100, maxCount: 99 },
              Icon({ icon: 'lucide:mail', size: 'xl' })
            ),
            Indicator(
              { count: 1000, maxCount: 999 },
              Icon({ icon: 'lucide:message-circle', size: 'xl' })
            )
          ),
        'When count exceeds maxCount (default: 9), the badge displays "{maxCount}+" instead.'
      ),
      Section(
        'On Avatars',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            Indicator(
              { color: 'success' },
              Avatar({ name: 'Alice', color: 'primary' })
            ),
            Indicator(
              { count: 3 },
              Avatar({ name: 'Bob', color: 'info' })
            ),
            Indicator(
              { count: 12, color: 'warning' },
              Avatar({ name: 'Carol', color: 'success' })
            )
          ),
        'Indicator works with any child content, not just icons.'
      ),
      Section(
        'Placements',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-8 items-center'),
            ...(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map(
              placement =>
                html.div(
                  attr.class('flex flex-col items-center gap-2'),
                  Indicator(
                    { placement, color: 'danger' },
                    Icon({ icon: 'lucide:bell', size: 'xl' })
                  ),
                  html.span(
                    attr.class('text-xs font-mono text-gray-500'),
                    placement
                  )
                )
            )
          ),
        'The placement prop controls which corner the indicator appears in.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            ...(['danger', 'success', 'warning', 'info', 'primary'] as const).map(
              color =>
                html.div(
                  attr.class('flex flex-col items-center gap-1'),
                  Indicator(
                    { count: 4, color },
                    Icon({ icon: 'lucide:bell', size: 'xl' })
                  ),
                  html.span(
                    attr.class('text-xs font-mono text-gray-500'),
                    color
                  )
                )
            )
          ),
        'The indicator color supports all theme color names.'
      ),
      Section(
        'Hidden',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            Indicator(
              { show: false },
              Icon({ icon: 'lucide:bell', size: 'xl' })
            ),
            Indicator(
              { show: true },
              Icon({ icon: 'lucide:bell', size: 'xl' })
            )
          ),
        'Use show to toggle the indicator visibility without removing the child content.'
      ),
    ],
  })
}
