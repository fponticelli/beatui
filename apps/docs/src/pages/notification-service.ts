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
  AnimationConfig,
  InputWrapper,
  NativeSelect,
  Option,
  SelectOption,
} from '@tempots/beatui'
import { attr, html, prop, Use, When } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { ColorSelector } from '../elements/color-selector'

type AnimationPreset =
  | 'none'
  | 'fade'
  | 'fade-slide-right'
  | 'fade-slide-left'
  | 'fade-slide-up'
  | 'fade-slide-down'
  | 'slide-right'
  | 'slide-left'
  | 'slide-up'
  | 'slide-down'
  | 'scale'
  | 'scale-fade'

const animationPresets: Record<AnimationPreset, AnimationConfig> = {
  none: {},
  fade: { fade: true },
  'fade-slide-right': { fade: true, slide: 'right' },
  'fade-slide-left': { fade: true, slide: 'left' },
  'fade-slide-up': { fade: true, slide: 'up' },
  'fade-slide-down': { fade: true, slide: 'down' },
  'slide-right': { slide: 'right' },
  'slide-left': { slide: 'left' },
  'slide-up': { slide: 'up' },
  'slide-down': { slide: 'down' },
  scale: { scale: true },
  'scale-fade': { fade: true, scale: true },
}

export default function NotificationServicePage() {
  const title = prop('Changes saved')
  const message = prop('We stored your latest updates.')
  const color = prop<ThemeColorName>('success')
  const withBorder = prop(true)
  const withCloseButton = prop(true)
  const loading = prop(false)
  const dismissAfter = prop(3)
  const animationPreset = prop<AnimationPreset>('fade')
  const animation = animationPreset.map(preset => animationPresets[preset])

  let conter = 0
  const resolvedTitle = () => {
    const value = title.value.trim()
    return value.length > 0 ? `${value} #${++conter}` : undefined
  }

  const showAutoDismiss = () => {
    NotificationService.show(
      {
        title: resolvedTitle(),
        animation: animation.value,
        color,
        withBorder,
        withCloseButton,
        loading,
        dismissAfter: dismissAfter.value > 0 ? dismissAfter.value : undefined,
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
        title: 'Syncing data #' + ++conter,
        animation: animation.value,
        color,
        loading: true,
        withBorder,
        dismissAfter: operation,
      },
      html.span(
        'This notification closes when the simulated async operation resolves.'
      )
    )
  }

  const showPersistent = () => {
    NotificationService.show(
      {
        title: 'Manual dismissal #' + ++conter,
        animation: animation.value,
        color,
        withBorder,
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
      InputWrapper({
        label: 'Animation',
        content: NativeSelect({
          size: 'sm',
          options: [
            Option.value('none', 'None'),
            Option.value('fade', 'Fade'),
            Option.value('fade-slide-right', 'Fade Slide Right'),
            Option.value('fade-slide-left', 'Fade Slide Left'),
            Option.value('fade-slide-up', 'Fade Slide Up'),
            Option.value('fade-slide-down', 'Fade Slide Down'),
            Option.value('slide-right', 'Slide Right'),
            Option.value('slide-left', 'Slide Left'),
            Option.value('slide-up', 'Slide Up'),
            Option.value('slide-down', 'Slide Down'),
            Option.value('scale', 'Scale'),
            Option.value('scale-fade', 'Scale Fade'),
          ] as SelectOption<AnimationPreset>[],
          value: animationPreset,
          onChange: animationPreset.set,
        }),
      }),
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
      Use(NotificationProvider, ({ activeNotifications }) =>
        html.p(
          attr.class('text-sm text-muted-foreground'),
          When(
            activeNotifications.map(n => n === 0),
            () => 'No active notifications',
            () =>
              html.span(
                activeNotifications.map(
                  items => `${items} active notifications`
                )
              )
          )
        )
      ),
      html.section(
        html.h3(attr.class('text-lg font-semibold'), 'Playground'),
        Stack(
          attr.class('gap-2 items-center'),
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
            {
              variant: 'text',
              color: 'danger',
              onClick: () => NotificationService.clear(),
            },
            'Clear all'
          )
        )
      )
    ),
  })
}
