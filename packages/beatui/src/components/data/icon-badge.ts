import { attr, computedOf, html, TNode, Value, When } from '@tempots/dom'
import { Icon, IconOptions } from './icon'
import { Badge } from './badge'
import { ThemeColorName } from '../../tokens'

export interface IconBadgeOptions extends IconOptions {
  /** Show a dot indicator */
  indicator?: Value<boolean>
  /** Show a count badge. If > 0, displays the number. */
  count?: Value<number>
  /** Max count to display (e.g., 9 shows "9+") */
  maxCount?: Value<number>
  /** Color of the indicator badge */
  indicatorColor?: Value<ThemeColorName>
}

export function IconBadge(options: IconBadgeOptions): TNode {
  const {
    indicator,
    count,
    maxCount = 9,
    indicatorColor = 'danger',
    ...iconOptions
  } = options

  const showIndicator = computedOf(
    indicator ?? false,
    count ?? 0
  )((ind, cnt) => ind || cnt > 0)

  const badgeContent = computedOf(
    count ?? 0,
    maxCount
  )((cnt, max) => {
    if (cnt <= 0) return ''
    return cnt > max ? `${max}+` : String(cnt)
  })

  const isDot = computedOf(
    indicator ?? false,
    count ?? 0
  )((ind, cnt) => ind && cnt <= 0)

  return html.span(
    attr.class('bc-icon-badge'),
    Icon(iconOptions),
    When(showIndicator, () =>
      html.span(
        attr.class('bc-icon-badge__indicator'),
        When(
          isDot,
          () => Badge({ dot: true, color: indicatorColor, size: 'xs' }),
          () =>
            Badge(
              { color: indicatorColor, size: 'xs', circle: true },
              badgeContent
            )
        )
      )
    )
  )
}
