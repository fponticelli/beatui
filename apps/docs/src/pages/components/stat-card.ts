import {
  StatCard,
  StatCardValue,
  StatCardLabel,
  StatCardTrend,
  StatCardIcon,
  StatCardSparkline,
  Icon,
} from '@tempots/beatui'
import { html, attr, prop, on, Value } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'StatCard',
  category: 'Data Display',
  component: 'StatCard',
  description:
    'A dashboard metric display with composable value, label, trend indicator, icon, and sparkline sections.',
  icon: 'lucide:bar-chart-3',
  order: 15,
}

export default function StatCardPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'StatCard',
      props =>
        StatCard(
          props as Record<string, Value<unknown>>,
          StatCardIcon(
            {},
            Icon({ icon: 'lucide:users', size: 'lg', color: 'primary' })
          ),
          StatCardValue({}, '1,234'),
          StatCardLabel({}, 'Active Users'),
          StatCardTrend({ value: '+12.5%', direction: 'up' })
        ),
      {
        childrenCode:
          "StatCardIcon({}, Icon({ icon: 'lucide:users', size: 'lg', color: 'primary' })),\n  StatCardValue({}, '1,234'),\n  StatCardLabel({}, 'Active Users'),\n  StatCardTrend({ value: '+12.5%', direction: 'up' })",
      }
    ),
    sections: [
      ...AutoSections('StatCard', props =>
        StatCard(
          props,
          StatCardValue({}, '1,234'),
          StatCardLabel({}, 'Active Users')
        )
      ),
      Section(
        'Basic',
        () =>
          html.div(
            attr.class('max-w-xs'),
            StatCard(
              {},
              StatCardValue({}, '1,234'),
              StatCardLabel({}, 'Active Users')
            )
          ),
        'A simple stat card with value and label.'
      ),
      Section(
        'With Trend',
        () =>
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-3 gap-4'),
            StatCard(
              {},
              StatCardValue({}, '8,420'),
              StatCardLabel({}, 'Page Views'),
              StatCardTrend({ value: '+23%', direction: 'up' })
            ),
            StatCard(
              {},
              StatCardValue({}, '$4,310'),
              StatCardLabel({}, 'Revenue'),
              StatCardTrend({ value: '-5.2%', direction: 'down' })
            ),
            StatCard(
              {},
              StatCardValue({}, '99.9%'),
              StatCardLabel({}, 'Uptime'),
              StatCardTrend({ value: '0%', direction: 'flat' })
            )
          ),
        'Trend auto-colors: green for up, red for down, neutral for flat.'
      ),
      Section(
        'With Icon',
        () =>
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg'),
            StatCard(
              { color: 'primary' },
              StatCardIcon(
                {},
                Icon({ icon: 'lucide:users', size: 'lg', color: 'primary' })
              ),
              StatCardValue({}, '1,234'),
              StatCardLabel({}, 'Active Users'),
              StatCardTrend({ value: '+12%', direction: 'up' })
            ),
            StatCard(
              { color: 'success' },
              StatCardIcon(
                {},
                Icon({
                  icon: 'lucide:dollar-sign',
                  size: 'lg',
                  color: 'success',
                })
              ),
              StatCardValue({}, '$52,400'),
              StatCardLabel({}, 'Monthly Revenue'),
              StatCardTrend({ value: '+8.3%', direction: 'up' })
            )
          ),
        'Add an icon for visual context.'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-3 gap-4'),
            ...(['default', 'elevated', 'outlined'] as const).map(variant =>
              StatCard(
                { variant },
                StatCardValue({}, '42'),
                StatCardLabel({}, variant)
              )
            )
          ),
        'Three visual variants: default, elevated, and outlined.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-3 gap-4'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              StatCard(
                { size },
                StatCardValue({}, '100'),
                StatCardLabel({}, `size: ${size}`)
              )
            )
          ),
        'Size controls internal padding.'
      ),
      Section(
        'With Sparkline Slot',
        () =>
          html.div(
            attr.class('max-w-xs'),
            StatCard(
              { variant: 'elevated' },
              StatCardValue({}, '3,842'),
              StatCardLabel({}, 'Orders This Week'),
              StatCardTrend({ value: '+15%', direction: 'up' }),
              StatCardSparkline(
                {},
                html.div(
                  attr.class(
                    'h-8 bg-gradient-to-r from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 rounded'
                  )
                )
              )
            )
          ),
        'The sparkline slot accepts any content — charts, bars, or custom visualizations.'
      ),
      Section(
        'Interactive Trend',
        () => {
          const direction = prop<'up' | 'down' | 'flat'>('up')
          return html.div(
            attr.class('flex flex-col gap-4 max-w-xs'),
            StatCard(
              {},
              StatCardValue({}, '1,234'),
              StatCardLabel({}, 'Dynamic Trend'),
              StatCardTrend({ value: '+12%', direction })
            ),
            html.div(
              attr.class('flex gap-2'),
              ...(['up', 'down', 'flat'] as const).map(d =>
                html.button(
                  attr.class(
                    'px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  ),
                  on.click(() => direction.set(d)),
                  d
                )
              )
            )
          )
        },
        'Trend direction and value are reactive.'
      ),
    ],
  })
}
