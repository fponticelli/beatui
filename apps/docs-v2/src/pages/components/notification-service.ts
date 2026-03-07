import {
  NotificationService,
  NotificationProvider,
  NotificationViewport,
  Button,
  Group,
} from '@tempots/beatui'
import { html, attr, Provide } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NotificationService',
  category: 'Feedback',
  component: 'ShowNotification',
  description:
    'A toast notification system for dispatching ephemeral popup notifications programmatically. Wrap your app with NotificationProvider and place a NotificationViewport to render toasts.',
  icon: 'lucide:bell-ring',
  order: 4,
}

export default function NotificationServicePage() {
  return ComponentPage(meta, {
    playground: Provide(
      NotificationProvider,
      { position: 'bottom-end' },
      () =>
        html.div(
          attr.class('flex flex-col gap-4 w-full'),
          html.div(
            attr.class(
              'flex flex-col gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
            ),
            html.div(
              attr.class('flex flex-col items-center gap-4 p-6'),
              html.p(
                attr.class('text-sm text-gray-500 mb-2'),
                'Use the buttons below to dispatch toast notifications.'
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
            )
          ),
          NotificationViewport()
        )
    ),
    sections: [
      Section(
        'Basic Usage',
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
            ...(
              [
                'top-start',
                'top-end',
                'bottom-start',
                'bottom-end',
              ] as const
            ).map(position =>
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
