import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Breadcrumbs } from '@tempots/beatui'

export default function BreadcrumbsPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic breadcrumbs
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Breadcrumbs – Basic'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Display a navigation trail showing the current page hierarchy.'
          ),
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Electronics', href: '/products/electronics' },
              { label: 'Laptops', current: true },
            ],
          })
        )
      ),

      // With icons
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Icons'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Add icons to breadcrumb items for better visual recognition.'
          ),
          html.div(
            attr.class('space-y-3'),
            Breadcrumbs({
              items: [
                { label: 'Home', icon: 'mdi:home', href: '/' },
                { label: 'Documents', icon: 'mdi:folder', href: '/documents' },
                {
                  label: 'Reports',
                  icon: 'mdi:file-document',
                  href: '/documents/reports',
                },
                {
                  label: 'Annual Report 2024',
                  icon: 'mdi:file-pdf',
                  current: true,
                },
              ],
            })
          )
        )
      ),

      // Click handlers and separators
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'Click Handlers & Separators'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Use onClick callbacks and customize the separator character.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'With click handlers'),
              Breadcrumbs({
                items: [
                  {
                    label: 'Dashboard',
                    onClick: () => console.log('Dashboard clicked'),
                  },
                  {
                    label: 'Settings',
                    onClick: () => console.log('Settings clicked'),
                  },
                  { label: 'Profile', current: true },
                ],
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Custom separator (>)'),
              Breadcrumbs({
                items: [
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Details', current: true },
                ],
                separator: '>',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Custom separator (•)'),
              Breadcrumbs({
                items: [
                  { label: 'Home', href: '/' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Article', current: true },
                ],
                separator: '•',
              })
            )
          )
        )
      ),

      // Max items (collapsed)
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Max Items'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Collapse long breadcrumb trails with ellipsis to save space.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Full trail (8 items)'),
              Breadcrumbs({
                items: [
                  { label: 'Home', href: '/' },
                  { label: 'Level 1', href: '/l1' },
                  { label: 'Level 2', href: '/l1/l2' },
                  { label: 'Level 3', href: '/l1/l2/l3' },
                  { label: 'Level 4', href: '/l1/l2/l3/l4' },
                  { label: 'Level 5', href: '/l1/l2/l3/l4/l5' },
                  { label: 'Level 6', href: '/l1/l2/l3/l4/l5/l6' },
                  { label: 'Current', current: true },
                ],
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'Collapsed (max 4 items)'
              ),
              Breadcrumbs({
                items: [
                  { label: 'Home', href: '/' },
                  { label: 'Level 1', href: '/l1' },
                  { label: 'Level 2', href: '/l1/l2' },
                  { label: 'Level 3', href: '/l1/l2/l3' },
                  { label: 'Level 4', href: '/l1/l2/l3/l4' },
                  { label: 'Level 5', href: '/l1/l2/l3/l4/l5' },
                  { label: 'Level 6', href: '/l1/l2/l3/l4/l5/l6' },
                  { label: 'Current', current: true },
                ],
                maxItems: 4,
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'Collapsed (max 3 items)'
              ),
              Breadcrumbs({
                items: [
                  { label: 'Home', href: '/' },
                  { label: 'Level 1', href: '/l1' },
                  { label: 'Level 2', href: '/l1/l2' },
                  { label: 'Level 3', href: '/l1/l2/l3' },
                  { label: 'Level 4', href: '/l1/l2/l3/l4' },
                  { label: 'Level 5', href: '/l1/l2/l3/l4/l5' },
                  { label: 'Current', current: true },
                ],
                maxItems: 3,
              })
            )
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
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Breadcrumbs in different sizes.'
          ),
          html.div(
            attr.class('space-y-3'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Small'),
              Breadcrumbs({
                items: [
                  { label: 'Home', icon: 'mdi:home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Details', current: true },
                ],
                size: 'sm',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Medium (default)'),
              Breadcrumbs({
                items: [
                  { label: 'Home', icon: 'mdi:home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Details', current: true },
                ],
                size: 'md',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Large'),
              Breadcrumbs({
                items: [
                  { label: 'Home', icon: 'mdi:home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Details', current: true },
                ],
                size: 'lg',
              })
            )
          )
        )
      )
    ),
  })
}
