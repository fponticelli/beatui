import {
  aria,
  attr,
  computedOf,
  Fragment,
  html,
  on,
  TNode,
  Unless,
  Value,
  When,
} from '@tempots/dom'
import { ControlSize, IconSize } from '../theme'
import { Icon } from '../data/icon'
import { ThemeColorName } from '../../tokens'

export interface ActionCardOptions {
  icon: Value<string>
  title: Value<string>
  description: Value<string>
  active?: Value<boolean>
  disabled?: Value<boolean>
  onClick?: () => void
  size?: Value<ControlSize>
  iconColor?: Value<ThemeColorName>
  iconSize?: Value<IconSize>
  // CSS variable overrides
  backgroundColor?: Value<string>
  borderColor?: Value<string>
  titleColor?: Value<string>
  descriptionColor?: Value<string>
}

function generateActionCardClasses(
  active: boolean,
  disabled: boolean,
  size: ControlSize,
  clickable: boolean
): string {
  const classes = ['bc-action-card']

  if (active) {
    classes.push('bc-action-card--active')
  }

  if (disabled) {
    classes.push('bc-action-card--disabled')
  }

  if (size !== 'md') {
    classes.push(`bc-action-card--${size}`)
  }

  if (clickable && !disabled) {
    classes.push('bc-action-card--clickable')
  }

  return classes.join(' ')
}

function generateActionCardStyles(
  backgroundColor?: string,
  borderColor?: string,
  titleColor?: string,
  descriptionColor?: string
): string | undefined {
  const styles = new Map<string, string>()

  // Only set CSS variables if custom overrides are provided
  // This allows CSS hover states to work properly
  if (backgroundColor != null) {
    styles.set('--action-card-bg', backgroundColor)
  }
  if (borderColor != null) {
    styles.set('--action-card-border', borderColor)
  }
  if (titleColor != null) {
    styles.set('--action-card-title-color', titleColor)
  }
  if (descriptionColor != null) {
    styles.set('--action-card-description-color', descriptionColor)
  }

  if (styles.size === 0) {
    return undefined
  }

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

export function ActionCard({
  icon,
  title,
  description,
  active = false,
  disabled = false,
  onClick,
  size = 'md',
  iconColor = 'primary',
  iconSize = 'md',
  backgroundColor,
  borderColor,
  titleColor,
  descriptionColor,
}: ActionCardOptions): TNode {
  const clickable = onClick != null

  return html.div(
    attr.class(
      computedOf(
        active,
        disabled,
        size
      )((active, disabled, size) =>
        generateActionCardClasses(
          active ?? false,
          disabled ?? false,
          size ?? 'md',
          clickable
        )
      )
    ),
    attr.style(
      computedOf(
        backgroundColor,
        borderColor,
        titleColor,
        descriptionColor
      )((bg, border, title, desc) =>
        generateActionCardStyles(bg, border, title, desc)
      )
    ),
    When(clickable, () =>
      Fragment(
        Unless(disabled, () =>
          Fragment(
            on.click(() => onClick?.()),
            attr.tabindex(0)
          )
        ),
        attr.role('button')
      )
    ),
    aria.disabled(disabled),
    // Icon container
    html.div(
      attr.class('bc-action-card__icon'),
      Icon({ icon, size: iconSize, color: iconColor })
    ),
    // Content container
    html.div(
      attr.class('bc-action-card__content'),
      html.div(attr.class('bc-action-card__title'), title),
      html.div(attr.class('bc-action-card__description'), description)
    )
  )
}
