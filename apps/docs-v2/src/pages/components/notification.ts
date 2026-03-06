import { Notification } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Notification',
  category: 'Feedback',
  component: 'Notification',
  description:
    'A notification card with optional icon, title, body content, loading state, and close button. Supports theme colors and border radius customization.',
  icon: 'lucide:bell',
  order: 1,
}

export default function NotificationPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Notification', props =>
      Notification(
        {
          ...props,
          title: html.strong('Notification Title'),
        } as never,
        'This is the notification body text.'
      )
    ),
    sections: [
      ...AutoSections('Notification', props =>
        Notification(
          { ...props } as never,
          'Notification body content.'
        )
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-full max-w-sm'),
            ...([
              'primary',
              'secondary',
              'success',
              'danger',
              'warning',
              'info',
            ] as const).map(color =>
              Notification(
                {
                  color,
                  icon: 'lucide:bell',
                  title: html.strong(
                    color.charAt(0).toUpperCase() + color.slice(1)
                  ),
                },
                `This is a ${color} notification.`
              )
            )
          ),
        'Notifications support all theme colors.'
      ),
      Section(
        'With Border',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-full max-w-sm'),
            Notification(
              {
                color: 'info',
                icon: 'lucide:info',
                title: html.strong('With Border'),
                withBorder: true,
              },
              'This notification has a colored left border.'
            ),
            Notification(
              {
                color: 'success',
                icon: 'lucide:check-circle',
                title: html.strong('No Border'),
                withBorder: false,
              },
              'This notification has no border.'
            )
          ),
        'Use withBorder to add a colored accent border to the notification.'
      ),
      Section(
        'With Close Button',
        () =>
          Notification(
            {
              color: 'warning',
              icon: 'lucide:alert-triangle',
              title: html.strong('Storage Warning'),
              withCloseButton: true,
              onClose: () => console.log('notification closed'),
            },
            'You are running low on storage. Please free up space.'
          ),
        'Enable withCloseButton to let users dismiss the notification.'
      ),
      Section(
        'Loading State',
        () =>
          Notification(
            {
              color: 'primary',
              loading: true,
              title: html.span('Processing...'),
            },
            'Your changes are being applied. Please wait.'
          ),
        'The loading state replaces the icon with an animated spinner.'
      ),
      Section(
        'Without Icon (Accent Bar)',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-full max-w-sm'),
            Notification(
              { color: 'primary', title: html.strong('No Icon') },
              'When no icon is provided, a colored accent bar is shown instead.'
            ),
            Notification(
              {
                color: 'danger',
                withBorder: true,
                title: html.strong('Error'),
              },
              'Something went wrong. Please try again.'
            )
          ),
        'When no icon is specified, a colored accent bar fills the left column.'
      ),
      Section(
        'Gallery',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-full max-w-sm'),
            Notification(
              {
                color: 'info',
                withBorder: true,
                icon: 'lucide:info',
                title: html.strong('Product update'),
              },
              html.span('Docs now include a Notification component.')
            ),
            Notification(
              {
                color: 'success',
                withCloseButton: true,
                icon: 'lucide:check-circle',
                title: html.strong('Backup complete'),
              },
              html.span('Nightly backup finished with no issues.')
            ),
            Notification(
              {
                color: 'warning',
                loading: true,
                title: html.span('Syncing changes'),
              },
              html.span('We are applying your pending workspace edits.')
            ),
            Notification(
              {
                color: 'danger',
                icon: 'lucide:alert-circle',
                withBorder: true,
                withCloseButton: true,
                title: html.strong('Connection lost'),
              },
              html.span('Unable to reach the server. Check your connection.')
            )
          ),
        'A variety of notification styles for different scenarios.'
      ),
    ],
  })
}
