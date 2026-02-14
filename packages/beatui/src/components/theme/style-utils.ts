import {
  backgroundConfig,
  getColorVar,
  ThemeColorName,
} from '../../tokens/colors'
import type { ColorShade } from '../../tokens/colors'

/**
 * Extended color type that includes theme colors and the special `'transparent'` value.
 */
export type ExtendedColor = ThemeColorName | 'transparent'

/**
 * Theme appearance mode.
 * Either `'light'` or `'dark'`.
 */
export type Mode = 'light' | 'dark'

/**
 * Background style variant.
 * - `'solid'`: Full-intensity solid background
 * - `'light'`: Light, subtle background
 * - `'soft'`: Medium-intensity background
 * - `'lighter'`: Very subtle background
 */
export type BackgroundVariant = 'solid' | 'light' | 'soft' | 'lighter'

/**
 * Foreground color tone for text and icons.
 * - `'solid'`: High-contrast, vibrant color
 * - `'soft'`: Lower-contrast, muted color
 */
export type ForegroundTone = 'solid' | 'soft'

const {
  variants: backgroundVariants,
  special: backgroundSpecial,
  overrides: backgroundOverrides,
} = backgroundConfig

/**
 * Resolves a color and shade into a CSS variable or literal value.
 * Handles special cases like `'white'`, `'black'`, and `'transparent'`.
 *
 * @param color - The color name
 * @param shade - The color shade (e.g., 500, 700)
 * @returns A CSS variable string (e.g., `'var(--color-primary-500)'`) or literal value
 */
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

/**
 * Resolves special background color definitions for a given mode.
 * Checks for mode-specific overrides and falls back to default special values.
 *
 * @param color - The color name
 * @param mode - The theme mode ('light' or 'dark')
 * @returns Special background configuration or `undefined` if not found
 */
function resolveSpecial(color: ExtendedColor, mode: Mode) {
  const special = backgroundSpecial[color as keyof typeof backgroundSpecial]
  if (!special) return undefined

  if (mode === 'light') {
    return special
  }

  const override =
    backgroundOverrides[color as keyof typeof backgroundOverrides]
  return override ? override[mode] : special
}

/**
 * Computes background and text colors for a given color, variant, and theme mode.
 * Applies variant-specific styling (solid, light, soft, lighter) and mode-specific shades.
 *
 * @param color - The theme color name
 * @param variant - The background style variant
 * @param mode - The theme mode ('light' or 'dark')
 * @returns An object containing `backgroundColor` and `textColor` CSS values
 *
 * @example
 * ```ts
 * const { backgroundColor, textColor } = backgroundValue('primary', 'solid', 'light')
 * // Returns: { backgroundColor: 'var(--color-primary-500)', textColor: 'var(--color-white)' }
 * ```
 */
export function backgroundValue(
  color: ExtendedColor,
  variant: BackgroundVariant,
  mode: Mode
): { backgroundColor: string; textColor: string } {
  const override =
    backgroundOverrides[color as keyof typeof backgroundOverrides]
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

/** Hover state configuration for solid variant buttons. */
const hoverSolid = {
  light: { shade: 700 as ColorShade, textColor: 'var(--color-white)' },
  dark: { shade: 500 as ColorShade, textColor: 'var(--text-inverted-dark)' },
} as const

/** Hover state configuration for light variant buttons. */
const hoverLight = {
  light: { shade: 200 as ColorShade, textColor: 'var(--text-normal-light)' },
  dark: { shade: 700 as ColorShade, textColor: 'var(--text-normal-dark)' },
} as const

/** Hover state configuration for soft variant buttons. */
const hoverSoft = {
  light: { shade: 400 as ColorShade, textColor: 'var(--text-normal-light)' },
  dark: { shade: 600 as ColorShade, textColor: 'var(--text-normal-dark)' },
} as const

/**
 * Computes hover state background and text colors for interactive elements.
 * Applies darker/lighter shades depending on the variant and mode.
 *
 * @param color - The theme color name
 * @param variant - The background style variant ('solid', 'light', or 'soft')
 * @param mode - The theme mode ('light' or 'dark')
 * @returns An object containing `backgroundColor` and `textColor` CSS values for hover state
 *
 * @example
 * ```ts
 * const hover = hoverBackgroundValue('primary', 'solid', 'dark')
 * // Returns darker shade for hover effect
 * ```
 */
export function hoverBackgroundValue(
  color: ExtendedColor,
  variant: 'solid' | 'light' | 'soft',
  mode: Mode
): { backgroundColor: string; textColor: string } {
  const override =
    backgroundOverrides[color as keyof typeof backgroundOverrides]
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

/**
 * Computes the border color for a given color and theme mode.
 * Uses medium-intensity shades (500 for light, 600 for dark).
 *
 * @param color - The theme color name
 * @param mode - The theme mode ('light' or 'dark')
 * @returns A CSS color value string
 *
 * @example
 * ```ts
 * const border = borderColorValue('primary', 'light')
 * // Returns 'var(--color-primary-500)'
 * ```
 */
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

/**
 * Computes the text color for a given color and theme mode.
 * Uses high-contrast shades (800 for light, 200 for dark) for readability.
 *
 * @param color - The theme color name
 * @param mode - The theme mode ('light' or 'dark')
 * @returns A CSS color value string
 *
 * @example
 * ```ts
 * const text = textColorValue('primary', 'light')
 * // Returns 'var(--color-primary-800)'
 * ```
 */
export function textColorValue(color: ExtendedColor, mode: Mode): string {
  if (color === 'white') return 'var(--color-white)'
  if (color === 'black') return 'var(--color-black)'
  if (color === 'transparent') return 'inherit'

  const shade: ColorShade = mode === 'light' ? 800 : 200
  return resolveShade(color, shade)
}

/**
 * Computes the foreground color (for icons, accents) with a specified tone.
 * Supports both solid (vibrant) and soft (muted) tones.
 *
 * @param color - The theme color name
 * @param tone - The foreground tone ('solid' for vibrant, 'soft' for muted)
 * @param mode - The theme mode ('light' or 'dark')
 * @returns A CSS color value string
 *
 * @example
 * ```ts
 * const icon = foregroundColorValue('success', 'solid', 'light')
 * // Returns 'var(--color-success-500)'
 *
 * const mutedIcon = foregroundColorValue('success', 'soft', 'light')
 * // Returns 'var(--color-success-300)'
 * ```
 */
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
