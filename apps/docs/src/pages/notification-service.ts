import {
  Button,
  Label,
  NumberInput,
  ScrollablePanel,
  Stack,
  Switch,
  TextInput,
  ThemeColorName,
  NotificationProvider,
  NotificationService,
} from '@tempots/beatui'
import { attr, html, prop, Use } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { ColorSelector } from '../elements/color-selector'

export default function NotificationServicePage() {
  const title = prop('Changes saved')
  const message = prop('We stored your latest updates.')
  const color = prop<ThemeColorName>('success')
  const withBorder = prop(true)
  const withCloseButton = prop(true)
  const loading = prop(false)
  const dismissAfter = prop(5)

  const resolvedTitle = () => {
    const value = title.value.trim()
    return value.length > 0 ? value : undefined
  }

  const showAutoDismiss = () => {
    NotificationService.show(
      {
        title: resolvedTitle(),
        color,
        withBorder,
        withCloseButton,
        loading,
        dismissAfter:
          dismissAfter.value > 0 ? dismissAfter.value : undefined,
      },
      html.span(message.value)
    )
  }

  const showPromiseNotification = () => {
    const operation = new Promise<void>(resolve => {
      setTimeout(resolve, 3500)
    })

    NotificationService.show(
      {
        title: 'Syncing data',
        color: 'info',
        loading: true,
        withBorder: true,
        dismissWhen: operation,
      },
      html.span(
        'This notification closes when the simulated async operation resolves.'
      )
    )
  }

  const showPersistent = () => {
    NotificationService.show(
      {
        title: 'Manual dismissal',
        color: 'warning',
        withBorder: true,
        withCloseButton: true,
      },
      html.span('Use the close button or the Clear All action below.')
    )
  }

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(Label('Title'), TextInput({ value: title, onInput: title.set })),
      Stack(
        Label('Message'),
        TextInput({ value: message, onInput: message.set })
      ),
      Stack(Label('Color'), ColorSelector({ color, onChange: color.set })),
      Stack(
        Label('Dismiss after (seconds)'),
        NumberInput({
          value: dismissAfter,
          min: 0,
          step: 1,
          onInput: dismissAfter.set,
        })
      ),
      Stack(
        Label('Show loader'),
        Switch({ value: loading, onChange: loading.set })
      ),
      Stack(
        Label('Border'),
        Switch({ value: withBorder, onChange: withBorder.set })
      ),
      Stack(
        Label('Close button'),
        Switch({ value: withCloseButton, onChange: withCloseButton.set })
      )
    ),
    body: Stack(
      attr.class('gap-4 p-4'),
      Use(NotificationProvider, ({ notifications }) =>
        html.p(
          attr.class('text-sm text-muted-foreground'),
          notifications.map(items =>
            items.length === 0
              ? 'No active notifications'
              : `${items.length} active notification${
                  items.length === 1 ? '' : 's'
                }`
          )
        )
      ),
      html.section(
        html.h3(attr.class('text-lg font-semibold'), 'Playground'),
        Stack(
          attr.class('gap-2'),
          Button({ variant: 'filled', onClick: showAutoDismiss }, 'Show'),
          Button(
            { variant: 'light', onClick: showPromiseNotification },
            'Show async notification'
          ),
          Button(
            { variant: 'outline', onClick: showPersistent },
            'Show persistent notification'
          ),
          Button(
            { variant: 'text', color: 'danger', onClick: () => NotificationService.clear() },
            'Clear all'
          )
        )
      )
    ),
  })
}
