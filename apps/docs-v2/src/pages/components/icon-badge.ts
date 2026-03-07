import { IconBadge } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'IconBadge',
  category: 'Data Display',
  component: 'IconBadge',
  description:
    'An icon with an overlaid badge indicator — either a dot or a count. Useful for notification icons, cart counters, and status indicators.',
  icon: 'lucide:bell-dot',
  order: 10,
}

export default function IconBadgePage() {
  return ComponentPage(meta, {
    playground: autoPlayground('IconBadge', props =>
      IconBadge(props as never),
      { icon: 'lucide:bell' }
    ),
    sections: [
      ...AutoSections('IconBadge', props =>
        IconBadge({ icon: 'lucide:bell', size: 'xl', ...props } as never)
      ),
      Section(
        'Dot Indicator',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            IconBadge({ icon: 'lucide:bell', size: 'xl', indicator: true }),
            IconBadge({
              icon: 'lucide:mail',
              size: 'xl',
              indicator: true,
              indicatorColor: 'success',
            }),
            IconBadge({
              icon: 'lucide:message-circle',
              size: 'xl',
              indicator: true,
              indicatorColor: 'warning',
            }),
            IconBadge({
              icon: 'lucide:user',
              size: 'xl',
              indicator: true,
              indicatorColor: 'info',
            })
          ),
        'Set indicator to true to show a simple dot badge. Use indicatorColor to theme it.'
      ),
      Section(
        'Count Badge',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            IconBadge({ icon: 'lucide:bell', size: 'xl', count: 1 }),
            IconBadge({ icon: 'lucide:mail', size: 'xl', count: 5 }),
            IconBadge({ icon: 'lucide:message-circle', size: 'xl', count: 12 }),
            IconBadge({ icon: 'lucide:shopping-cart', size: 'xl', count: 99 })
          ),
        'Set count to a positive number to show a numeric badge.'
      ),
      Section(
        'Max Count',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            IconBadge({
              icon: 'lucide:bell',
              size: 'xl',
              count: 10,
              maxCount: 9,
            }),
            IconBadge({
              icon: 'lucide:mail',
              size: 'xl',
              count: 100,
              maxCount: 99,
            }),
            IconBadge({
              icon: 'lucide:message-circle',
              size: 'xl',
              count: 1000,
              maxCount: 999,
            })
          ),
        'When count exceeds maxCount (default: 9), the badge displays "{maxCount}+" instead.'
      ),
      Section(
        'Icon Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            ...(['sm', 'md', 'lg', 'xl', '2xl'] as const).map(size =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                IconBadge({ icon: 'lucide:bell', size, count: 3 }),
                html.span(attr.class('text-xs font-mono text-gray-500'), size)
              )
            )
          ),
        'IconBadge inherits all standard icon sizes. The badge scales proportionally.'
      ),
      Section(
        'Indicator Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6 items-center'),
            ...(['danger', 'success', 'warning', 'info', 'primary'] as const).map(
              color =>
                html.div(
                  attr.class('flex flex-col items-center gap-1'),
                  IconBadge({
                    icon: 'lucide:bell',
                    size: 'xl',
                    count: 4,
                    indicatorColor: color,
                  }),
                  html.span(
                    attr.class('text-xs font-mono text-gray-500'),
                    color
                  )
                )
            )
          ),
        'The badge color is controlled by indicatorColor and supports all theme color names.'
      ),
      Section(
        'Common Use Cases',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-8 items-center'),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              IconBadge({ icon: 'lucide:bell', size: 'xl', count: 7 }),
              html.span(attr.class('text-xs text-gray-500'), 'Notifications')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              IconBadge({
                icon: 'lucide:shopping-cart',
                size: 'xl',
                count: 3,
                indicatorColor: 'success',
              }),
              html.span(attr.class('text-xs text-gray-500'), 'Cart')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              IconBadge({
                icon: 'lucide:mail',
                size: 'xl',
                indicator: true,
                indicatorColor: 'danger',
              }),
              html.span(attr.class('text-xs text-gray-500'), 'Unread mail')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              IconBadge({
                icon: 'lucide:message-square',
                size: 'xl',
                count: 24,
                maxCount: 9,
                indicatorColor: 'info',
              }),
              html.span(attr.class('text-xs text-gray-500'), 'Messages')
            )
          ),
        'Common navigation and toolbar uses for IconBadge.'
      ),
    ],
  })
}
