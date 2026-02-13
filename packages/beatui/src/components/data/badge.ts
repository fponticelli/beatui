import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '../../tokens'
import {
  backgroundValue,
  borderColorValue,
  hoverBackgroundValue,
  textColorValue,
  ExtendedColor,
} from '../theme/style-utils'
import { RadiusName } from '../../tokens/radius'

/** Configuration options for the {@link Badge} component. */
export interface BadgeOptions {
  /** Visual style variant matching button variants. @default 'filled' */
  variant?: Value<ButtonVariant>
  /** Size of the badge affecting padding and font. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for the badge background and text. @default 'base' */
  color?: Value<ThemeColorName>
  /** Border radius of the badge. @default 'full' */
  roundedness?: Value<RadiusName>
  /** Whether to render as a circle (equal width and height). @default false */
  circle?: Value<boolean>
  /** Whether the badge takes the full width of its container. @default false */
  fullWidth?: Value<boolean>
}

/**
 * Generates CSS class names for the badge based on size, roundedness, and shape.
 *
 * @param size - Control size for padding and text
 * @param roundedness - Border radius preset
 * @param circle - Whether to force a circular shape
 * @param fullWidth - Whether to stretch to full container width
 * @returns Space-separated CSS class string
 */
export function generateBadgeClasses(
  size: ControlSize,
  roundedness: RadiusName,
  circle: boolean,
  fullWidth: boolean
): string {
  const classes = [
    'bc-badge',
    `bc-badge--size-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]

  if (circle) {
    classes.push('bc-badge--circle')
  }

  if (fullWidth) {
    classes.push('bc-badge--full-width')
  }

  return classes.join(' ')
}

/**
 * Generates inline CSS custom properties for badge theming based on variant and color.
 * Sets background, text, border, and hover colors for both light and dark modes.
 *
 * @param variant - The visual style variant
 * @param color - The theme color
 * @returns Semicolon-separated CSS custom property declarations
 */
export function generateBadgeStyles(
  variant: ButtonVariant,
  color: ExtendedColor
): string {
  const styles = new Map<string, string>()

  const ensureHover = (
    lightBg: string,
    darkBg: string,
    lightText: string,
    darkText: string
  ) => {
    styles.set('--badge-bg-hover', lightBg)
    styles.set('--badge-text-hover', lightText)
    styles.set('--badge-bg-hover-dark', darkBg)
    styles.set('--badge-text-hover-dark', darkText)
  }

  switch (variant) {
    case 'filled': {
      const bgLight = backgroundValue(color, 'solid', 'light')
      const bgDark = backgroundValue(color, 'solid', 'dark')
      const hoverLight = hoverBackgroundValue(color, 'soft', 'light')
      const hoverDark = hoverBackgroundValue(color, 'soft', 'dark')

      styles.set('--badge-bg', bgLight.backgroundColor)
      styles.set('--badge-text', bgLight.textColor)
      styles.set('--badge-bg-dark', bgDark.backgroundColor)
      styles.set('--badge-text-dark', bgDark.textColor)
      styles.set('--badge-border', 'transparent')
      styles.set('--badge-border-dark', 'transparent')

      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }
    case 'light': {
      const bgLight = backgroundValue(color, 'light', 'light')
      const bgDark = backgroundValue(color, 'light', 'dark')
      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

      styles.set('--badge-bg', bgLight.backgroundColor)
      styles.set('--badge-text', bgLight.textColor)
      styles.set('--badge-bg-dark', bgDark.backgroundColor)
      styles.set('--badge-text-dark', bgDark.textColor)
      styles.set('--badge-border', 'transparent')
      styles.set('--badge-border-dark', 'transparent')

      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }
    case 'outline': {
      const textLight = textColorValue(color, 'light')
      const textDark = textColorValue(color, 'dark')
      const borderLight = borderColorValue(color, 'light')
      const borderDark = borderColorValue(color, 'dark')
      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

      styles.set('--badge-bg', 'transparent')
      styles.set('--badge-text', textLight)
      styles.set('--badge-bg-dark', 'transparent')
      styles.set('--badge-text-dark', textDark)
      styles.set('--badge-border', borderLight)
      styles.set('--badge-border-dark', borderDark)

      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }
    case 'default': {
      const textLight = textColorValue(color, 'light')
      const textDark = textColorValue(color, 'dark')
      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

      styles.set('--badge-bg', 'var(--bg-background-light)')
      styles.set('--badge-text', textLight)
      styles.set('--badge-bg-dark', 'var(--bg-background-dark)')
      styles.set('--badge-text-dark', textDark)
      styles.set('--badge-border', 'var(--border-border-light)')
      styles.set('--badge-border-dark', 'var(--border-border-dark)')

      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }
    case 'dashed': {
      const textLight = textColorValue(color, 'light')
      const textDark = textColorValue(color, 'dark')
      const borderLight = borderColorValue(color, 'light')
      const borderDark = borderColorValue(color, 'dark')
      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

      styles.set('--badge-bg', 'transparent')
      styles.set('--badge-text', textLight)
      styles.set('--badge-bg-dark', 'transparent')
      styles.set('--badge-text-dark', textDark)
      styles.set('--badge-border', borderLight)
      styles.set('--badge-border-dark', borderDark)
      styles.set('--badge-border-style', 'dashed')

      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }
    case 'text': {
      const textLight = textColorValue(color, 'light')
      const textDark = textColorValue(color, 'dark')
      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

      styles.set('--badge-bg', 'transparent')
      styles.set('--badge-text', textLight)
      styles.set('--badge-bg-dark', 'transparent')
      styles.set('--badge-text-dark', textDark)
      styles.set('--badge-border', 'transparent')
      styles.set('--badge-border-dark', 'transparent')

      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }
  }

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * A small status indicator or label component with theme-aware colors.
 * Supports all button variants (filled, light, outline, default, text) and
 * can be rendered as a pill, circle, or full-width element.
 *
 * @param options - Configuration for variant, size, color, and shape
 * @param children - Content to display inside the badge (text, number, icon)
 * @returns A styled span element
 *
 * @example
 * ```typescript
 * Badge({ variant: 'filled', color: 'success', size: 'sm' }, '3')
 * ```
 *
 * @example
 * ```typescript
 * // Circle badge for notification counts
 * Badge({ circle: true, color: 'danger', size: 'xs' }, '9+')
 * ```
 */
export function Badge(
  {
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'full',
    circle = false,
    fullWidth = false,
  }: BadgeOptions,
  ...children: TNode[]
) {
  return html.span(
    attr.class(
      computedOf(
        size,
        roundedness,
        circle,
        fullWidth
      )((size, roundedness, circle, fullWidth) =>
        generateBadgeClasses(
          size ?? 'md',
          roundedness ?? 'sm',
          circle ?? false,
          fullWidth ?? false
        )
      )
    ),
    attr.style(
      computedOf(
        variant,
        color
      )((variant, color) =>
        generateBadgeStyles(
          variant ?? 'filled',
          (color ?? 'base') as ExtendedColor
        )
      )
    ),
    html.span(attr.class('bc-badge__content'), ...children)
  )
}
