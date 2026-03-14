import { AnnouncementBar } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'AnnouncementBar',
  category: 'Feedback',
  component: 'AnnouncementBar',
  description:
    'A colored banner displayed at the top of a page or container for announcements, promotions, or system messages. Supports icons and user-dismissal.',
  icon: 'lucide:megaphone',
  order: 2,
}

/** Wraps content in a container that simulates a page viewport for announcement bar demos. */
function demoContainer(...children: Parameters<typeof html.div>) {
  return html.div(
    attr.class(
      'relative w-full min-h-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden'
    ),
    ...children
  )
}

export default function AnnouncementBarPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'AnnouncementBar',
      props =>
        AnnouncementBar(
          { ...props, portal: false },
          'New features are available! Check out our latest release.'
        ),
      { childrenCode: "'New features are available! Check out our latest release.'" }
    ),
    sections: [
      Section(
        'With Icon',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-full'),
            demoContainer(
              AnnouncementBar(
                {
                  color: 'info',
                  icon: 'lucide:info',
                  portal: false,
                },
                'System maintenance is scheduled for tonight at 10 PM UTC.'
              )
            ),
            demoContainer(
              AnnouncementBar(
                {
                  color: 'success',
                  icon: 'lucide:check-circle',
                  portal: false,
                },
                'Your plan has been upgraded successfully.'
              )
            ),
            demoContainer(
              AnnouncementBar(
                {
                  color: 'warning',
                  icon: 'lucide:alert-triangle',
                  portal: false,
                },
                'Your trial expires in 3 days. Upgrade to continue.'
              )
            )
          ),
        'Add an icon to the start of the announcement bar.'
      ),
      Section(
        'Dismissable',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-full'),
            demoContainer(
              AnnouncementBar(
                {
                  color: 'primary',
                  closable: true,
                  onClose: () => console.log('bar dismissed'),
                  portal: false,
                },
                'Click the close button to dismiss this announcement.'
              )
            ),
            demoContainer(
              AnnouncementBar(
                {
                  color: 'info',
                  icon: 'lucide:megaphone',
                  closable: true,
                  onClose: () => console.log('dismissed'),
                  portal: false,
                },
                'Big sale this weekend — up to 50% off all products!'
              )
            )
          ),
        'Enable closable to let users dismiss the announcement bar.'
      ),
    ],
  })
}
