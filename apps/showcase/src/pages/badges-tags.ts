import { html, attr, prop, ForEach } from '@tempots/dom'
import { Badge, Tag, Icon } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { Section } from '../views/section'

export default function BadgesTagsPage() {
  const closableTags = prop(['TypeScript', 'React', 'CSS', 'Design'])
  const removeTag = (v: string) =>
    closableTags.set(closableTags.value.filter(t => t !== v))

  return WidgetPage({
    id: 'badges-tags',
    title: 'Badges & Tags',
    description: 'Badges for status indicators and tags for categorization.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

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
        'Tags – Colors',
        Tag({ value: 'Base' }),
        Tag({ value: 'Primary', color: 'primary' }),
        Tag({ value: 'Secondary', color: 'secondary' }),
        Tag({ value: 'Success', color: 'success' }),
        Tag({ value: 'Warning', color: 'warning' }),
        Tag({ value: 'Danger', color: 'danger' })
      ),

      Section(
        'Tag Sizes',
        Tag({ value: 'XS', size: 'xs', color: 'primary' }),
        Tag({ value: 'SM', size: 'sm', color: 'primary' }),
        Tag({ value: 'MD', size: 'md', color: 'primary' }),
        Tag({ value: 'LG', size: 'lg', color: 'primary' }),
        Tag({ value: 'XL', size: 'xl', color: 'primary' })
      ),

      Section(
        'Closable Tags',
        ForEach(closableTags, v =>
          Tag({ value: v, color: 'info', onClose: removeTag })
        )
      )
    ),
  })
}
