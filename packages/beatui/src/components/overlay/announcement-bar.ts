import {
  TNode,
  Value,
  attr,
  html,
  computedOf,
  When,
  prop,
  Renderable,
} from '@tempots/dom'
import { Icon } from '../data'
import type { ThemeColorName } from '../../tokens'
import { CloseButton } from '../button'
import { getColorVar } from '../../tokens/colors'

/**
 * Configuration options for the {@link AnnouncementBar} component.
 */
export type AnnouncementBarOptions = {
  /**
   * Theme color applied to the announcement bar background.
   * @default 'primary'
   */
  color?: Value<ThemeColorName>
  /**
   * Optional icon identifier displayed at the start of the announcement bar.
   * When `undefined` or not provided, no icon is rendered.
   */
  icon?: Value<string | undefined>
  /**
   * Whether the announcement bar can be dismissed by the user via a close button.
   * @default false
   */
  closable?: Value<boolean>
  /**
   * Callback invoked when the user dismisses the announcement bar.
   * When provided and `closable` is not explicitly set, the bar is implicitly made dismissible.
   */
  onDismiss?: () => void
  /**
   * Additional CSS class names to apply to the announcement bar element.
   */
  class?: Value<string>
}

/** @internal Builds the CSS class string for the announcement bar based on its state. */
function generateAnnouncementBarClasses(
  dismissible: boolean,
  extra?: string
): string {
  const classes = ['bc-announcement-bar']
  if (dismissible) classes.push('bc-announcement-bar--dismissible')
  if (extra && extra.length > 0) classes.push(extra)
  return classes.join(' ')
}

/** @internal Generates the inline style string with CSS custom properties for the announcement bar color. */
function generateAnnouncementBarStyles(color: ThemeColorName): string {
  return `--announcement-bar-bg-color: ${getColorVar(color, 600)}`
}

/**
 * Displays a colored announcement bar, typically at the top of a page or container.
 *
 * Supports an optional leading icon, user-dismissible close button, and theme color
 * customization. When dismissed, the bar is removed from the DOM and the `onDismiss`
 * callback is invoked.
 *
 * @param options - Configuration options controlling color, icon, closability, and styling
 * @param children - Text or node content displayed inside the announcement bar
 * @returns A renderable node that is conditionally visible based on dismiss state
 *
 * @example
 * ```typescript
 * AnnouncementBar(
 *   { color: 'warning', closable: true, onDismiss: () => console.log('dismissed') },
 *   "You're on our launch Free plan with unlimited resumes and redaction!"
 * )
 * ```
 *
 * @example
 * ```typescript
 * // With an icon
 * AnnouncementBar(
 *   { color: 'info', icon: 'info-circle', closable: true },
 *   'System maintenance scheduled for tonight at 10 PM.'
 * )
 * ```
 */
export function AnnouncementBar(
  {
    color = 'primary',
    icon,
    closable = false,
    onDismiss,
    class: cls,
  }: AnnouncementBarOptions,
  ...children: TNode[]
): Renderable {
  const visible = prop(true)
  return When(visible, () => {
    const isDismissible = Value.map(
      closable,
      v => Boolean(v) || onDismiss != null
    )
    return html.div(
      attr.class(
        computedOf(
          isDismissible,
          cls
        )((dism, extra) => generateAnnouncementBarClasses(dism, extra))
      ),
      attr.style(
        Value.map(color, colorName => generateAnnouncementBarStyles(colorName))
      ),
      html.div(
        attr.class('bc-announcement-bar__content'),
        When(
          Value.map(icon, ic => ic != null),
          () =>
            html.div(
              attr.class('bc-announcement-bar__icon'),
              Icon({
                icon: icon as Value<string>,
                size: 'sm',
                accessibility: 'decorative',
              })
            )
        ),
        html.div(attr.class('bc-announcement-bar__text'), ...children),
        When(isDismissible, () =>
          html.div(
            attr.class('bc-announcement-bar__close'),
            CloseButton({
              size: 'xs',
              color: 'white',
              onClick: () => {
                visible.set(false)
                onDismiss?.()
              },
            })
          )
        )
      )
    )
  })
}
