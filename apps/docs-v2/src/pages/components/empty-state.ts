import { EmptyState, Button } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'EmptyState',
  category: 'Feedback',
  component: 'EmptyState',
  description:
    'Placeholder displayed when content or data is absent, with optional icon, title, description, and call-to-action.',
  icon: 'lucide:inbox',
  order: 1,
}

export default function EmptyStatePage() {
  return ComponentPage(meta, {
    playground: manualPlayground('EmptyState', signals =>
      EmptyState({
        icon: signals.icon,
        title: signals.title,
        description: signals.description,
        size: signals.size,
      } as never),
      { title: 'Nothing here yet', icon: 'material-symbols:inbox-outline', description: 'Add some content to get started.' }
    ),
    sections: [
      ...AutoSections('EmptyState', props =>
        EmptyState({
          ...props,
          title: 'Nothing here yet',
        } as never)
      ),
      Section(
        'With Icon and Description',
        () =>
          EmptyState({
            icon: 'material-symbols:inbox-outline',
            title: 'No messages',
            description: 'You have no messages in your inbox.',
          }),
        'Combine an icon with a descriptive title and subtitle for clear communication.'
      ),
      Section(
        'With Action',
        () =>
          EmptyState({
            icon: 'material-symbols:add-circle-outline',
            title: 'No projects yet',
            description: 'Create your first project to get started.',
            action: Button(
              { variant: 'filled', color: 'primary' },
              'Create Project'
            ),
          }),
        'An action prop renders a call-to-action below the description, guiding users toward the next step.'
      ),
      Section(
        'Minimal (No Icon)',
        () =>
          EmptyState({
            title: 'Nothing to see here',
            description: 'Try adjusting your filters.',
          }),
        'Omit the icon for a compact, text-only empty state.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-8 divide-y'),
            html.div(
              attr.class('pt-4'),
              html.p(attr.class('text-xs font-semibold uppercase text-gray-400 mb-3'), 'Small'),
              EmptyState({
                icon: 'lucide:search',
                title: 'No results',
                description: 'Try a different search term.',
                size: 'sm',
              })
            ),
            html.div(
              attr.class('pt-4'),
              html.p(attr.class('text-xs font-semibold uppercase text-gray-400 mb-3'), 'Medium (default)'),
              EmptyState({
                icon: 'lucide:search',
                title: 'No results',
                description: 'Try a different search term.',
                size: 'md',
              })
            ),
            html.div(
              attr.class('pt-4'),
              html.p(attr.class('text-xs font-semibold uppercase text-gray-400 mb-3'), 'Large'),
              EmptyState({
                icon: 'lucide:search',
                title: 'No results',
                description: 'Try a different search term.',
                size: 'lg',
              })
            )
          ),
        'Three size variants control icon size and overall spacing: sm, md (default), and lg.'
      ),
      Section(
        'Common Scenarios',
        () =>
          html.div(
            attr.class('grid grid-cols-1 md:grid-cols-3 gap-6'),
            html.div(
              attr.class('border rounded-lg p-4'),
              EmptyState({
                icon: 'lucide:folder-open',
                title: 'No files',
                description: 'Upload a file to get started.',
                size: 'sm',
              })
            ),
            html.div(
              attr.class('border rounded-lg p-4'),
              EmptyState({
                icon: 'lucide:users',
                title: 'No team members',
                description: 'Invite colleagues to collaborate.',
                size: 'sm',
              })
            ),
            html.div(
              attr.class('border rounded-lg p-4'),
              EmptyState({
                icon: 'lucide:bell-off',
                title: 'No notifications',
                description: 'You are all caught up.',
                size: 'sm',
              })
            )
          ),
        'Empty states can be scoped inside cards or panels to provide context-specific guidance.'
      ),
    ],
  })
}
