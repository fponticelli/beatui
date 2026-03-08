import { AnnouncementBar } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
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

export default function AnnouncementBarPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('AnnouncementBar', props =>
      html.div(
        attr.class('w-full'),
        AnnouncementBar(
          props as never,
          'New features are available! Check out our latest release.'
        )
      )
    ),
    sections: [
      ...AutoSections('AnnouncementBar', props =>
        AnnouncementBar(
          props as never,
          'Announcement bar content goes here.'
        )
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-2 w-full'),
            ...([
              'primary',
              'secondary',
              'success',
              'danger',
              'warning',
              'info',
            ] as const).map(color =>
              AnnouncementBar(
                { color },
                `This is a ${color} announcement bar.`
              )
            )
          ),
        'Announcement bars support all theme colors.'
      ),
      Section(
        'With Icon',
        () =>
          html.div(
            attr.class('flex flex-col gap-2 w-full'),
            AnnouncementBar(
              {
                color: 'info',
                icon: 'lucide:info',
              },
              'System maintenance is scheduled for tonight at 10 PM UTC.'
            ),
            AnnouncementBar(
              {
                color: 'success',
                icon: 'lucide:check-circle',
              },
              'Your plan has been upgraded successfully.'
            ),
            AnnouncementBar(
              {
                color: 'warning',
                icon: 'lucide:alert-triangle',
              },
              'Your trial expires in 3 days. Upgrade to continue.'
            )
          ),
        'Add an icon to the start of the announcement bar.'
      ),
      Section(
        'Dismissable',
        () =>
          html.div(
            attr.class('flex flex-col gap-2 w-full'),
            AnnouncementBar(
              {
                color: 'primary',
                closable: true,
                onClose: () => console.log('bar dismissed'),
              },
              'Click the close button to dismiss this announcement.'
            ),
            AnnouncementBar(
              {
                color: 'info',
                icon: 'lucide:megaphone',
                closable: true,
                onClose: () => console.log('dismissed'),
              },
              'Big sale this weekend — up to 50% off all products!'
            )
          ),
        'Enable closable to let users dismiss the announcement bar.'
      ),
    ],
  })
}
