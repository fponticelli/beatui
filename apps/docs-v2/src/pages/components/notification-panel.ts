import { NotificationPanel } from '@tempots/beatui'
import type { NotificationPanelItem } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NotificationPanel',
  category: 'Feedback',
  component: 'NotificationPanel',
  description:
    'A panel for displaying a list of notifications with read/unread state, icons, and metadata.',
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
    playground: html.div(
      attr.class('w-full max-w-sm'),
      (() => {
        const items = prop<NotificationPanelItem[]>([...sampleItems])
        return NotificationPanel({
          items,
          onMarkAllRead: () =>
            items.update(list => list.map(i => ({ ...i, read: true }))),
          onClose: () => console.log('Panel closed'),
        })
      })()
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
    ],
  })
}
