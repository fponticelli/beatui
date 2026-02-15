import { html, prop, attr } from '@tempots/dom'
import { ActionCard, Card, ScrollablePanel, Stack } from '@tempots/beatui'

export default function ActionCardPage() {
  return ScrollablePanel({
    header: html.div(
      attr.class('space-y-2 p-2'),
      html.h1(attr.class('text-2xl font-bold'), 'Action Card'),
      html.p(
        attr.class('text-lg text-gray-600 dark:text-gray-400'),
        'Interactive cards for displaying actions, features, or navigation options with icons and descriptions.'
      )
    ),
    body: Stack(
      attr.class('gap-2 p-2'),
      // Basic Example
      Card(
        {},
        html.h2(attr.class('font-bold'), 'Basic Action Cards'),
        html.p('Action cards with icons, titles, and descriptions.'),
        Stack(
          attr.class('space-y-2 py-2'),
          ActionCard({
            icon: 'mdi:account-search',
            title: 'User lookup',
            description: 'Find customer accounts and adjust permissions.',
          }),
          ActionCard({
            icon: 'mdi:database',
            title: 'DynamoDB explorer',
            description: 'Inspect tables and queued mutations.',
          }),
          ActionCard({
            icon: 'mdi:chart-line',
            title: 'Analytics dashboard',
            description: 'View metrics and performance data.',
          })
        )
      ),

      // Active State
      Card(
        {},
        html.h2(attr.class('font-bold'), 'Active State'),
        html.p('Action cards can show an active/selected state.'),
        Stack(
          attr.class('space-y-2 py-2'),
          ActionCard({
            icon: 'mdi:account-search',
            title: 'User lookup',
            description: 'Find customer accounts and adjust permissions.',
            active: true,
          }),
          ActionCard({
            icon: 'mdi:database',
            title: 'DynamoDB explorer',
            description: 'Inspect tables and queued mutations.',
            active: false,
          })
        )
      ),

      // Interactive Example
      (() => {
        const selectedCard = prop<string | null>('user-lookup')

        return Card(
          {},
          html.h2(attr.class('font-bold'), 'Interactive Example'),
          html.p('Click on cards to select them.'),
          Stack(
            attr.class('space-y-2 py-2'),
            ActionCard({
              icon: 'mdi:account-search',
              title: 'User lookup',
              description: 'Find customer accounts and adjust permissions.',
              active: selectedCard.map(v => v === 'user-lookup'),
              onClick: () => selectedCard.set('user-lookup'),
            }),
            ActionCard({
              icon: 'mdi:database',
              title: 'DynamoDB explorer',
              description: 'Inspect tables and queued mutations.',
              active: selectedCard.map(v => v === 'dynamodb'),
              onClick: () => selectedCard.set('dynamodb'),
            }),
            ActionCard({
              icon: 'mdi:chart-line',
              title: 'Analytics dashboard',
              description: 'View metrics and performance data.',
              active: selectedCard.map(v => v === 'analytics'),
              onClick: () => selectedCard.set('analytics'),
            })
          ),
          html.p(
            html.strong('Selected: '),
            selectedCard.map(v => v ?? 'none')
          )
        )
      })(),

      // Disabled State
      Card(
        {},
        html.h2(attr.class('font-bold'), 'Disabled State'),
        html.p('Action cards can be disabled.'),
        Stack(
          attr.class('space-y-2 py-2'),
          ActionCard({
            icon: 'mdi:account-search',
            title: 'User lookup',
            description: 'Find customer accounts and adjust permissions.',
            disabled: true,
          }),
          ActionCard({
            icon: 'mdi:database',
            title: 'DynamoDB explorer',
            description: 'Inspect tables and queued mutations.',
            disabled: true,
            onClick: () => alert('This should not fire'),
          })
        )
      ),

      // Size Variants
      Card(
        {},
        html.h2(attr.class('font-bold'), 'Size Variants'),
        html.p('Action cards support different sizes.'),
        Stack(
          attr.class('space-y-2 py-2'),
          html.h3('Extra Small'),
          ActionCard({
            icon: 'mdi:account-search',
            title: 'User lookup',
            description: 'Find customer accounts and adjust permissions.',
            size: 'xs',
            iconSize: 'sm',
          }),
          html.h3('Small'),
          ActionCard({
            icon: 'mdi:database',
            title: 'DynamoDB explorer',
            description: 'Inspect tables and queued mutations.',
            size: 'sm',
            iconSize: 'md',
          }),
          html.h3('Medium (Default)'),
          ActionCard({
            icon: 'mdi:chart-line',
            title: 'Analytics dashboard',
            description: 'View metrics and performance data.',
            size: 'md',
            iconSize: 'lg',
          }),
          html.h3('Large'),
          ActionCard({
            icon: 'mdi:cog',
            title: 'Settings',
            description: 'Configure application preferences.',
            size: 'lg',
            iconSize: 'xl',
          }),
          html.h3('Extra Large'),
          ActionCard({
            icon: 'mdi:help-circle',
            title: 'Help & Support',
            description: 'Get assistance and documentation.',
            size: 'xl',
            iconSize: 'xl',
          })
        )
      ),

      // Custom Icon Colors
      Card(
        {},
        html.h2(attr.class('font-bold'), 'Custom Icon Colors'),
        html.p('Customize icon colors to match your design.'),
        Stack(
          attr.class('space-y-2 py-2'),
          ActionCard({
            icon: 'mdi:check-circle',
            title: 'Success Action',
            description: 'This action completed successfully.',
            iconColor: 'success',
          }),
          ActionCard({
            icon: 'mdi:alert-circle',
            title: 'Warning Action',
            description: 'This action requires attention.',
            iconColor: 'warning',
          }),
          ActionCard({
            icon: 'mdi:close-circle',
            title: 'Error Action',
            description: 'This action encountered an error.',
            iconColor: 'danger',
          }),
          ActionCard({
            icon: 'mdi:information',
            title: 'Info Action',
            description: 'This action provides information.',
            iconColor: 'info',
          })
        )
      ),

      // Grid Layout Example
      Card(
        {},
        html.h2(attr.class('font-bold'), 'Grid Layout'),
        html.p('Action cards work well in grid layouts.'),
        html.div(
          attr.style(
            'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;'
          ),
          ActionCard({
            icon: 'mdi:account-multiple',
            title: 'Team Management',
            description: 'Manage team members and permissions.',
            onClick: () => console.log('Team clicked'),
          }),
          ActionCard({
            icon: 'mdi:file-document',
            title: 'Documentation',
            description: 'Browse API docs and guides.',
            onClick: () => console.log('Docs clicked'),
          }),
          ActionCard({
            icon: 'mdi:shield-check',
            title: 'Security',
            description: 'Configure security settings.',
            onClick: () => console.log('Security clicked'),
          }),
          ActionCard({
            icon: 'mdi:bell',
            title: 'Notifications',
            description: 'Manage notification preferences.',
            onClick: () => console.log('Notifications clicked'),
          }),
          ActionCard({
            icon: 'mdi:credit-card',
            title: 'Billing',
            description: 'View invoices and payment methods.',
            onClick: () => console.log('Billing clicked'),
          }),
          ActionCard({
            icon: 'mdi:api',
            title: 'API Keys',
            description: 'Generate and manage API keys.',
            onClick: () => console.log('API clicked'),
          })
        )
      )
    ),
  })
}
