import {
  attr,
  computedOf,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
  When,
  aria,
  Use,
} from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../theme'
import { ThemeColorName } from '@/tokens'
import {
  backgroundValue,
  borderColorValue,
  hoverBackgroundValue,
  textColorValue,
  ExtendedColor,
} from '../theme/style-utils'
import { RadiusName } from '@/tokens/radius'
import { Icon } from '../data/icon'
import { ElementRect, Rect } from '@tempots/ui'
import { BeatUII18n } from '@/beatui-i18n'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  loading?: Value<boolean>
  variant?: Value<ButtonVariant>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName | 'black' | 'white'>
  roundedness?: Value<RadiusName>
  onClick?: () => void
}

export function generateButtonClasses(
  size: ControlSize,
  roundedness: RadiusName,
  loading?: boolean
): string {
  const classes = [
    'bc-button',
    `bc-button--size-${size}`,
    `bc-control--padding-${size}`,
    `bc-control--rounded-${roundedness}`,
  ]

  if (loading) {
    classes.push('bc-button--loading')
  }

  return classes.join(' ')
}

export function generateButtonStyles(
  variant: ButtonVariant,
  color: ExtendedColor,
  disabled?: boolean
): string {
  const styles = new Map<string, string>()

  styles.set('--button-text-shadow', 'var(--text-shadow-none)')
  styles.set('--button-text-shadow-dark', 'var(--text-shadow-none)')

  const ensureHover = (
    lightBg: string,
    darkBg: string,
    lightText: string,
    darkText: string
  ) => {
    if (disabled) return
    styles.set('--button-bg-hover', lightBg)
    styles.set('--button-text-hover', lightText)
    styles.set('--button-bg-hover-dark', darkBg)
    styles.set('--button-text-hover-dark', darkText)
  }

  switch (variant) {
    case 'filled': {
      const baseLight = backgroundValue(color, 'solid', 'light')
      const baseDark = backgroundValue(color, 'solid', 'dark')
      styles.set('--button-bg', baseLight.backgroundColor)
      styles.set('--button-text', baseLight.textColor)
      styles.set('--button-bg-dark', baseDark.backgroundColor)
      styles.set('--button-text-dark', baseDark.textColor)
      styles.set(
        '--button-text-shadow',
        'var(--text-shadow-button-filled, var(--text-shadow-sm))'
      )
      styles.set(
        '--button-text-shadow-dark',
        'var(--text-shadow-button-filled, var(--text-shadow-sm))'
      )

      const hoverLight = hoverBackgroundValue(color, 'solid', 'light')
      const hoverDark = hoverBackgroundValue(color, 'solid', 'dark')
      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }

    case 'light': {
      const baseLight = backgroundValue(color, 'light', 'light')
      const baseDark = backgroundValue(color, 'light', 'dark')
      styles.set('--button-bg', baseLight.backgroundColor)
      styles.set('--button-text', baseLight.textColor)
      styles.set('--button-bg-dark', baseDark.backgroundColor)
      styles.set('--button-text-dark', baseDark.textColor)

      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')
      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }

    case 'outline': {
      styles.set('--button-bg', 'transparent')
      styles.set('--button-bg-dark', 'transparent')
      styles.set('--button-border', borderColorValue(color, 'light'))
      styles.set('--button-border-dark', borderColorValue(color, 'dark'))
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-text-dark', textColorValue(color, 'dark'))
      styles.set(
        '--button-text-shadow',
        'var(--text-shadow-button-light, var(--text-shadow-xs))'
      )
      styles.set(
        '--button-text-shadow-dark',
        'var(--text-shadow-button-light, var(--text-shadow-xs))'
      )

      const hoverLight = hoverBackgroundValue(color, 'light', 'light')
      const hoverDark = hoverBackgroundValue(color, 'light', 'dark')
      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        hoverLight.textColor,
        hoverDark.textColor
      )
      break
    }

    case 'default': {
      const baseLight = backgroundValue('neutral', 'light', 'light')
      const baseDark = backgroundValue('neutral', 'light', 'dark')
      styles.set('--button-bg', baseLight.backgroundColor)
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-bg-dark', baseDark.backgroundColor)
      styles.set('--button-text-dark', textColorValue(color, 'dark'))
      styles.set(
        '--button-text-shadow',
        'var(--text-shadow-button-default, var(--text-shadow-2xs))'
      )
      styles.set(
        '--button-text-shadow-dark',
        'var(--text-shadow-button-default, var(--text-shadow-2xs))'
      )

      const hoverLight = hoverBackgroundValue('base', 'light', 'light')
      const hoverDark = hoverBackgroundValue('base', 'light', 'dark')
      ensureHover(
        hoverLight.backgroundColor,
        hoverDark.backgroundColor,
        styles.get('--button-text') ?? baseLight.textColor,
        styles.get('--button-text-dark') ?? baseDark.textColor
      )
      break
    }

    case 'text': {
      styles.set('--button-bg', 'transparent')
      styles.set('--button-bg-dark', 'transparent')
      styles.set('--button-text', textColorValue(color, 'light'))
      styles.set('--button-text-dark', textColorValue(color, 'dark'))
      if (!disabled) {
        styles.set('--button-hover-decoration', 'underline')
      }
      break
    }
  }

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

export function Button(
  {
    type = 'button',
    disabled,
    loading,
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'sm',
    onClick = () => {},
  }: ButtonOptions,
  ...children: TNode[]
) {
  const buttonSize = prop<null | Rect>(null)
  return Use(BeatUII18n, t =>
    html.button(
      attr.type(type as Value<string>),
      attr.disabled(
        computedOf(
          disabled,
          loading
        )((disabled, loading) => disabled || loading)
      ),
      // Add ARIA attributes for accessibility
      aria.busy(loading ?? false),
      When(loading ?? false, () => aria.label(t.$.loadingExtended)),
      attr.class(
        computedOf(
          size,
          roundedness,
          loading
        )((size, roundedness, loading) =>
          generateButtonClasses(size ?? 'md', roundedness ?? 'sm', loading)
        )
      ),
      attr.style(
        computedOf(
          variant,
          color,
          disabled
        )((variant, color, disabled) =>
          generateButtonStyles(
            variant ?? 'filled',
            (color ?? 'base') as ExtendedColor,
            disabled
          )
        )
      ),
      When(
        loading ?? false,
        () =>
          Fragment(
            style.width(
              buttonSize.map(rect => {
                if (rect == null) return ''
                return `${rect.width}px`
              })
            ),
            style.height(
              buttonSize.map(rect => {
                if (rect == null) return ''
                return `${rect.height}px`
              })
            ),
            Icon({ icon: 'line-md:loading-twotone-loop', size: size ?? 'md' }),
            // Hidden live region for screen reader announcements
            html.span(
              attr.class('sr-only'),
              aria.live('polite'),
              t.$.loadingExtended
            )
          ),
        () => Fragment(on.click(onClick), ...children)
      ),
      When(loading != null, () =>
        ElementRect(rect =>
          OnDispose(
            rect.on(r => {
              if (Value.get(loading ?? false)) return
              buttonSize.set(r)
            })
          )
        )
      )
    )
  )
}
