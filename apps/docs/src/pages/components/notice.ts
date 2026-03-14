import { Notice } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Notice',
  category: 'Feedback',
  component: 'Notice',
  description:
    'An informational banner or callout with variant-driven styling, optional title, icon, and dismiss support.',
  icon: 'lucide:info',
  order: 2,
}

export default function NoticePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'Notice',
      props =>
        Notice(props, 'This is an informational notice with important details.'),
      { childrenCode: "'This is an informational notice with important details.'" }
    ),
    sections: [
      ...AutoSections('Notice', props =>
        Notice(
          props,
          'This notice demonstrates the current prop configuration.'
        )
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            Notice({ variant: 'info' }, 'This is an informational message.'),
            Notice({ variant: 'success' }, 'Operation completed successfully.'),
            Notice({ variant: 'warning' }, 'Please review before proceeding.'),
            Notice({ variant: 'danger' }, 'Something went wrong. Please try again.')
          ),
        'Four semantic variants map to distinct color schemes and default icons: info, success, warning, and danger.'
      ),
      Section(
        'With Title',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            Notice(
              { variant: 'info', title: 'Did you know?' },
              'BeatUI components are fully reactive and theme-aware.'
            ),
            Notice(
              { variant: 'success', title: 'Changes saved' },
              'Your profile has been updated successfully.'
            ),
            Notice(
              { variant: 'warning', title: 'Heads up' },
              'This action will affect all users in your organization.'
            ),
            Notice(
              { variant: 'danger', title: 'Deletion is permanent' },
              'Deleted data cannot be recovered. Please confirm before proceeding.'
            )
          ),
        'An optional title renders as a prominent heading above the notice body.'
      ),
      Section(
        'Prominent Tone',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            Notice({ variant: 'info', tone: 'prominent' }, 'Prominent info notice.'),
            Notice({ variant: 'success', tone: 'prominent' }, 'Prominent success notice.'),
            Notice({ variant: 'warning', tone: 'prominent' }, 'Prominent warning notice.'),
            Notice({ variant: 'danger', tone: 'prominent' }, 'Prominent danger notice.')
          ),
        'The prominent tone uses stronger backgrounds for higher visual emphasis.'
      ),
      Section(
        'Closable',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            Notice(
              { variant: 'info', title: 'Dismissible notice', closable: true },
              'Click the close button to dismiss this notice.'
            ),
            Notice(
              {
                variant: 'warning',
                title: 'With dismiss callback',
                closable: true,
                onClose: () => console.log('Notice dismissed'),
              },
              'Dismissing fires an onClose callback for custom handling.'
            )
          ),
        'Set closable to true to show a dismiss button. An onClose callback fires when the user closes the notice.'
      ),
      Section(
        'No Icon',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            Notice(
              { variant: 'info', icon: false },
              'This notice has no icon for a cleaner look.'
            ),
            Notice(
              { variant: 'warning', title: 'Custom Icon', icon: 'lucide:zap' },
              'Replace the default icon with any Iconify identifier.'
            )
          ),
        'Pass icon: false to suppress the icon entirely, or provide a custom Iconify icon identifier.'
      ),
    ],
  })
}
