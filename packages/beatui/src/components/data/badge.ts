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

export interface BadgeOptions {
  variant?: Value<ButtonVariant>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName>
  roundedness?: Value<RadiusName>
  circle?: Value<boolean>
  fullWidth?: Value<boolean>
}

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
