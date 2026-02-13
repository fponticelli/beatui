import { html, attr } from '@tempots/dom'
import { Breadcrumbs } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

export default function BreadcrumbsPage() {
  return WidgetPage({
    id: 'breadcrumbs',
    title: 'Breadcrumbs',
    description: 'Navigation trails showing page hierarchy.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Basic',
        Breadcrumbs({
          items: [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Electronics', href: '/products/electronics' },
            { label: 'Laptops', current: true },
          ],
        }),
      ),

      SectionBlock(
        'With Icons',
        Breadcrumbs({
          items: [
            { label: 'Home', icon: 'mdi:home', href: '/' },
            { label: 'Documents', icon: 'mdi:folder', href: '/documents' },
            { label: 'Reports', icon: 'mdi:file-document', current: true },
          ],
        }),
      ),

      SectionBlock(
        'Custom Separators',
        html.div(attr.class('space-y-3'),
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Details', current: true },
            ],
            separator: '>',
          }),
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: 'Article', current: true },
            ],
            separator: '•',
          }),
        ),
      ),

      SectionBlock(
        'Max Items (Collapsed)',
        html.div(attr.class('space-y-2'), html.span(attr.class('text-sm'), 'Full trail'),
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/' },
              { label: 'Level 1', href: '/l1' },
              { label: 'Level 2', href: '/l1/l2' },
              { label: 'Level 3', href: '/l1/l2/l3' },
              { label: 'Level 4', href: '/l1/l2/l3/l4' },
              { label: 'Current', current: true },
            ],
          }),
        ),
        html.div(attr.class('space-y-2'), html.span(attr.class('text-sm'), 'Collapsed (max 3)'),
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/' },
              { label: 'Level 1', href: '/l1' },
              { label: 'Level 2', href: '/l1/l2' },
              { label: 'Level 3', href: '/l1/l2/l3' },
              { label: 'Level 4', href: '/l1/l2/l3/l4' },
              { label: 'Current', current: true },
            ],
            maxItems: 3,
          }),
        ),
      ),

      SectionBlock(
        'Sizes',
        html.div(attr.class('space-y-3'),
          html.div(attr.class('space-y-1'), html.span(attr.class('text-sm'), 'Small'),
            Breadcrumbs({ items: [{ label: 'Home', href: '/' }, { label: 'Page', current: true }], size: 'sm' }),
          ),
          html.div(attr.class('space-y-1'), html.span(attr.class('text-sm'), 'Medium'),
            Breadcrumbs({ items: [{ label: 'Home', href: '/' }, { label: 'Page', current: true }], size: 'md' }),
          ),
          html.div(attr.class('space-y-1'), html.span(attr.class('text-sm'), 'Large'),
            Breadcrumbs({ items: [{ label: 'Home', href: '/' }, { label: 'Page', current: true }], size: 'lg' }),
          ),
        ),
      ),
    ),
  })
}
