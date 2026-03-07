import { ButtonLink, Button, Icon } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ButtonLink',
  category: 'Buttons',
  component: 'ButtonLink',
  description:
    'A navigation link styled as a button, combining the visual appearance of a button with anchor semantics.',
  icon: 'lucide:external-link',
  order: 5,
}

export default function ButtonLinkPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('ButtonLink', props =>
      ButtonLink(
        props as never,
        'Go somewhere'
      ),
      { href: '#' }
    ),
    sections: [
      ...AutoSections('ButtonLink', props =>
        ButtonLink({ href: '#', ...props } as never, 'Example')
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary' }, 'Filled'),
            ButtonLink({ href: '#', variant: 'light', color: 'primary' }, 'Light'),
            ButtonLink({ href: '#', variant: 'outline', color: 'primary' }, 'Outline'),
            ButtonLink({ href: '#', variant: 'default' }, 'Default'),
            ButtonLink({ href: '#', variant: 'text', color: 'primary' }, 'Text'),
            ButtonLink({ href: '#', variant: 'dashed' }, 'Dashed')
          ),
        'ButtonLink supports the same visual variants as the Button component.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary' }, 'Primary'),
            ButtonLink({ href: '#', variant: 'filled', color: 'secondary' }, 'Secondary'),
            ButtonLink({ href: '#', variant: 'filled', color: 'success' }, 'Success'),
            ButtonLink({ href: '#', variant: 'filled', color: 'danger' }, 'Danger'),
            ButtonLink({ href: '#', variant: 'filled', color: 'warning' }, 'Warning'),
            ButtonLink({ href: '#', variant: 'filled', color: 'info' }, 'Info')
          ),
        'All theme colors are available, identical to the Button color palette.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-3'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', size: 'xs' }, 'XSmall'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', size: 'sm' }, 'Small'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', size: 'md' }, 'Medium'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', size: 'lg' }, 'Large'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', size: 'xl' }, 'XLarge')
          ),
        'Five sizes match the Button size scale.'
      ),
      Section(
        'With Icon',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ButtonLink(
              { href: '#', variant: 'filled', color: 'primary' },
              Icon({ icon: 'lucide:arrow-right', size: 'sm' }),
              'Continue'
            ),
            ButtonLink(
              { href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer', variant: 'outline' },
              'Open in new tab',
              Icon({ icon: 'lucide:external-link', size: 'sm' })
            )
          ),
        'Icons can be placed before or after the link text.'
      ),
      Section(
        'Disabled State',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary' }, 'Enabled'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', disabled: true }, 'Disabled')
          ),
        'Disabled ButtonLinks render as a non-interactive span, preventing navigation.'
      ),
      Section(
        'Full Width',
        () =>
          html.div(
            attr.class('flex flex-col gap-2 max-w-sm'),
            ButtonLink({ href: '#', variant: 'filled', color: 'primary', fullWidth: true }, 'Full Width Link'),
            ButtonLink({ href: '#', variant: 'outline', fullWidth: true }, 'Full Width Outline')
          ),
        'ButtonLink can expand to fill its container width.'
      ),
    ],
  })
}
