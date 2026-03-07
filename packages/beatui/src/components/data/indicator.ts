import { attr, computedOf, html, TNode, Value, When } from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'

/** Placement of the indicator relative to its container. */
export type IndicatorPlacement =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

/** Configuration options for the {@link Indicator} component. */
export interface IndicatorOptions {
  /** Whether to show the indicator. @default true */
  show?: Value<boolean>
  /** Count to display. When > 0, shows a count badge instead of a dot. */
  count?: Value<number>
  /** Maximum count before showing "N+". @default 9 */
  maxCount?: Value<number>
  /** Theme color of the indicator. @default 'danger' */
  color?: Value<ThemeColorName>
  /** Position of the indicator. @default 'top-right' */
  placement?: Value<IndicatorPlacement>
  /** Size of the indicator. @default 'sm' */
  size?: Value<ControlSize>
}

function generateIndicatorBadgeClasses(
  placement: IndicatorPlacement,
  size: ControlSize,
  isDot: boolean
): string {
  const classes = [
    'bc-indicator__badge',
    `bc-indicator--${placement}`,
    `bc-indicator--size-${size}`,
  ]
  if (isDot) {
    classes.push('bc-indicator--dot')
  } else {
    classes.push('bc-indicator--count')
  }
  return classes.join(' ')
}

function generateIndicatorStyles(color: ExtendedColor): string {
  const light = backgroundValue(color, 'solid', 'light')
  const dark = backgroundValue(color, 'solid', 'dark')
  return [
    `--indicator-bg: ${light.backgroundColor}`,
    `--indicator-text: ${light.textColor}`,
    `--indicator-bg-dark: ${dark.backgroundColor}`,
    `--indicator-text-dark: ${dark.textColor}`,
  ].join('; ')
}

/**
 * Overlays a small dot or count badge on any child content.
 * Use for notification counts, status dots, or unread indicators.
 *
 * @param options - Configuration for visibility, count, color, placement, and size
 * @param children - The content to overlay the indicator on (Icon, Avatar, Button, etc.)
 * @returns A positioned container with the indicator badge
 *
 * @example
 * ```typescript
 * // Dot indicator on an icon
 * Indicator({ show: hasNotifications }, Icon({ icon: 'mdi:bell' }))
 * ```
 *
 * @example
 * ```typescript
 * // Count badge on an avatar
 * Indicator({ count: unreadCount, color: 'primary' }, Avatar({ name: 'John' }))
 * ```
 */
export function Indicator(
  {
    show = true,
    count,
    maxCount = 9,
    color = 'danger',
    placement = 'top-right',
    size = 'sm',
  }: IndicatorOptions,
  ...children: TNode[]
) {
  const shouldShow = computedOf(
    show,
    count ?? 0
  )((s, c) => (s ?? true) || c > 0)

  const isDot = computedOf(count ?? 0)(c => c <= 0)

  const badgeContent = computedOf(
    count ?? 0,
    maxCount
  )((c, max) => {
    if (c <= 0) return ''
    return c > (max ?? 9) ? `${max ?? 9}+` : String(c)
  })

  return html.span(
    attr.class('bc-indicator'),
    ...children,
    When(shouldShow, () =>
      html.span(
        attr.class(
          computedOf(
            placement,
            size,
            isDot
          )((p, s, dot) =>
            generateIndicatorBadgeClasses(
              p ?? 'top-right',
              s ?? 'sm',
              dot ?? true
            )
          )
        ),
        attr.style(
          computedOf(color)(c =>
            generateIndicatorStyles((c ?? 'danger') as ExtendedColor)
          )
        ),
        badgeContent
      )
    )
  )
}
