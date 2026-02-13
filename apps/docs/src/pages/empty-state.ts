import { html, attr } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  EmptyState,
  Button,
} from '@tempots/beatui'

export default function EmptyStatePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic empty state
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'EmptyState – Basic'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Display an empty state when no content is available.'
          ),
          EmptyState({
            title: 'No messages',
            description: 'You have no messages in your inbox.',
          })
        )
      ),

      // With icon
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Icon'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Add an icon to make the empty state more expressive.'
          ),
          html.div(
            attr.class('space-y-6'),
            EmptyState({
              icon: 'material-symbols:inbox-outline',
              title: 'No messages',
              description: 'Your inbox is empty. Messages will appear here.',
            }),
            EmptyState({
              icon: 'material-symbols:search-off',
              title: 'No results found',
              description: 'Try adjusting your search or filter criteria.',
            })
          )
        )
      ),

      // With action button
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Action'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Include a call-to-action button to guide users.'
          ),
          html.div(
            attr.class('space-y-6'),
            EmptyState({
              icon: 'material-symbols:add-circle-outline',
              title: 'No projects yet',
              description: 'Create your first project to get started.',
              action: Button(
                { variant: 'filled', color: 'primary' },
                'Create Project'
              ),
            }),
            EmptyState({
              icon: 'material-symbols:folder-open-outline',
              title: 'No files',
              description: 'Upload files to see them here.',
              action: Button(
                { variant: 'outline', color: 'primary' },
                'Upload Files'
              ),
            })
          )
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Sizes'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Empty states come in three sizes: small, medium, and large.'
          ),
          html.div(
            attr.class('space-y-6'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Small'),
              EmptyState({
                icon: 'material-symbols:info-outline',
                title: 'No notifications',
                description: 'You are all caught up.',
                size: 'sm',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Medium (default)'),
              EmptyState({
                icon: 'material-symbols:inventory-2-outline',
                title: 'No items',
                description: 'Your inventory is empty.',
                size: 'md',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Large'),
              EmptyState({
                icon: 'material-symbols:dashboard-outline',
                title: 'No dashboard',
                description: 'Create a dashboard to visualize your data.',
                size: 'lg',
                action: Button(
                  { variant: 'filled', color: 'primary' },
                  'Get Started'
                ),
              })
            )
          )
        )
      )
    ),
  })
}
