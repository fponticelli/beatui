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
import { controlFontSize } from '../theme/font-size'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'
import { Icon } from '../data/icon'
import { ElementRect, Rect } from '@tempots/ui'
import { BeatUII18n } from '@/beatui-i18n'
import {
  backgroundPalette,
  borderPalette,
  colorShade,
  textTonePalette,
} from '@/utils/color-style'

export type SupportedButtonColor = ThemeColorName | 'white' | 'black'

type ModeStyles = {
  bg: string
  text: string
  border: string
  hoverBg: string
  hoverBorder: string
  activeBg: string
  activeBorder: string
  hoverDecoration?: string
}

type ButtonPalette = {
  light: ModeStyles
  dark: ModeStyles
}

const RADIUS_MAP: Record<RadiusName, string> = {
  none: 'var(--radius-none)',
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
}

const DISABLED_LIGHT = {
  bg: 'var(--bg-subtle-light)',
  text: 'var(--text-muted-light)',
  border: 'var(--border-divider-light)',
}

const DISABLED_DARK = {
  bg: 'var(--bg-subtle-dark)',
  text: 'var(--text-muted-dark)',
  border: 'var(--border-divider-dark)',
}

function filledPalette(color: SupportedButtonColor): ButtonPalette {
  const lightBase =
    color === 'white' ? 'var(--color-white)' : colorShade(color, 500)
  const lightHover =
    color === 'white' ? 'var(--color-base-100)' : colorShade(color, 600)
  const lightActive =
    color === 'white' ? 'var(--color-base-200)' : colorShade(color, 700)

  const darkBase =
    color === 'white' ? 'var(--color-base-200)' : colorShade(color, 600)
  const darkHover =
    color === 'white' ? 'var(--color-base-300)' : colorShade(color, 500)
  const darkActive =
    color === 'white' ? 'var(--color-base-400)' : colorShade(color, 400)

  return {
    light: {
      bg: lightBase,
      text: color === 'white' ? 'var(--color-base-900)' : 'var(--color-white)',
      border: 'transparent',
      hoverBg: lightHover,
      hoverBorder: 'transparent',
      activeBg: lightActive,
      activeBorder: 'transparent',
    },
    dark: {
      bg: darkBase,
      text: color === 'white' ? 'var(--color-black)' : 'var(--color-white)',
      border: 'transparent',
      hoverBg: darkHover,
      hoverBorder: 'transparent',
      activeBg: darkActive,
      activeBorder: 'transparent',
    },
  }
}

function lightPalette(color: SupportedButtonColor): ButtonPalette {
  const base = backgroundPalette(color, 'light')
  const hoverShade =
    color === 'white' ? 'var(--color-base-100)' : colorShade(color, 300)
  const activeShade =
    color === 'white' ? 'var(--color-base-200)' : colorShade(color, 400)
  const darkHover =
    color === 'white' ? 'var(--color-base-300)' : colorShade(color, 700)
  const darkActive =
    color === 'white' ? 'var(--color-base-400)' : colorShade(color, 600)

  return {
    light: {
      bg: base.light.backgroundColor,
      text: base.light.textColor,
      border: 'transparent',
      hoverBg: hoverShade,
      hoverBorder: 'transparent',
      activeBg: activeShade,
      activeBorder: 'transparent',
    },
    dark: {
      bg: base.dark.backgroundColor,
      text: base.dark.textColor,
      border: 'transparent',
      hoverBg: darkHover,
      hoverBorder: 'transparent',
      activeBg: darkActive,
      activeBorder: 'transparent',
    },
  }
}

function outlinePalette(color: SupportedButtonColor): ButtonPalette {
  const border = borderPalette(color)
  const textPalette = textTonePalette(color, 700, 300)
  const hoverBackground = backgroundPalette(color, 'light')

  return {
    light: {
      bg: 'transparent',
      text: textPalette.light,
      border: border.light,
      hoverBg: hoverBackground.light.backgroundColor,
      hoverBorder: border.light,
      activeBg: hoverBackground.light.backgroundColor,
      activeBorder: border.light,
    },
    dark: {
      bg: 'transparent',
      text: textPalette.dark,
      border: border.dark,
      hoverBg: hoverBackground.dark.backgroundColor,
      hoverBorder: border.dark,
      activeBg: hoverBackground.dark.backgroundColor,
      activeBorder: border.dark,
    },
  }
}

function defaultPalette(color: SupportedButtonColor): ButtonPalette {
  const neutral = backgroundPalette('surface', 'light')
  const textPalette = textTonePalette(color, 800, 200)
  return {
    light: {
      bg: neutral.light.backgroundColor,
      text: textPalette.light,
      border: 'transparent',
      hoverBg: 'var(--color-base-200)',
      hoverBorder: 'transparent',
      activeBg: 'var(--color-base-300)',
      activeBorder: 'transparent',
    },
    dark: {
      bg: 'var(--color-base-800)',
      text: textPalette.dark,
      border: 'transparent',
      hoverBg: 'var(--color-base-700)',
      hoverBorder: 'transparent',
      activeBg: 'var(--color-base-600)',
      activeBorder: 'transparent',
    },
  }
}

function textPalette(color: SupportedButtonColor): ButtonPalette {
  const textColor = textTonePalette(color, 700, 300)
  return {
    light: {
      bg: 'transparent',
      text: textColor.light,
      border: 'transparent',
      hoverBg: 'transparent',
      hoverBorder: 'transparent',
      activeBg: 'transparent',
      activeBorder: 'transparent',
      hoverDecoration: 'underline',
    },
    dark: {
      bg: 'transparent',
      text: textColor.dark,
      border: 'transparent',
      hoverBg: 'transparent',
      hoverBorder: 'transparent',
      activeBg: 'transparent',
      activeBorder: 'transparent',
      hoverDecoration: 'underline',
    },
  }
}

function resolvePalette(
  variant: ButtonVariant,
  color: SupportedButtonColor
): ButtonPalette {
  switch (variant) {
    case 'filled':
      return filledPalette(color)
    case 'light':
      return lightPalette(color)
    case 'outline':
      return outlinePalette(color)
    case 'default':
      return defaultPalette(color)
    case 'text':
      return textPalette(color)
    default:
      return filledPalette(color)
  }
}

function paletteToStyle(palette: ButtonPalette): string {
  const entries: Array<[string, string]> = [
    ['--button-bg', palette.light.bg],
    ['--button-text', palette.light.text],
    ['--button-border', palette.light.border],
    ['--button-hover-bg', palette.light.hoverBg],
    ['--button-hover-border', palette.light.hoverBorder],
    ['--button-active-bg', palette.light.activeBg],
    ['--button-active-border', palette.light.activeBorder],
    ['--button-hover-decoration', palette.light.hoverDecoration ?? 'none'],
    ['--button-disabled-bg', DISABLED_LIGHT.bg],
    ['--button-disabled-text', DISABLED_LIGHT.text],
    ['--button-disabled-border', DISABLED_LIGHT.border],
    ['--button-bg-dark', palette.dark.bg],
    ['--button-text-dark', palette.dark.text],
    ['--button-border-dark', palette.dark.border],
    ['--button-hover-bg-dark', palette.dark.hoverBg],
    ['--button-hover-border-dark', palette.dark.hoverBorder],
    ['--button-active-bg-dark', palette.dark.activeBg],
    ['--button-active-border-dark', palette.dark.activeBorder],
    ['--button-hover-decoration-dark', palette.dark.hoverDecoration ?? 'none'],
    ['--button-disabled-bg-dark', DISABLED_DARK.bg],
    ['--button-disabled-text-dark', DISABLED_DARK.text],
    ['--button-disabled-border-dark', DISABLED_DARK.border],
  ]

  return entries.map(([property, value]) => `${property}: ${value}`).join('; ')
}

export function normalizeButtonColor(
  value: ThemeColorName | 'black' | 'white' | undefined
): SupportedButtonColor {
  if (value === 'white' || value === 'black') return value
  return (value ?? 'base') as ThemeColorName
}

export function buttonClasses(
  variant: ButtonVariant,
  size: ControlSize,
  options?: { loading?: boolean; disabled?: boolean }
): string {
  const classes = [
    'bc-button',
    `bc-button--${variant}`,
    `bc-control--padding-${size}`,
  ]

  if (options?.loading) {
    classes.push('bc-button--loading')
  }

  if (options?.disabled) {
    classes.push('bc-button--disabled')
  }

  return classes.join(' ')
}

export function buttonFontSize(size: ControlSize): string {
  return controlFontSize(size)
}

export function buttonRadius(roundedness: RadiusName): string {
  return RADIUS_MAP[roundedness]
}

export function buttonStyle(
  variant: ButtonVariant,
  color: SupportedButtonColor
): string {
  return paletteToStyle(resolvePalette(variant, color))
}

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
          variant,
          size,
          loading,
          disabled
        )((variantValue, sizeValue, loadingValue, disabledValue) =>
          buttonClasses(variantValue ?? 'filled', sizeValue ?? 'md', {
            loading: loadingValue ?? false,
            disabled: disabledValue ?? false,
          })
        )
      ),
      style.fontSize(
        computedOf(size)(sizeValue => buttonFontSize(sizeValue ?? 'md'))
      ),
      style.borderRadius(
        computedOf(roundedness)(radiusValue =>
          buttonRadius(radiusValue ?? 'sm')
        )
      ),
      attr.style(
        computedOf(
          variant,
          color
        )((variantValue, colorValue) =>
          buttonStyle(
            variantValue ?? 'filled',
            normalizeButtonColor(colorValue)
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
