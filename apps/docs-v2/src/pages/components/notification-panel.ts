import {
  NotificationPanel,
  NotificationService,
  NotificationProvider,
  NotificationViewport,
  Button,
  Group,
} from '@tempots/beatui'
import type { NotificationPanelItem } from '@tempots/beatui'
import { html, attr, prop, Provide } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NotificationPanel',
  category: 'Feedback',
  component: 'ShowNotification',
  description:
    'A panel for displaying a list of notifications with read/unread state, icons, and metadata. Also includes the NotificationService for dispatching toast notifications programmatically.',
  icon: 'lucide:bell',
  order: 3,
}

const sampleItems: NotificationPanelItem[] = [
  {
    id: '1',
    icon: 'lucide:check-circle',
    iconColor: '#22c55e',
    title: 'Deployment successful',
    body: 'Version 2.4.1 has been deployed to production.',
    time: '2 min ago',
    read: false,
    source: { label: 'CI/CD', type: 'system' },
  },
  {
    id: '2',
    icon: 'lucide:alert-triangle',
    iconColor: '#f59e0b',
    title: 'Storage limit approaching',
    body: 'You have used 85% of your allocated storage.',
    time: '1 hour ago',
    read: false,
    source: { label: 'System', type: 'system' },
  },
  {
    id: '3',
    icon: 'lucide:user',
    iconColor: '#6366f1',
    title: 'New team member',
    body: 'Alex Johnson joined your workspace.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    icon: 'lucide:message-square',
    iconColor: '#3b82f6',
    title: 'Comment on your post',
    body: 'Sara left a comment: "Great work on the new design!"',
    time: 'Yesterday',
    read: true,
    source: { label: 'Comments', type: 'activity' },
  },
]

export default function NotificationPanelPage() {
  return ComponentPage(meta, {
    playground: Provide(
      NotificationProvider,
      { position: 'bottom-end' },
      () =>
        html.div(
          attr.class('flex flex-col gap-4 w-full'),
          html.div(
            attr.class(
              'flex flex-col lg:flex-row gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
            ),
            html.div(
              attr.class('flex-1 flex flex-col items-center gap-4 p-6'),
              html.p(
                attr.class('text-sm text-gray-500 mb-2'),
                'Use the buttons below to dispatch toast notifications, or view the panel on the right.'
              ),
              Group(
                attr.class('flex-wrap justify-center gap-2'),
                Button(
                  {
                    variant: 'light',
                    color: 'success',
                    onClick: () =>
                      NotificationService.show(
                        {
                          title: html.strong('Success'),
                          color: 'success',
                          icon: 'lucide:check-circle',
                          withCloseButton: true,
                          dismissAfter: 4,
                        },
                        'Your changes have been saved successfully.'
                      ),
                  },
                  'Show Success'
                ),
                Button(
                  {
                    variant: 'light',
                    color: 'danger',
                    onClick: () =>
                      NotificationService.show(
                        {
                          title: html.strong('Error'),
                          color: 'danger',
                          icon: 'lucide:alert-circle',
                          withCloseButton: true,
                          dismissAfter: 5,
                        },
                        'Something went wrong. Please try again.'
                      ),
                  },
                  'Show Error'
                ),
                Button(
                  {
                    variant: 'light',
                    color: 'info',
                    onClick: () =>
                      NotificationService.show(
                        {
                          title: html.strong('Info'),
                          color: 'info',
                          icon: 'lucide:info',
                          dismissAfter: 4,
                        },
                        'A new version of the app is available.'
                      ),
                  },
                  'Show Info'
                ),
                Button(
                  {
                    variant: 'light',
                    color: 'warning',
                    onClick: () =>
                      NotificationService.show(
                        {
                          title: html.strong('Warning'),
                          color: 'warning',
                          icon: 'lucide:alert-triangle',
                          withCloseButton: true,
                          dismissAfter: 5,
                        },
                        'Storage is almost full.'
                      ),
                  },
                  'Show Warning'
                ),
                Button(
                  {
                    variant: 'light',
                    color: 'primary',
                    onClick: () =>
                      NotificationService.show(
                        {
                          title: html.strong('Loading'),
                          color: 'primary',
                          loading: true,
                          dismissAfter: 3,
                        },
                        'Processing your request...'
                      ),
                  },
                  'Show Loading'
                )
              )
            ),
            html.div(
              attr.class(
                'lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-4'
              ),
              NotificationPanel({
                items: prop<NotificationPanelItem[]>(sampleItems),
                onMarkAllRead: () => console.log('Mark all as read'),
                onClose: () => console.log('Panel closed'),
              })
            )
          ),
          NotificationViewport()
        )
    ),
    sections: [
      Section(
        'Notification Panel',
        () => {
          const items = prop<NotificationPanelItem[]>([...sampleItems])
          return html.div(
            attr.class('w-full max-w-sm'),
            NotificationPanel({
              items,
              onMarkAllRead: () =>
                items.update(list => list.map(i => ({ ...i, read: true }))),
              onClose: () => console.log('Panel closed'),
            })
          )
        },
        'NotificationPanel displays a list of notification items with read/unread state and optional source labels.'
      ),
      Section(
        'Empty State',
        () =>
          html.div(
            attr.class('w-full max-w-sm'),
            NotificationPanel({
              items: prop<NotificationPanelItem[]>([]),
            })
          ),
        'When no notifications are present, an empty state is shown with a bell icon.'
      ),
      Section(
        'Toast Notifications via NotificationService',
        () =>
          Provide(
            NotificationProvider,
            { position: 'bottom-end' },
            () =>
              html.div(
                attr.class('flex flex-col gap-4'),
                html.p(
                  attr.class('text-sm text-gray-500'),
                  'Use NotificationService.show() to dispatch toast notifications from anywhere in your application.'
                ),
                Group(
                  attr.class('flex-wrap gap-2'),
                  Button(
                    {
                      variant: 'light',
                      color: 'success',
                      onClick: () =>
                        NotificationService.show(
                          {
                            title: html.strong('File saved'),
                            color: 'success',
                            icon: 'lucide:save',
                            withCloseButton: true,
                            dismissAfter: 3,
                          },
                          'document.pdf has been saved.'
                        ),
                    },
                    'File Saved'
                  ),
                  Button(
                    {
                      variant: 'light',
                      color: 'primary',
                      onClick: () =>
                        NotificationService.show(
                          {
                            title: html.strong('Syncing'),
                            color: 'primary',
                            loading: true,
                            dismissAfter: 2,
                          },
                          'Syncing workspace data...'
                        ),
                    },
                    'Sync'
                  ),
                  Button(
                    {
                      variant: 'light',
                      color: 'danger',
                      onClick: () =>
                        NotificationService.show(
                          {
                            title: html.strong('Connection lost'),
                            color: 'danger',
                            icon: 'lucide:wifi-off',
                            withBorder: true,
                            withCloseButton: true,
                          },
                          'Unable to reach server. Retrying...'
                        ),
                    },
                    'Connection Error'
                  )
                ),
                NotificationViewport()
              )
          ),
        'NotificationService is a global singleton. Wrap your app with NotificationProvider and place NotificationViewport to render toasts.'
      ),
      Section(
        'Positions',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...([
              'top-start',
              'top-end',
              'bottom-start',
              'bottom-end',
            ] as const).map(position =>
              Provide(
                NotificationProvider,
                { position },
                () =>
                  html.div(
                    Button(
                      {
                        variant: 'outline',
                        onClick: () =>
                          NotificationService.show(
                            {
                              color: 'primary',
                              icon: 'lucide:map-pin',
                              withCloseButton: true,
                              dismissAfter: 3,
                            },
                            `Notification at ${position}`
                          ),
                      },
                      position
                    ),
                    NotificationViewport()
                  )
              )
            )
          ),
        'The NotificationProvider position prop controls which corner toasts appear in.'
      ),
    ],
  })
}
