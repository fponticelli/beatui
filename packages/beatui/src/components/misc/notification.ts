import {
  aria,
  attr,
  computedOf,
  html,
  Renderable,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { Icon } from '../data'
import { CloseButton } from '../button'
import { ThemeColorName, getColorVar } from '../../tokens/colors'
import { RadiusName, getRadiusVar } from '../../tokens/radius'

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
  }: NotificationOptions = {},
  ...children: TNode[]
): Renderable {
  const hasIcon = Value.map(icon, value => value != null)

  return html.section(
    attr.class(
      computedOf(
        withBorder,
        hasIcon,
        withCloseButton,
        loading,
        cls
      )((border, iconPresent, closable, loadingState, extra) =>
        [
          generateNotificationClasses(
            border,
            iconPresent,
            closable,
            loadingState,
            extra
          ),
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
            color: color as Value<ThemeColorName>,
            accessibility: 'decorative',
          })
        ),
      () =>
        When(
          hasIcon,
          () =>
            html.div(
              attr.class('bc-notification__visual bc-notification__icon'),
              Icon({
                icon: icon as Value<string>,
                size: 'lg',
                color: color as Value<ThemeColorName>,
              })
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
          color: color as Value<ThemeColorName>,
          onClick: onClose,
        })
      )
    )
  )
}
