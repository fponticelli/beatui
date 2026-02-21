import { html, attr, prop, Value } from '@tempots/dom'
import {
  AnnouncementBar,
  Card,
  ScrollablePanel,
  SegmentedInput,
  Switch,
  Group,
  InputWrapper,
  ThemeColorName,
} from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export default function AnnouncementBarPage() {
  const color = prop<ThemeColorName>('primary')
  const showIcon = prop(true)
  const closable = prop(true)

  return ScrollablePanel({
    header: ControlsHeader(
      Group(
        attr.class('gap-4'),
        InputWrapper({
          label: 'Color',
          content: SegmentedInput({
            options: {
              primary: 'Primary',
              success: 'Success',
              warning: 'Warning',
              danger: 'Danger',
              info: 'Info',
            },
            value: color as Value<
              'primary' | 'success' | 'warning' | 'danger' | 'info'
            >,
            onChange: v => color.set(v),
          }),
        }),
        InputWrapper({
          content: Switch({
            value: showIcon,
            onChange: v => showIcon.set(v),
          }),
          label: 'Show Icon',
        }),
        InputWrapper({
          content: Switch({
            value: closable,
            onChange: v => closable.set(v),
          }),
          label: 'Closable',
        })
      )
    ),
    body: html.div(
      attr.class('flex flex-col gap-12 p-12'),

      // Interactive example
      html.div(
        attr.class('relative'),
        Card(
          {},
          attr.class('w-full h-96 p-4 flex items-center justify-center'),
          html.div(
            attr.class('text-center'),
            html.h3(
              attr.class('text-lg font-semibold mb-2'),
              'Interactive Example'
            ),
            html.p(
              attr.class('text-gray-500 dark:text-gray-400'),
              'The announcement bar appears at the top center of this card'
            )
          ),
          AnnouncementBar(
            {
              color,
              icon: showIcon.map((show): string | undefined =>
                show ? 'mdi:information-outline' : undefined
              ),
              closable,
            },
            "You're on our launch Free plan with unlimited features!"
          )
        )
      ),

      // Different colors
      html.div(
        attr.class('space-y-4'),
        html.h3(attr.class('text-lg font-semibold mb-4'), 'Color Variants'),
        html.div(
          attr.class('grid grid-cols-1 md:grid-cols-2 gap-4'),

          // Primary
          html.div(
            attr.class('relative'),
            Card(
              {},
              attr.class('h-48 p-4 flex items-center justify-center'),
              html.div(
                attr.class('text-center text-gray-500 dark:text-gray-400'),
                'Primary Announcement'
              ),
              AnnouncementBar({ color: 'primary' }, 'Primary notification')
            )
          ),

          // Success
          html.div(
            attr.class('relative'),
            Card(
              {},
              attr.class('h-48 p-4 flex items-center justify-center'),
              html.div(
                attr.class('text-center text-gray-500 dark:text-gray-400'),
                'Success Announcement'
              ),
              AnnouncementBar(
                { color: 'success', icon: 'mdi:check-circle' },
                'Operation completed successfully!'
              )
            )
          ),

          // Warning
          html.div(
            attr.class('relative'),
            Card(
              {},
              attr.class('h-48 p-4 flex items-center justify-center'),
              html.div(
                attr.class('text-center text-gray-500 dark:text-gray-400'),
                'Warning Announcement'
              ),
              AnnouncementBar(
                { color: 'warning', icon: 'mdi:alert' },
                'Please review your settings'
              )
            )
          ),

          // Danger
          html.div(
            attr.class('relative'),
            Card(
              {},
              attr.class('h-48 p-4 flex items-center justify-center'),
              html.div(
                attr.class('text-center text-gray-500 dark:text-gray-400'),
                'Danger Announcement'
              ),
              AnnouncementBar(
                { color: 'danger', icon: 'mdi:alert-circle' },
                'Critical issue detected'
              )
            )
          ),

          // Info
          html.div(
            attr.class('relative'),
            Card(
              {},
              attr.class('h-48 p-4 flex items-center justify-center'),
              html.div(
                attr.class('text-center text-gray-500 dark:text-gray-400'),
                'Info Announcement'
              ),
              AnnouncementBar(
                { color: 'info', icon: 'mdi:information' },
                'New features available'
              )
            )
          )
        )
      ),

      // Closable example
      html.div(
        attr.class('space-y-4'),
        html.h3(
          attr.class('text-lg font-semibold mb-4'),
          'Closable Announcement Bar'
        ),
        html.div(
          attr.class('relative'),
          Card(
            {},
            attr.class('h-48 p-4 flex items-center justify-center'),
            html.div(
              attr.class('text-center'),
              html.p(
                attr.class('text-gray-500 dark:text-gray-400'),
                'Click the close button to dismiss'
              )
            ),
            AnnouncementBar(
              {
                color: 'primary',
                icon: 'mdi:gift',
                closable: true,
                onDismiss: () => console.log('Announcement dismissed'),
              },
              'Special offer: Get 50% off your first month!'
            )
          )
        )
      )
    ),
  })
}
