/**
 * Color design tokens for BeatUI.
 *
 * Defines the complete color system including base color shades, semantic color
 * mappings, background/text/border/interactive theme colors, and CSS variable
 * generation utilities. Colors follow a shade scale from 50 (lightest) to 950
 * (darkest) and support light/dark theme modes.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'
import { colors } from './base-colors'

/**
 * Union type of all available base color names derived from the color palette.
 *
 * @example
 * ```ts
 * const color: ColorName = 'blue'
 * ```
 */
export type ColorName = keyof typeof colors

/**
 * Union type representing the available shade levels in the color scale.
 * Ranges from 50 (lightest) to 950 (darkest).
 */
export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950

/**
 * Array of all available color shade values, ordered from lightest to darkest.
 *
 * @example
 * ```ts
 * colorShades.forEach(shade => {
 *   console.log(`--color-blue-${shade}`)
 * })
 * ```
 */
export const colorShades = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as ColorShade[]

/**
 * Union type of semantic color role names used throughout the theme system.
 * Semantic colors map to base color names and can be overridden per-theme.
 */
export type SemanticColorName =
  | 'primary'
  | 'secondary'
  | 'base'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

/**
 * Union type of all theme-aware color names, including base colors,
 * semantic colors, and the special 'black' and 'white' values.
 */
export type ThemeColorName = ColorName | SemanticColorName | 'black' | 'white'

/**
 * Tuple of all semantic color names, used for iteration and validation.
 */
export const semanticColorNames = [
  'primary',
  'secondary',
  'base',
  'success',
  'warning',
  'danger',
  'info',
] as const

/**
 * Array of all available theme color names, combining semantic colors,
 * base palette colors, and the special 'black' and 'white' values.
 *
 * @example
 * ```ts
 * themeColorNames.forEach(name => {
 *   console.log(name) // 'primary', 'blue', 'red', 'black', etc.
 * })
 * ```
 */
export const themeColorNames: ThemeColorName[] = [
  ...semanticColorNames,
  ...objectEntries(colors).map(([colorName]) => colorName),
  'black',
  'white',
]

/**
 * Default mapping from semantic color names to base color names.
 *
 * @default
 * ```
 * primary   -> 'blue'
 * secondary -> 'gray'
 * base      -> 'gray'
 * success   -> 'green'
 * warning   -> 'amber'
 * danger    -> 'red'
 * info      -> 'blue'
 * ```
 */
export const semanticColors = {
  primary: 'blue',
  secondary: 'gray',
  base: 'gray',
  success: 'green',
  warning: 'amber',
  danger: 'red',
  info: 'blue',
} as Record<SemanticColorName, ColorName>

/**
 * Partial record for overriding default semantic-to-base color mappings.
 *
 * @example
 * ```ts
 * const overrides: SemanticColorOverrides = { primary: 'indigo', danger: 'rose' }
 * ```
 */
export type SemanticColorOverrides = Partial<
  Record<SemanticColorName, ThemeColorName>
>

/**
 * Resolves the full semantic color map by merging defaults with any provided overrides.
 *
 * @param overrides - Optional partial overrides for semantic color mappings
 * @returns A complete mapping of semantic color names to their resolved color names
 *
 * @example
 * ```ts
 * const map = resolveSemanticColorMap({ primary: 'indigo' })
 * // map.primary === 'indigo', map.secondary === 'gray', etc.
 * ```
 */
export function resolveSemanticColorMap(overrides?: SemanticColorOverrides) {
  return { ...semanticColors, ...overrides }
}

/**
 * Union type of background color role names used in the theme system.
 * Each role represents a different surface elevation level.
 */
export type BackgroundColorName =
  | 'background'
  | 'surface'
  | 'subtle'
  | 'elevated'
  | 'raised'
  | 'overlay'

/**
 * Background color definitions for light and dark theme modes.
 * Each entry maps a background role to a `[ThemeColorName, ColorShade]` tuple.
 */
export const bgColors = {
  light: {
    background: ['base', 50],
    surface: ['base', 100],
    subtle: ['base', 200],
    elevated: ['base', 300],
    raised: ['base', 400],
    overlay: ['base', 500],
  },
  dark: {
    background: ['base', 950],
    surface: ['base', 900],
    subtle: ['base', 800],
    elevated: ['base', 700],
    raised: ['base', 600],
    overlay: ['base', 500],
  },
} as {
  light: Record<BackgroundColorName, [ThemeColorName, ColorShade]>
  dark: Record<BackgroundColorName, [ThemeColorName, ColorShade]>
}

/**
 * Union type of text color role names used in the theme system.
 */
export type TextColorName = 'normal' | 'muted' | 'inverted'

/**
 * Text color definitions for light and dark theme modes.
 * Each entry maps a text role to a `[ThemeColorName, ColorShade]` tuple.
 */
export const textColors = {
  light: {
    normal: ['base', 900],
    muted: ['base', 500],
    inverted: ['base', 100],
  },
  dark: {
    normal: ['base', 100],
    muted: ['base', 400],
    inverted: ['base', 900],
  },
} as {
  light: Record<TextColorName, [ThemeColorName, ColorShade]>
  dark: Record<TextColorName, [ThemeColorName, ColorShade]>
}

/**
 * Union type of border color role names used in the theme system.
 */
export type BorderColorName =
  | 'subtle'
  | 'muted'
  | 'border'
  | 'divider'
  | 'input'
  | 'strong'
  | 'inverted'

/**
 * Border color definitions for light and dark theme modes.
 * Each entry maps a border role to a `[ThemeColorName, ColorShade]` tuple.
 */
export const borderColors = {
  light: {
    subtle: ['base', 100],
    muted: ['base', 200],
    border: ['base', 200],
    divider: ['base', 300],
    input: ['base', 300],
    strong: ['base', 400],
    inverted: ['base', 100],
  },
  dark: {
    subtle: ['base', 800],
    muted: ['base', 700],
    border: ['base', 700],
    divider: ['base', 600],
    input: ['base', 600],
    strong: ['base', 500],
    inverted: ['base', 900],
  },
} as {
  light: Record<BorderColorName, [ThemeColorName, ColorShade]>
  dark: Record<BorderColorName, [ThemeColorName, ColorShade]>
}

/**
 * Union type of interactive color role names for focus, hover, and active states.
 */
export type InteractiveColorName = 'focus' | 'hover' | 'active'

/**
 * Interactive color definitions for light and dark theme modes.
 * Used for focus rings, hover backgrounds, and active state backgrounds.
 */
export const interactiveColors = {
  light: {
    focus: ['primary', 700],
    hover: ['base', 100],
    active: ['base', 200],
  },
  dark: {
    focus: ['primary', 300],
    hover: ['base', 800],
    active: ['base', 700],
  },
} as {
  light: Record<InteractiveColorName, [ThemeColorName, ColorShade]>
  dark: Record<InteractiveColorName, [ThemeColorName, ColorShade]>
}

/**
 * Resolves a theme color name to its underlying base color name.
 * If the color is a semantic name (e.g., 'primary'), it is resolved through the
 * semantic color map (with optional overrides). Otherwise, the color name is returned as-is.
 *
 * @param color - The theme color name to normalize
 * @param overrides - Optional semantic color overrides
 * @returns The resolved base color name
 *
 * @example
 * ```ts
 * normalizeColorName('primary') // 'blue'
 * normalizeColorName('primary', { primary: 'indigo' }) // 'indigo'
 * normalizeColorName('red') // 'red'
 * ```
 */
export function normalizeColorName(
  color: ThemeColorName,
  overrides?: SemanticColorOverrides
) {
  const map = resolveSemanticColorMap(overrides)
  if (semanticColorNames.includes(color as SemanticColorName)) {
    return map[color as SemanticColorName] as ColorName
  }
  return color
}

/**
 * Returns the CSS custom property name for a given color and shade.
 *
 * @param color - The theme color name
 * @param shade - The shade level
 * @returns The CSS variable name (e.g., `'--color-blue-500'`, `'--color-white'`)
 *
 * @example
 * ```ts
 * getColorVarName('blue', 500) // '--color-blue-500'
 * getColorVarName('white', 500) // '--color-white'
 * ```
 */
export function getColorVarName(
  color: ThemeColorName,
  shade: ColorShade
):
  | `--color-${ThemeColorName}-${ColorShade}`
  | '--color-white'
  | '--color-black' {
  if (color === 'white') return '--color-white'
  if (color === 'black') return '--color-black'
  return `--color-${color}-${shade}`
}

/**
 * Returns a CSS `var()` expression referencing the color custom property.
 *
 * @param color - The theme color name
 * @param shade - The shade level
 * @returns A CSS `var()` string (e.g., `'var(--color-blue-500)'`)
 *
 * @example
 * ```ts
 * getColorVar('blue', 500) // 'var(--color-blue-500)'
 * ```
 */
export function getColorVar(color: ThemeColorName, shade: ColorShade) {
  return `var(${getColorVarName(color, shade)})`
}

/**
 * Union type of background variant styles used for component backgrounds.
 * Controls the shade intensity applied to colored backgrounds.
 */
export type BackgroundVariant = 'solid' | 'soft' | 'light' | 'lighter'

/**
 * Configuration object for background utility CSS generation.
 * Contains special color overrides, standard variant shade mappings for
 * light/dark modes, and color-specific overrides for 'white', 'black',
 * and 'transparent'.
 */
export const backgroundConfig = {
  // Special colors that don't follow the standard pattern
  special: {
    inherit: {
      backgroundColor: 'inherit',
      color: 'inherit',
    },
    white: {
      backgroundColor: 'var(--color-white)',
      color: 'var(--color-base-900)',
    },
    black: {
      backgroundColor: 'black',
      color: 'var(--color-white)',
    },
    transparent: {
      backgroundColor: 'transparent',
      color: 'inherit',
    },
  },
  // Standard color variants with their shades and text colors
  variants: {
    solid: {
      light: { bgShade: 600, textColor: 'var(--color-white)' },
      dark: { bgShade: 400, textColor: 'var(--color-black)' },
    },
    soft: {
      light: { bgShade: 300, textColor: 'var(--text-normal-light)' },
      dark: { bgShade: 700, textColor: 'var(--text-normal-dark)' },
    },
    light: {
      light: { bgShade: 100, textColor: 'var(--text-normal-light)' },
      dark: { bgShade: 800, textColor: 'var(--text-normal-dark)' },
    },
    lighter: {
      light: { bgShade: 100, textColor: 'var(--text-normal-light)' },
      dark: { bgShade: 900, textColor: 'var(--text-normal-dark)' },
    },
  },
  // Special overrides for specific colors
  overrides: {
    white: {
      light: {
        backgroundColor: 'var(--color-white)',
        color: 'var(--color-base-900)',
      },
      dark: {
        backgroundColor: 'var(--color-black)',
        color: 'var(--color-base-100)',
      },
    },
    black: {
      light: {
        backgroundColor: 'black',
        color: 'var(--color-white)',
      },
      dark: {
        backgroundColor: 'black',
        color: 'var(--color-white)',
      },
    },
    transparent: {
      light: {
        backgroundColor: 'transparent',
        color: 'inherit',
      },
      dark: {
        backgroundColor: 'transparent',
        color: 'inherit',
      },
    },
  },
} as const

/**
 * Generates CSS custom property declarations for all core (base) color tokens.
 * Includes `--color-white`, `--color-black`, `--color-inherit`, and all
 * base palette colors at every shade level.
 *
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateCoreColorVariables()
 * // vars['--color-blue-500'] === 'oklch(0.623 0.214 259.815)'
 * // vars['--color-white'] === 'white'
 * ```
 */
export function generateCoreColorVariables(): Record<string, string> {
  const variables = {} as Record<string, string>

  variables['--color-white'] = 'white'
  variables['--color-black'] = 'black'
  variables['--color-inherit'] = 'inherit'

  // base colors
  objectEntries(colors).forEach(([colorName, shades]) => {
    objectEntries(shades).forEach(([shade, value]) => {
      variables[getColorVarName(colorName, shade)] = value
    })
  })

  return variables
}

/**
 * Generates CSS custom property declarations for semantic colors, background
 * colors, text colors, border colors, and interactive colors. Semantic colors
 * reference base color variables so themes can be changed by swapping the
 * semantic mapping.
 *
 * @param overrides - Optional overrides for semantic color mappings
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticColorVariables({ primary: 'indigo' })
 * // vars['--color-primary-500'] === 'var(--color-indigo-500)'
 * ```
 */
export function generateSemanticColorVariables(
  overrides?: SemanticColorOverrides
): Record<string, string> {
  const variables = {} as Record<string, string>
  const semanticMap = resolveSemanticColorMap(overrides)

  // semantic colors
  semanticColorNames.forEach(colorName => {
    const baseColor = normalizeColorName(semanticMap[colorName], overrides)
    colorShades.forEach(shade => {
      variables[getColorVarName(colorName, shade)] = getColorVar(
        baseColor,
        shade
      )
    })
  })

  // background colors
  objectEntries(bgColors).forEach(([mode, colors]) => {
    objectEntries(colors).forEach(([bgName, [baseColor, shade]]) => {
      variables[`--bg-${bgName}-${mode}`] = getColorVar(baseColor, shade)
    })
  })

  // text colors
  objectEntries(textColors).forEach(([mode, colors]) => {
    objectEntries(colors).forEach(([textName, [baseColor, shade]]) => {
      variables[`--text-${textName}-${mode}`] = getColorVar(baseColor, shade)
    })
  })

  // border colors
  objectEntries(borderColors).forEach(([mode, colors]) => {
    objectEntries(colors).forEach(([borderName, [baseColor, shade]]) => {
      variables[`--border-${borderName}-${mode}`] = getColorVar(
        baseColor,
        shade
      )
    })
  })

  // interactive colors
  objectEntries(interactiveColors).forEach(([mode, colors]) => {
    objectEntries(colors).forEach(([interactiveName, [baseColor, shade]]) => {
      variables[`--interactive-${interactiveName}-${mode}`] = getColorVar(
        baseColor,
        shade
      )
    })
  })

  return variables
}

/**
 * Generates the complete set of CSS custom property declarations for all color tokens,
 * combining both core color variables and semantic color variables.
 *
 * @returns A record mapping all color CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateColorVariables()
 * // Contains both base colors and semantic mappings
 * ```
 */
export function generateColorVariables(): Record<string, string> {
  return {
    ...generateCoreColorVariables(),
    ...generateSemanticColorVariables(),
  }
}
