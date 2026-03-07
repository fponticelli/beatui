import { html, attr, prop, ForEach } from '@tempots/dom'
import { Badge, Indicator, Icon } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { Section } from '../views/section'

export default function BadgesTagsPage() {
  const closableBadges = prop(['TypeScript', 'React', 'CSS', 'Design'])
  const removeBadge = (item: string) =>
    closableBadges.set(closableBadges.value.filter(t => t !== item))

  return WidgetPage({
    id: 'badges-tags',
    title: 'Badges & Indicators',
    description: 'Badges for status indicators and labels, indicators for overlaid counts and dots.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      Section(
        'Status Badges',
        Badge({ variant: 'light', color: 'base', size: 'sm' }, 'Not Started'),
        Badge(
          { variant: 'light', color: 'primary', size: 'sm' },
          'In Progress'
        ),
        Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Done'),
        Badge({ variant: 'light', color: 'danger', size: 'sm' }, 'Blocked')
      ),

      Section(
        'Priority Badges',
        Badge({ variant: 'light', color: 'danger', size: 'sm' }, 'Critical'),
        Badge({ variant: 'light', color: 'warning', size: 'sm' }, 'High'),
        Badge({ variant: 'light', color: 'warning', size: 'sm' }, 'Medium'),
        Badge({ variant: 'light', color: 'base', size: 'sm' }, 'Low')
      ),

      Section(
        'Dot Indicators',
        html.span(
          attr.style(
            'display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-base-600)'
          ),
          Indicator({ color: 'success', size: 'sm' }, html.span()),
          'Online'
        ),
        html.span(
          attr.style(
            'display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-base-600)'
          ),
          Indicator({ color: 'warning', size: 'sm' }, html.span()),
          'Away'
        ),
        html.span(
          attr.style(
            'display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-base-600)'
          ),
          Indicator({ color: 'danger', size: 'sm' }, html.span()),
          'Busy'
        ),
        html.span(
          attr.style(
            'display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-base-600)'
          ),
          Indicator({ color: 'base', size: 'sm' }, html.span()),
          'Offline'
        )
      ),

      Section(
        'Count Badges',
        html.span(
          attr.style(
            'display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-base-600)'
          ),
          'Notifications',
          Badge({ color: 'primary', size: 'xs', circle: true }, '5')
        ),
        html.span(
          attr.style(
            'display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-base-600)'
          ),
          'Issues',
          Badge({ color: 'danger', size: 'xs', circle: true }, '12')
        )
      ),

      Section(
        'Percent Change',
        Badge(
          { variant: 'light', color: 'success', size: 'sm', roundedness: 'sm' },
          '+12.5%'
        ),
        Badge(
          { variant: 'light', color: 'danger', size: 'sm', roundedness: 'sm' },
          '-3.2%'
        ),
        Badge(
          { variant: 'light', color: 'base', size: 'sm', roundedness: 'sm' },
          '0.0%'
        )
      ),

      Section(
        'Badge Variants',
        Badge({ variant: 'filled', color: 'primary' }, 'Filled'),
        Badge({ variant: 'light', color: 'primary' }, 'Light'),
        Badge({ variant: 'outline', color: 'primary' }, 'Outline'),
        Badge({ variant: 'default', color: 'primary' }, 'Default'),
        Badge({ variant: 'text', color: 'primary' }, 'Text')
      ),

      Section(
        'Badge Colors',
        Badge({ color: 'base' }, 'Base'),
        Badge({ color: 'primary' }, 'Primary'),
        Badge({ color: 'secondary' }, 'Secondary'),
        Badge({ color: 'success' }, 'Success'),
        Badge({ color: 'warning' }, 'Warning'),
        Badge({ color: 'danger' }, 'Danger'),
        Badge({ color: 'info' }, 'Info')
      ),

      Section(
        'Badge Sizes',
        Badge({ size: 'xs', color: 'primary' }, 'XS'),
        Badge({ size: 'sm', color: 'primary' }, 'SM'),
        Badge({ size: 'md', color: 'primary' }, 'MD'),
        Badge({ size: 'lg', color: 'primary' }, 'LG'),
        Badge({ size: 'xl', color: 'primary' }, 'XL')
      ),

      Section(
        'Circle Badges',
        Badge({ circle: true, size: 'xs', color: 'danger' }, '1'),
        Badge({ circle: true, size: 'sm', color: 'danger' }, '5'),
        Badge({ circle: true, size: 'md', color: 'danger' }, '12'),
        Badge({ circle: true, size: 'lg', color: 'danger' }, '99')
      ),

      Section(
        'Badges with Icons',
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
      ),

      Section(
        'Removable Badges',
        Badge({ variant: 'light' }, 'Base'),
        Badge({ variant: 'light', color: 'primary' }, 'Primary'),
        Badge({ variant: 'light', color: 'secondary' }, 'Secondary'),
        Badge({ variant: 'light', color: 'success' }, 'Success'),
        Badge({ variant: 'light', color: 'warning' }, 'Warning'),
        Badge({ variant: 'light', color: 'danger' }, 'Danger')
      ),

      Section(
        'Removable Badge Sizes',
        Badge({ variant: 'light', size: 'xs', color: 'primary', onClose: () => {} }, 'XS'),
        Badge({ variant: 'light', size: 'sm', color: 'primary', onClose: () => {} }, 'SM'),
        Badge({ variant: 'light', size: 'md', color: 'primary', onClose: () => {} }, 'MD'),
        Badge({ variant: 'light', size: 'lg', color: 'primary', onClose: () => {} }, 'LG'),
        Badge({ variant: 'light', size: 'xl', color: 'primary', onClose: () => {} }, 'XL')
      ),

      Section(
        'Closable Badges',
        ForEach(closableBadges, v =>
          Badge(
            { variant: 'light', color: 'info', onClose: () => removeBadge(v.value) },
            v
          )
        )
      ),

      Section(
        'Icon Indicators',
        Indicator({ color: 'danger' }, Icon({ icon: 'lucide:bell', size: 'xl' })),
        Indicator({ count: 5 }, Icon({ icon: 'lucide:mail', size: 'xl' })),
        Indicator({ count: 99, maxCount: 9 }, Icon({ icon: 'lucide:shopping-cart', size: 'xl' }))
      )
    ),
  })
}
