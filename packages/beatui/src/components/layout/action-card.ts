import {
  aria,
  attr,
  computedOf,
  Fragment,
  html,
  on,
  Unless,
  Value,
  When,
} from '@tempots/dom'
import { ControlSize, IconSize } from '../theme'
import { Icon } from '../data/icon'
import { ThemeColorName } from '../../tokens'

/**
 * Configuration options for the {@link ActionCard} component.
 */
export interface ActionCardOptions {
  /** Iconify icon identifier displayed on the left side of the card. */
  icon: Value<string>
  /** Primary title text displayed prominently in the card. */
  title: Value<string>
  /** Secondary description text displayed below the title. */
  description: Value<string>
  /**
   * Whether the card is in an active/selected state, adding a visual highlight.
   * @default false
   */
  active?: Value<boolean>
  /**
   * Whether the card is disabled. Disabled cards cannot be clicked and appear dimmed.
   * @default false
   */
  disabled?: Value<boolean>
  /**
   * Click handler. When provided, the card becomes interactive with `role="button"`,
   * keyboard support, and hover styles.
   */
  onClick?: () => void
  /**
   * Size variant controlling the card's padding and text sizing.
   * @default 'md'
   */
  size?: Value<ControlSize>
  /**
   * Theme color for the icon.
   * @default 'primary'
   */
  iconColor?: Value<ThemeColorName>
  /**
   * Size of the icon.
   * @default 'md'
   */
  iconSize?: Value<IconSize>
  /**
   * CSS variable override for the card background color.
   * Sets `--action-card-bg`.
   */
  backgroundColor?: Value<string>
  /**
   * CSS variable override for the card border color.
   * Sets `--action-card-border`.
   */
  borderColor?: Value<string>
  /**
   * CSS variable override for the title text color.
   * Sets `--action-card-title-color`.
   */
  titleColor?: Value<string>
  /**
   * CSS variable override for the description text color.
   * Sets `--action-card-description-color`.
   */
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

/**
 * Renders an interactive card with an icon, title, and description. Commonly
 * used for selection grids, feature highlights, or navigation tiles.
 *
 * When an `onClick` handler is provided, the card becomes clickable with
 * `role="button"`, keyboard activation (Enter/Space), and focus management.
 * The card supports active and disabled states, and allows CSS variable
 * overrides for custom theming.
 *
 * @param options - Configuration options for the action card.
 * @returns A renderable card element.
 *
 * @example
 * ```typescript
 * // Basic clickable action card
 * ActionCard({
 *   icon: 'material-symbols:upload',
 *   title: 'Upload File',
 *   description: 'Select a file from your computer',
 *   onClick: () => openFilePicker(),
 * })
 *
 * // Active card in a selection grid
 * const selected = prop('option-a')
 * ActionCard({
 *   icon: 'material-symbols:check-circle',
 *   title: 'Option A',
 *   description: 'The recommended choice',
 *   active: selected.map(v => v === 'option-a'),
 *   onClick: () => selected.set('option-a'),
 * })
 *
 * // Disabled card with custom colors
 * ActionCard({
 *   icon: 'material-symbols:lock',
 *   title: 'Premium Feature',
 *   description: 'Upgrade to unlock',
 *   disabled: true,
 *   iconColor: 'warning',
 * })
 * ```
 */
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
}: ActionCardOptions) {
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
