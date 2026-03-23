import { aria, attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { ControlSize } from '../theme'
import { ThemeColorName } from '../../tokens'
import { Icon } from './icon'
import { BeatUII18n } from '../../beatui-i18n'

/** Visual style variant for {@link StatCard}. */
export type StatCardVariant = 'default' | 'elevated' | 'outlined'

/** Trend direction for {@link StatCardTrend}. */
export type TrendDirection = 'up' | 'down' | 'flat'

/** Configuration options for the {@link StatCard} component. */
export interface StatCardOptions {
  /** Visual style variant. @default 'default' */
  variant?: Value<StatCardVariant>
  /** Controls internal padding. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color accent. @default 'primary' */
  color?: Value<ThemeColorName>
}

/** Options for a {@link StatCardSection}. */
export interface StatCardSectionOptions {
  /** Additional CSS classes. */
  class?: Value<string>
}

/** Configuration for the {@link StatCardTrend} sub-component. */
export interface StatCardTrendOptions {
  /** The trend value to display (e.g. "+12%", "3.2"). */
  value: Value<string | number>
  /** Direction of the trend. */
  direction: Value<TrendDirection>
  /** Override the auto-derived color. When omitted, uses success/danger/neutral based on direction. */
  color?: Value<ThemeColorName>
}

function generateStatCardClasses(
  variant: StatCardVariant,
  size: ControlSize
): string {
  const cls = ['bc-stat-card']
  if (variant !== 'default') cls.push(`bc-stat-card--${variant}`)
  if (size !== 'md') cls.push(`bc-stat-card--padding-${size}`)
  return cls.join(' ')
}

/**
 * A dashboard metric card that displays a statistic with optional label,
 * trend indicator, icon, and sparkline slot.
 *
 * Uses a composition pattern — combine with {@link StatCardValue},
 * {@link StatCardLabel}, {@link StatCardTrend}, {@link StatCardIcon},
 * and {@link StatCardSparkline} to build rich stat displays.
 *
 * @param options - Configuration for variant, size, and color
 * @param children - Sub-components to render inside the card
 * @returns A stat card element
 *
 * @example
 * ```ts
 * StatCard({ variant: 'elevated' },
 *   StatCardIcon({}, Icon({ icon: 'lucide:users', size: 'lg' })),
 *   StatCardValue({}, '1,234'),
 *   StatCardLabel({}, 'Active Users'),
 *   StatCardTrend({ value: '+12%', direction: 'up' }),
 * )
 * ```
 */
export function StatCard(
  { variant = 'default', size = 'md', color = 'primary' }: StatCardOptions = {},
  ...children: TNode[]
): TNode {
  return html.div(
    attr.role('group'),
    attr.class(computedOf(variant, size)(generateStatCardClasses)),
    attr.style(
      Value.map(color, c => `--stat-card-accent: var(--color-${c}-500)`)
    ),
    ...children
  )
}

/**
 * The primary metric value of a {@link StatCard}.
 *
 * @example
 * ```ts
 * StatCardValue({}, '1,234')
 * StatCardValue({}, formattedRevenue)
 * ```
 */
export function StatCardValue(
  { class: className }: StatCardSectionOptions = {},
  ...children: TNode[]
): TNode {
  return html.div(
    attr.class('bc-stat-card__value'),
    attr.class(className),
    ...children
  )
}

/**
 * A descriptive label for a {@link StatCard} metric.
 *
 * @example
 * ```ts
 * StatCardLabel({}, 'Monthly Revenue')
 * ```
 */
export function StatCardLabel(
  { class: className }: StatCardSectionOptions = {},
  ...children: TNode[]
): TNode {
  return html.div(
    attr.class('bc-stat-card__label'),
    attr.class(className),
    ...children
  )
}

/**
 * A trend indicator showing a value with a directional arrow.
 *
 * When no `color` is provided, the color is auto-derived from `direction`:
 * up → success, down → danger, flat → neutral.
 *
 * @param options - Trend value, direction, and optional color override
 * @returns A trend indicator element
 *
 * @example
 * ```ts
 * StatCardTrend({ value: '+12.5%', direction: 'up' })
 * StatCardTrend({ value: '-3%', direction: 'down' })
 * StatCardTrend({ value: '0%', direction: 'flat' })
 * ```
 */
export function StatCardTrend(options: StatCardTrendOptions): TNode {
  const { value, direction, color } = options

  return Use(BeatUII18n, t => {
    const resolvedColor =
      color != null
        ? color
        : Value.map(
            direction,
            (d): ThemeColorName =>
              d === 'up' ? 'success' : d === 'down' ? 'danger' : 'neutral'
          )

    const iconName = Value.map(direction, (d): string =>
      d === 'up'
        ? 'lucide:trending-up'
        : d === 'down'
          ? 'lucide:trending-down'
          : 'lucide:minus'
    )

    const ariaText = computedOf(
      direction,
      value,
      t.$.statCard.$.trendUp,
      t.$.statCard.$.trendDown,
      t.$.statCard.$.trendFlat
    )(
      (d, v, up, down, flat) =>
        `${d === 'up' ? up : d === 'down' ? down : flat}: ${v}`
    )

    return html.span(
      attr.role('status'),
      attr.class(
        Value.map(
          direction,
          d => `bc-stat-card__trend bc-stat-card__trend--${d}`
        )
      ),
      attr.style(
        Value.map(
          resolvedColor,
          c =>
            `--stat-card-trend-color: var(--color-${c}-600); --stat-card-trend-color-dark: var(--color-${c}-400)`
        )
      ),
      aria.label(ariaText),
      Icon({ icon: iconName, size: 'xs' }),
      html.span(
        attr.class('bc-stat-card__trend-value'),
        Value.map(value, String)
      )
    )
  })
}

/**
 * An icon slot for a {@link StatCard}, typically placed at the top or side.
 *
 * @example
 * ```ts
 * StatCardIcon({}, Icon({ icon: 'lucide:dollar-sign', size: 'lg', color: 'primary' }))
 * ```
 */
export function StatCardIcon(
  { class: className }: StatCardSectionOptions = {},
  ...children: TNode[]
): TNode {
  return html.div(
    attr.class('bc-stat-card__icon'),
    attr.class(className),
    ...children
  )
}

/**
 * A sparkline/chart slot for a {@link StatCard}.
 * Renders a container where you can place any chart or visualization component.
 *
 * @example
 * ```ts
 * StatCardSparkline({}, mySparklineChart)
 * ```
 */
export function StatCardSparkline(
  { class: className }: StatCardSectionOptions = {},
  ...children: TNode[]
): TNode {
  return html.div(
    attr.class('bc-stat-card__sparkline'),
    attr.class(className),
    ...children
  )
}
