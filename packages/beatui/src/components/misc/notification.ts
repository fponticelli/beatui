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

/**
 * Configuration options for the {@link Notification} component.
 */
export type NotificationOptions = {
  /**
   * Whether the notification is in a loading state. When `true`, a spinner
   * icon replaces the custom icon.
   * @default false
   */
  loading?: Value<boolean>
  /**
   * Whether to display a close button in the notification.
   * @default false
   */
  withCloseButton?: Value<boolean>
  /**
   * Whether the notification displays a colored border.
   * @default false
   */
  withBorder?: Value<boolean>
  /**
   * Theme color applied to the notification accent, icon, and close button.
   * @default 'primary'
   */
  color?: Value<ThemeColorName>
  /**
   * Border radius applied to the notification container.
   * @default 'md'
   */
  radius?: Value<RadiusName>
  /**
   * Optional title content rendered above the notification body.
   */
  title?: TNode
  /**
   * Iconify icon identifier to display. When `undefined` and not loading,
   * a colored accent bar is shown instead.
   */
  icon?: Value<string | undefined>
  /**
   * Callback invoked when the close button is clicked.
   */
  onClose?: () => void
  /**
   * Additional CSS class name(s) to apply to the notification root element.
   */
  class?: Value<string | undefined>
}

/**
 * Builds the CSS class string for a Notification element based on its state flags.
 *
 * @param withBorder - Whether the bordered modifier class is applied.
 * @param hasIcon - Whether the has-icon modifier class is applied.
 * @param hasCloseButton - Whether the closable modifier class is applied.
 * @param loading - Whether the loading modifier class is applied.
 * @param extra - Optional additional CSS class(es) to append.
 * @returns A space-separated class string for the notification root element.
 */
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

/**
 * Builds the inline CSS style string for a Notification element, setting
 * CSS custom properties for accent color and border radius.
 *
 * @param color - Theme color name used for the accent (maps to the 500 shade).
 * @param radius - Radius token name for the notification border radius.
 * @returns A semicolon-separated CSS variable declaration string.
 */
export function generateNotificationStyles(
  color: ThemeColorName,
  radius: RadiusName
): string {
  return [
    `--notification-accent-color: ${getColorVar(color, 500)}`,
    `--notification-radius: ${getRadiusVar(radius)}`,
  ].join('; ')
}

/**
 * Renders a notification card with optional icon, title, body content,
 * loading state, and close button. Uses ARIA live regions for accessibility.
 *
 * The notification displays one of three visual states for the left column:
 * - A loading spinner when `loading` is `true`
 * - A custom icon when `icon` is provided
 * - A colored accent bar as a fallback
 *
 * @param options - Configuration options for the notification.
 * @param children - Content nodes rendered inside the notification body.
 * @returns A renderable notification section element.
 *
 * @example
 * ```typescript
 * // Basic notification with title
 * Notification(
 *   { title: html.strong('Upload complete'), color: 'success' },
 *   'Your file has been uploaded successfully.'
 * )
 *
 * // Notification with icon and close button
 * Notification(
 *   {
 *     icon: 'material-symbols:info-outline',
 *     withCloseButton: true,
 *     onClose: () => console.log('closed'),
 *   },
 *   'A new version is available.'
 * )
 *
 * // Loading notification
 * Notification(
 *   { loading: true, title: html.span('Processing...') },
 *   'Please wait while we process your request.'
 * )
 * ```
 */
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
