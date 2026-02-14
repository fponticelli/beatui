import { html, attr, prop } from '@tempots/dom'
import { NotificationPanel, NotificationPanelItem } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

const sampleNotifications: NotificationPanelItem[] = [
  {
    id: '1',
    icon: 'lucide:at-sign',
    iconColor: '#2563EB',
    title: 'Sarah mentioned you',
    body: 'Hey, can you review the Q3 budget report?',
    time: '2 min ago',
    read: false,
    source: { label: 'Q3 Budget', type: 'doc' },
  },
  {
    id: '2',
    icon: 'lucide:share-2',
    iconColor: '#9333EA',
    title: 'Jordan shared a document',
    body: 'Engineering Roadmap 2026 has been shared with you',
    time: '15 min ago',
    read: false,
    source: { label: 'Eng Roadmap', type: 'doc' },
  },
  {
    id: '3',
    icon: 'lucide:message-circle',
    iconColor: '#059669',
    title: 'New comment on Tasks',
    body: 'Alex replied: "Looks good to me, let\'s proceed"',
    time: '1 hour ago',
    read: true,
    source: { label: 'Tasks', type: 'collection' },
  },
  {
    id: '4',
    icon: 'lucide:cloud-off',
    iconColor: '#DC2626',
    title: 'Sync error',
    body: 'Failed to sync "API Endpoints" — retrying in 30s',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '5',
    icon: 'lucide:bell',
    iconColor: '#6B7280',
    title: 'System update',
    body: 'BeatUI v2.4 is now available with new components',
    time: '1 day ago',
    read: true,
  },
]

export default function NotificationPanelPage() {
  return WidgetPage({
    id: 'notification-panel',
    title: 'Notification Panel',
    description:
      'Flyout panel for listing notifications with unread indicators.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),
      SectionBlock(
        'Default',
        html.div(
          attr.style('position: relative; min-height: 400px'),
          NotificationPanel({
            items: prop(sampleNotifications),
            onMarkAllRead: () => {},
            onClose: () => {},
          })
        )
      )
    ),
  })
}
