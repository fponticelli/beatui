import { html, attr } from '@tempots/dom'
import { EmptyState, Button } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

export default function EmptyStatesPage() {
  return WidgetPage({
    id: 'empty-states',
    title: 'Empty States',
    description: 'Placeholder displays when no content is available.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Basic',
        EmptyState({
          title: 'No messages',
          description: 'You have no messages in your inbox.',
        }),
      ),

      SectionBlock(
        'With Icons',
        html.div(
          attr.class('space-y-4'),
          EmptyState({
            icon: 'material-symbols:inbox-outline',
            title: 'No messages',
            description: 'Your inbox is empty. Messages will appear here.',
          }),
          EmptyState({
            icon: 'material-symbols:search-off',
            title: 'No results found',
            description: 'Try adjusting your search or filter criteria.',
          }),
        ),
      ),

      SectionBlock(
        'With Actions',
        html.div(
          attr.class('space-y-4'),
          EmptyState({
            icon: 'material-symbols:add-circle-outline',
            title: 'No projects yet',
            description: 'Create your first project to get started.',
            action: Button({ variant: 'filled', color: 'primary' }, 'Create Project'),
          }),
          EmptyState({
            icon: 'material-symbols:folder-open-outline',
            title: 'No files',
            description: 'Upload files to see them here.',
            action: Button({ variant: 'outline', color: 'primary' }, 'Upload Files'),
          }),
        ),
      ),

      SectionBlock(
        'Sizes',
        html.div(
          attr.class('space-y-4'),
          html.div(attr.class('space-y-2'), html.span(attr.class('text-sm font-medium'), 'Small'),
            EmptyState({ icon: 'material-symbols:info-outline', title: 'No notifications', description: 'All caught up.', size: 'sm' }),
          ),
          html.div(attr.class('space-y-2'), html.span(attr.class('text-sm font-medium'), 'Medium'),
            EmptyState({ icon: 'material-symbols:inventory-2-outline', title: 'No items', description: 'Your inventory is empty.', size: 'md' }),
          ),
          html.div(attr.class('space-y-2'), html.span(attr.class('text-sm font-medium'), 'Large'),
            EmptyState({ icon: 'material-symbols:dashboard-outline', title: 'No dashboard', description: 'Create a dashboard to visualize your data.', size: 'lg', action: Button({ variant: 'filled', color: 'primary' }, 'Get Started') }),
          ),
        ),
      ),
    ),
  })
}
