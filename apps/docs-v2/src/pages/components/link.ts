import { Link } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Link',
  category: 'Navigation',
  component: 'Link',
  description:
    'A themed navigation link with support for variants, colors, disabled state, and client-side routing.',
  icon: 'lucide:link',
  order: 4,
}

export default function LinkPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Link', props =>
      Link(
        { href: '#', ...props } as never,
        'Click this link'
      )
    ),
    sections: [
      ...AutoSections('Link', props =>
        Link({ href: '#', ...props } as never, 'Example Link')
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            Link({ href: '#', variant: 'default' }, 'Default link'),
            Link({ href: '#', variant: 'hover' }, 'Hover underline'),
            Link({ href: '#', variant: 'plain' }, 'Plain (no underline)')
          ),
        'Three visual variants control underline display.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            Link({ href: '#', color: 'primary' }, 'Primary'),
            Link({ href: '#', color: 'secondary' }, 'Secondary'),
            Link({ href: '#', color: 'success' }, 'Success'),
            Link({ href: '#', color: 'danger' }, 'Danger'),
            Link({ href: '#', color: 'warning' }, 'Warning'),
            Link({ href: '#', color: 'info' }, 'Info')
          ),
        'Links inherit theme colors from the design system.'
      ),
      Section(
        'Disabled State',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            Link({ href: '#', disabled: false }, 'Enabled link'),
            Link({ href: '#', disabled: true }, 'Disabled link')
          ),
        'Disabled links render as non-interactive spans with muted styling.'
      ),
      Section(
        'External Link',
        () =>
          Link(
            {
              href: 'https://example.com',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            'Open in new tab'
          ),
        'Use target and rel for external links opening in a new tab.'
      ),
    ],
  })
}
