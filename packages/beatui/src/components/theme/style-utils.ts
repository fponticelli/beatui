import { backgroundConfig, getColorVar, ThemeColorName } from '@/tokens/colors'
import type { ColorShade } from '@/tokens/colors'

export type ExtendedColor = ThemeColorName | 'white' | 'black' | 'transparent'
export type Mode = 'light' | 'dark'
export type BackgroundVariant = 'solid' | 'light' | 'soft' | 'lighter'
export type ForegroundTone = 'solid' | 'soft'

const {
  variants: backgroundVariants,
  special: backgroundSpecial,
  overrides: backgroundOverrides,
} = backgroundConfig

function resolveShade(color: ExtendedColor, shade: ColorShade): string {
  switch (color) {
    case 'white':
      return 'var(--color-white)'
    case 'black':
      return 'var(--color-black)'
    case 'transparent':
      return 'transparent'
    default:
      return getColorVar(color as ThemeColorName, shade)
  }
}

function resolveSpecial(color: ExtendedColor, mode: Mode) {
  const special = backgroundSpecial[color as keyof typeof backgroundSpecial]
  if (!special) return undefined

  if (mode === 'light') {
    return special
  }

  const override = backgroundOverrides[color as keyof typeof backgroundOverrides]
  return override ? override[mode] : special
}

export function backgroundValue(
  color: ExtendedColor,
  variant: BackgroundVariant,
  mode: Mode
): { backgroundColor: string; textColor: string } {
  const override = backgroundOverrides[color as keyof typeof backgroundOverrides]
  if (override) {
    const entry = override[mode]
    if (entry) {
      return { backgroundColor: entry.backgroundColor, textColor: entry.color }
    }
  }

  if (variant === 'solid') {
    const special = resolveSpecial(color, mode)
    if (special) {
      return {
        backgroundColor: special.backgroundColor,
        textColor: special.color,
      }
    }
  }

  const variantConfig = backgroundVariants[variant][mode]
  return {
    backgroundColor: resolveShade(color, variantConfig.bgShade as ColorShade),
    textColor: variantConfig.textColor,
  }
}

const hoverSolid = {
  light: { shade: 600 as ColorShade, textColor: 'var(--color-white)' },
  dark: { shade: 600 as ColorShade, textColor: 'var(--text-inverted-dark)' },
} as const

const hoverLight = {
  light: { shade: 300 as ColorShade, textColor: 'var(--text-normal-light)' },
  dark: { shade: 700 as ColorShade, textColor: 'var(--text-normal-dark)' },
} as const

const hoverSoft = {
  light: { shade: 400 as ColorShade, textColor: 'var(--text-normal-light)' },
  dark: { shade: 600 as ColorShade, textColor: 'var(--text-normal-dark)' },
} as const

export function hoverBackgroundValue(
  color: ExtendedColor,
  variant: 'solid' | 'light' | 'soft',
  mode: Mode
): { backgroundColor: string; textColor: string } {
  const override = backgroundOverrides[color as keyof typeof backgroundOverrides]
  if (override) {
    const entry = override[mode]
    if (entry) {
      return { backgroundColor: entry.backgroundColor, textColor: entry.color }
    }
  }

  if (variant === 'solid') {
    const special = resolveSpecial(color, mode)
    if (special) {
      return {
        backgroundColor: special.backgroundColor,
        textColor: special.color,
      }
    }
    const config = hoverSolid[mode]
    return {
      backgroundColor: resolveShade(color, config.shade),
      textColor: config.textColor,
    }
  }

  const config = variant === 'light' ? hoverLight[mode] : hoverSoft[mode]
  return {
    backgroundColor: resolveShade(color, config.shade),
    textColor: config.textColor,
  }
}

export function borderColorValue(color: ExtendedColor, mode: Mode): string {
  const shade: ColorShade = mode === 'light' ? 500 : 600
  switch (color) {
    case 'white':
      return mode === 'light'
        ? 'var(--text-inverse-light)'
        : 'var(--text-inverted-dark)'
    case 'black':
      return 'var(--color-black)'
    case 'transparent':
      return 'transparent'
    default:
      return resolveShade(color as ThemeColorName, shade)
  }
}

export function textColorValue(color: ExtendedColor, mode: Mode): string {
  if (color === 'white') return 'var(--color-white)'
  if (color === 'black') return 'var(--color-black)'
  if (color === 'transparent') return 'inherit'

  const shade: ColorShade = mode === 'light' ? 800 : 200
  return resolveShade(color, shade)
}

export function foregroundColorValue(
  color: ThemeColorName,
  tone: ForegroundTone,
  mode: Mode
): string {
  if (tone === 'soft') {
    const shade: ColorShade = mode === 'light' ? 300 : 700
    return resolveShade(color, shade)
  }

  const shade: ColorShade = mode === 'light' ? 500 : 600
  return resolveShade(color, shade)
}
