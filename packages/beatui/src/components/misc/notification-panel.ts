import {
  TNode,
  Value,
  attr,
  html,
  on,
  computedOf,
  ForEach,
  When,
  Empty,
  Use,
} from '@tempots/dom'
import { Icon } from '../data'
import { Badge } from '../data/badge'
import { BeatUII18n } from '../../beatui-i18n'

export interface NotificationPanelItem {
  id: string
  icon: string
  iconColor?: string
  title: string
  body: string
  time: string
  read: boolean
  source?: { label: string; type: string }
  onClick?: () => void
}

export interface NotificationPanelOptions {
  items: Value<NotificationPanelItem[]>
  onMarkAllRead?: () => void
  onClose?: () => void
}

export function NotificationPanel(options: NotificationPanelOptions): TNode {
  const { items, onMarkAllRead, onClose } = options

  const unreadCount = computedOf(items)(
    list => list.filter(i => !i.read).length
  )

  return Use(BeatUII18n, t =>
    html.div(
      attr.class('bc-notification-panel'),

      // Header
      html.div(
        attr.class('bc-notification-panel__header'),
        html.div(
          attr.class('bc-notification-panel__header-title'),
          html.span(t.$.notifications),
          When(
            computedOf(unreadCount)(c => c > 0),
            () =>
              Badge(
                { color: 'primary', size: 'xs', circle: true },
                unreadCount.map(String)
              )
          )
        ),
        html.div(
          attr.class('bc-notification-panel__header-actions'),
          onMarkAllRead
            ? html.button(
                attr.class('bc-notification-panel__mark-read-btn'),
                attr.type('button'),
                on.click(() => onMarkAllRead()),
                t.$.markAllAsRead
              )
            : Empty,
          onClose
            ? html.button(
                attr.class('bc-notification-panel__close-btn'),
                attr.type('button'),
                on.click(() => onClose()),
                Icon({ icon: 'lucide:x', size: 'sm' })
              )
            : Empty
        )
      ),

      // List
      html.div(
        attr.class('bc-notification-panel__list'),
        ForEach(items, item => {
          return html.div(
            attr.class(
              item.map(i =>
                i.read
                  ? 'bc-notification-panel__item'
                  : 'bc-notification-panel__item bc-notification-panel__item--unread'
              )
            ),
            on.click(() => item.value.onClick?.()),

            // Icon
            html.div(
              attr.class('bc-notification-panel__item-icon'),
              attr.style(
                item.map(i =>
                  i.iconColor
                    ? `background: ${i.iconColor}14; color: ${i.iconColor}`
                    : ''
                )
              ),
              Icon({ icon: item.$.icon, size: 'sm' })
            ),

            // Content
            html.div(
              attr.class('bc-notification-panel__item-content'),
              html.div(
                attr.class('bc-notification-panel__item-title'),
                item.$.title
              ),
              html.div(
                attr.class('bc-notification-panel__item-body'),
                item.$.body
              ),
              html.div(
                attr.class('bc-notification-panel__item-meta'),
                html.span(item.$.time),
                When(
                  item.map(i => i.source !== undefined),
                  () =>
                    html.span(
                      attr.class('bc-notification-panel__item-source'),
                      item.map(i => i.source?.label ?? '')
                    )
                )
              )
            ),

            // Unread dot
            When(
              item.map(i => !i.read),
              () => html.span(attr.class('bc-notification-panel__item-dot'))
            )
          )
        }),

        // Empty state
        When(
          computedOf(items)(list => list.length === 0),
          () =>
            html.div(
              attr.class('bc-notification-panel__empty'),
              Icon({ icon: 'lucide:bell-off', size: 'lg' }),
              html.div(t.$.noNotifications)
            )
        )
      )
    )
  )
}
