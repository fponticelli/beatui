import {
  TNode,
  Value,
  attr,
  html,
  computedOf,
  When,
  prop,
  Fragment,
  OnDispose,
  Renderable,
} from '@tempots/dom'
import { Icon } from '../data'
import type { ThemeColorName } from '@/tokens'
import { CloseButton } from '../button'
import { getColorVar } from '@/tokens/colors'

export type AnnouncementBarOptions = {
  color?: Value<ThemeColorName>
  icon?: Value<string | undefined>
  closable?: Value<boolean>
  onDismiss?: () => void
  class?: Value<string>
}

function generateAnnouncementBarClasses(
  dismissible: boolean,
  extra?: string
): string {
  const classes = ['bc-announcement-bar']
  if (dismissible) classes.push('bc-announcement-bar--dismissible')
  if (extra && extra.length > 0) classes.push(extra)
  return classes.join(' ')
}

function generateAnnouncementBarStyles(color: ThemeColorName): string {
  return `--announcement-bar-bg-color: ${getColorVar(color, 600)}`
}

/**
 * AnnouncementBar component - displays a colored announcement bar at the top center of its container
 *
 * @example
 * ```typescript
 * AnnouncementBar(
 *   { color: 'warning', closable: true },
 *   "You're on our launch Free plan with unlimited resumes and redaction!"
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
