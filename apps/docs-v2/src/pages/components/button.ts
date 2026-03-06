import { Button, Icon } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Button',
  category: 'Buttons',
  component: 'Button',
  description:
    'A clickable button with multiple variants, sizes, colors, and states.',
  icon: 'lucide:mouse-pointer',
  order: 1,
}

export default function ButtonPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Button', props =>
      Button(
        props as Record<string, Value<unknown>>,
        'Click Me'
      )
    ),
    sections: [
      ...AutoSections('Button', props => Button(props, 'Button')),
      Section(
        'With Icons',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            Button(
              { variant: 'filled', color: 'primary' },
              Icon({ icon: 'lucide:plus', size: 'sm' }),
              'Add Item'
            ),
            Button(
              { variant: 'outline', color: 'danger' },
              Icon({ icon: 'lucide:trash-2', size: 'sm' }),
              'Delete'
            ),
            Button(
              { variant: 'light', color: 'success' },
              Icon({ icon: 'lucide:check', size: 'sm' }),
              'Approve'
            ),
            Button(
              { variant: 'text', color: 'info' },
              Icon({ icon: 'lucide:download', size: 'sm' }),
              'Download'
            )
          ),
        'Buttons can contain icons alongside text.'
      ),
      Section(
        'Loading State',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            Button({ loading: true, variant: 'filled', color: 'primary' }, 'Saving...'),
            Button({ loading: true, variant: 'outline' }, 'Loading'),
            Button({ loading: true, variant: 'light', color: 'success' }, 'Processing')
          ),
        'Buttons display a spinner and become non-interactive when loading.'
      ),
      Section(
        'Full Width',
        () =>
          html.div(
            attr.class('flex flex-col gap-2 w-full max-w-sm'),
            Button({ fullWidth: true, variant: 'filled', color: 'primary' }, 'Sign In'),
            Button({ fullWidth: true, variant: 'outline' }, 'Create Account')
          ),
        'Buttons can expand to fill their container.'
      ),
    ],
  })
}
