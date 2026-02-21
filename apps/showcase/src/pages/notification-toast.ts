import { html, attr, prop } from '@tempots/dom'
import {
  Button,
  Icon,
  Stack,
  Group,
  NotificationService,
  NativeSelect,
  Label,
  Option,
  SelectOption,
  CheckboxInput,
  ThemeColorName,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { SectionBlock } from '../views/section'

export default function NotificationToastPage() {
  const colorStr = prop<string>('primary')
  const color =
    colorStr as unknown as import('@tempots/dom').Prop<ThemeColorName>
  const withBorder = prop(false)
  const dismissAfterStr = prop('0')
  const dismissAfter = dismissAfterStr.map(v => {
    const n = Number(v)
    return n > 0 ? n : undefined
  })

  return WidgetPage({
    id: 'notification-toast',
    title: 'Notification Toast',
    description: 'Toast notifications for user feedback.',
    controls: ControlsHeader(
      Stack(
        Label('Color'),
        NativeSelect({
          options: [
            Option.value('primary', 'Primary'),
            Option.value('secondary', 'Secondary'),
            Option.value('success', 'Success'),
            Option.value('warning', 'Warning'),
            Option.value('danger', 'Danger'),
            Option.value('info', 'Info'),
          ] as SelectOption<string>[],
          value: colorStr,
          onChange: v => colorStr.set(v),
        })
      ),
      Stack(
        Label('Auto-dismiss (seconds)'),
        NativeSelect({
          options: [
            Option.value('0', 'Manual'),
            Option.value('3', '3s'),
            Option.value('5', '5s'),
            Option.value('10', '10s'),
          ] as SelectOption<string>[],
          value: dismissAfterStr,
          onChange: v => dismissAfterStr.set(v),
        })
      ),
      Stack(
        Label('With border'),
        CheckboxInput({
          value: withBorder,
          onChange: v => withBorder.set(v),
        })
      )
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Basic Notifications',
        Group(
          attr.class('gap-3'),
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('Success'),
                    icon: 'lucide:check-circle',
                    color: color.value,
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  'Your action completed successfully.'
                ),
            },
            Icon({ icon: 'lucide:check-circle', size: 'sm' }),
            'Show Success'
          ),
          Button(
            {
              variant: 'filled',
              color: 'warning',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('Warning'),
                    icon: 'lucide:alert-triangle',
                    color: 'warning',
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  'Please review the changes before proceeding.'
                ),
            },
            Icon({ icon: 'lucide:alert-triangle', size: 'sm' }),
            'Show Warning'
          ),
          Button(
            {
              variant: 'filled',
              color: 'danger',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('Error'),
                    icon: 'lucide:x-circle',
                    color: 'danger',
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  'Something went wrong. Please try again.'
                ),
            },
            Icon({ icon: 'lucide:x-circle', size: 'sm' }),
            'Show Error'
          ),
          Button(
            {
              variant: 'filled',
              color: 'info',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('Information'),
                    icon: 'lucide:info',
                    color: 'info',
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  'New features are now available in your dashboard.'
                ),
            },
            Icon({ icon: 'lucide:info', size: 'sm' }),
            'Show Info'
          )
        )
      ),

      SectionBlock(
        'Without Icons',
        Group(
          attr.class('gap-3'),
          Button(
            {
              variant: 'outline',
              color: 'primary',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('Simple Notification'),
                    color: color.value,
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  'This notification has no icon, showing a colored accent bar instead.'
                ),
            },
            'Show Simple'
          ),
          Button(
            {
              variant: 'outline',
              color: 'secondary',
              onClick: () =>
                NotificationService.show(
                  {
                    color: color.value,
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  'Notification without title or icon.'
                ),
            },
            'No Title/Icon'
          )
        )
      ),

      SectionBlock(
        'Loading State',
        Group(
          attr.class('gap-3'),
          Button(
            {
              variant: 'light',
              color: 'primary',
              onClick: () => {
                const loadingPromise = new Promise<void>(resolve =>
                  setTimeout(resolve, 3000)
                )
                NotificationService.show(
                  {
                    title: html.strong('Processing...'),
                    loading: true,
                    color: color.value,
                    withBorder: withBorder.value,
                    dismissAfter: loadingPromise,
                  },
                  'Your request is being processed.'
                )
              },
            },
            Icon({ icon: 'lucide:loader-2', size: 'sm' }),
            'Show Loading (3s)'
          ),
          Button(
            {
              variant: 'light',
              color: 'secondary',
              onClick: () => {
                const loadingPromise = new Promise<void>(resolve =>
                  setTimeout(resolve, 5000)
                )
                NotificationService.show(
                  {
                    title: html.strong('Uploading file...'),
                    loading: true,
                    color: 'secondary',
                    withBorder: withBorder.value,
                    dismissAfter: loadingPromise,
                  },
                  'Please wait while we upload your file.'
                )
              },
            },
            Icon({ icon: 'lucide:upload', size: 'sm' }),
            'Upload Progress (5s)'
          )
        )
      ),

      SectionBlock(
        'Rich Content',
        Group(
          attr.class('gap-3'),
          Button(
            {
              variant: 'filled',
              color: 'success',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('Update Available'),
                    icon: 'lucide:download',
                    color: 'success',
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  html.div(
                    attr.class('space-y-1'),
                    html.div('Version 2.0.0 is now available.'),
                    html.div(
                      attr.class('text-xs opacity-75'),
                      'Includes new features and bug fixes.'
                    )
                  )
                ),
            },
            Icon({ icon: 'lucide:download', size: 'sm' }),
            'Update Notice'
          ),
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: () =>
                NotificationService.show(
                  {
                    title: html.strong('New Message'),
                    icon: 'lucide:mail',
                    color: 'primary',
                    withBorder: withBorder.value,
                    dismissAfter: dismissAfter.value,
                  },
                  html.div(
                    attr.class('space-y-1'),
                    html.div(
                      attr.class('font-medium'),
                      'From: john.doe@example.com'
                    ),
                    html.div(
                      attr.class('text-sm'),
                      'Meeting scheduled for 3 PM'
                    )
                  )
                ),
            },
            Icon({ icon: 'lucide:mail', size: 'sm' }),
            'Email Notification'
          )
        )
      ),

      SectionBlock(
        'Actions',
        Group(
          attr.class('gap-3'),
          Button(
            {
              variant: 'outline',
              color: 'primary',
              onClick: () => {
                for (let i = 0; i < 5; i++) {
                  NotificationService.show(
                    {
                      title: html.strong(`Notification ${i + 1}`),
                      icon: 'lucide:bell',
                      color: color.value,
                      withBorder: withBorder.value,
                      dismissAfter: dismissAfter.value,
                    },
                    `This is notification number ${i + 1}`
                  )
                }
              },
            },
            Icon({ icon: 'lucide:layers', size: 'sm' }),
            'Show Multiple (5)'
          ),
          Button(
            {
              variant: 'outline',
              color: 'danger',
              onClick: () => NotificationService.clear(),
            },
            Icon({ icon: 'lucide:x', size: 'sm' }),
            'Clear All'
          )
        )
      ),

      SectionBlock(
        'Custom Positions',
        html.div(
          attr.class('space-y-2'),
          html.p(
            attr.class('text-sm text-base-600 dark:text-base-400'),
            'Notifications appear at the bottom-right by default. Position can be configured via the NotificationProvider options.'
          ),
          Group(
            attr.class('gap-3'),
            Button(
              {
                variant: 'light',
                color: 'primary',
                onClick: () =>
                  NotificationService.show(
                    {
                      title: html.strong('Default Position'),
                      icon: 'lucide:corner-down-right',
                      color: color.value,
                      withBorder: withBorder.value,
                      dismissAfter: dismissAfter.value,
                    },
                    'This appears at bottom-end (default)'
                  ),
              },
              Icon({ icon: 'lucide:corner-down-right', size: 'sm' }),
              'Bottom-End (Default)'
            )
          ),
          html.p(
            attr.class('text-xs text-base-500 dark:text-base-400 italic mt-2'),
            'Note: To change position, configure NotificationProvider with position: "top-start" | "top-end" | "bottom-start" | "bottom-end"'
          )
        )
      )
    ),
  })
}
