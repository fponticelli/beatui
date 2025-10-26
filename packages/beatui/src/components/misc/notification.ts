import {
  aria,
  attr,
  computedOf,
  html,
  OnDispose,
  prop,
  Renderable,
  TNode,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { Icon } from '../data'
import { CloseButton } from '../button'
import { ThemeColorName, getColorVar } from '@/tokens/colors'
import { RadiusName, getRadiusVar } from '@/tokens/radius'
import { useAnimatedElementToggle } from '@/utils/use-animated-toggle'
import { delayedAnimationFrame } from '@tempots/std'

export type NotificationOptions = {
  loading?: Value<boolean>
  withCloseButton?: Value<boolean>
  withBorder?: Value<boolean>
  color?: Value<ThemeColorName>
  radius?: Value<RadiusName>
  title?: TNode
  icon?: Value<string | undefined>
  onClose?: () => void
  class?: Value<string | undefined>
  /**
   * Automatically dismiss the notification after the provided number of seconds.
   */
  dismissAfter?: Value<number | undefined>
  /**
   * Dismiss the notification once the provided promise resolves.
   */
  dismissWhen?: Promise<unknown>
  /**
   * Controlled open state provided by NotificationProvider.
   */
  open?: Value<boolean>
  /**
   * Callback invoked to request closing the notification.
   */
  onRequestClose?: () => void
}

export function generateNotificationClasses(
  withBorder: boolean,
  hasIcon: boolean,
  hasCloseButton: boolean,
  loading: boolean,
  extra?: string
): string {
  const classes = ['bc-notification']

  if (withBorder) classes.push('bc-notification--bordered')
  if (hasIcon) classes.push('bc-notification--has-icon')
  if (hasCloseButton) classes.push('bc-notification--closable')
  if (loading) classes.push('bc-notification--loading')
  if (extra && extra.length > 0) classes.push(extra)

  return classes.join(' ')
}

export function generateNotificationStyles(
  color: ThemeColorName,
  radius: RadiusName
): string {
  return [
    `--notification-accent-color: ${getColorVar(color, 500)}`,
    `--notification-radius: ${getRadiusVar(radius)}`,
  ].join('; ')
}

export function Notification(
  {
    loading = false,
    withCloseButton = false,
    withBorder = false,
    color = 'primary',
    radius = 'md',
    title,
    icon,
    onClose,
    class: cls,
    dismissAfter,
    dismissWhen,
    open,
    onRequestClose,
  }: NotificationOptions = {},
  ...children: TNode[]
): Renderable {
  const hasIcon = Value.map(icon, value => value != null)
  const localOpen = prop(true)
  const resolvedOpen = open ?? localOpen
  const requestClose =
    onRequestClose ??
    (() => {
      if (!localOpen.value) return
      localOpen.set(false)
    })

  return WithElement(element => {
    const animatedToggle = useAnimatedElementToggle({
      initialStatus: Value.get(resolvedOpen) ? 'opened' : 'closed',
      element,
    })
    let pendingClose = !Value.get(resolvedOpen)
    const disposables: Array<() => void> = []

    const stopWatchingOpen = Value.on(resolvedOpen, isOpen => {
      if (isOpen) {
        pendingClose = false
        animatedToggle.open()
      } else {
        pendingClose = true
        animatedToggle.close()
      }
    })

    const handleClosed = animatedToggle.onClosed(() => {
      if (!pendingClose) return
      pendingClose = false
      onClose?.()
    })

    if (dismissAfter != null) {
      const seconds = Value.get(dismissAfter)
      if (seconds != null && seconds > 0 && Number.isFinite(seconds)) {
        const timeout = setTimeout(() => {
          requestClose()
        }, seconds * 1000)
        disposables.push(() => clearTimeout(timeout))
      }
    }

    if (dismissWhen) {
      let active = true
      dismissWhen
        .then(() => {
          if (!active) return
          requestClose()
        })
        .catch(() => {
          /* ignore */
        })
      disposables.push(() => {
        active = false
      })
    }

    delayedAnimationFrame(() => {
      if (Value.get(resolvedOpen)) {
        animatedToggle.open()
      }
    })

    return html.section(
      OnDispose(() => {
        stopWatchingOpen()
        handleClosed()
        animatedToggle.dispose()
        disposables.forEach(fn => {
          try {
            fn()
          } catch {
            /* ignore */
          }
        })
      }),
      attr.class(
        computedOf(
          withBorder,
          hasIcon,
          withCloseButton,
          loading,
          cls,
          animatedToggle.status
        )((border, iconPresent, closable, loadingState, extra, status) =>
          [
            generateNotificationClasses(
              border,
              iconPresent,
              closable,
              loadingState,
              extra
            ),
            `bc-notification--status-${status}`,
          ].join(' ')
        )
      ),
      attr.style(
        computedOf(
          color,
          radius
        )((colorName, radiusName) =>
          generateNotificationStyles(colorName, radiusName)
        )
      ),
      aria.live('polite'),
      aria.busy(loading),
      When(
        loading,
        () =>
          html.div(
            attr.class('bc-notification__visual bc-notification__loader'),
            Icon({
              icon: 'line-md:loading-twotone-loop',
              size: 'lg',
              color: color,
              accessibility: 'decorative',
            })
          ),
        () =>
          When(
            hasIcon,
            () =>
              html.div(
                attr.class('bc-notification__visual bc-notification__icon'),
                Icon({ icon: icon as Value<string>, size: 'lg', color })
              ),
            () =>
              html.div(
                attr.class('bc-notification__visual bc-notification__accent'),
                aria.hidden(true)
              )
          )
      ),
      html.div(
        attr.class('bc-notification__body'),
        title != null
          ? html.div(attr.class('bc-notification__title'), title)
          : null,
        html.div(attr.class('bc-notification__content'), ...children)
      ),
      When(withCloseButton, () =>
        html.div(
          attr.class('bc-notification__meta'),
          CloseButton({
            size: 'sm',
            color: color as Value<ThemeColorName | 'black' | 'white'>,
            onClick: requestClose,
          })
        )
      )
    )
  })
}
