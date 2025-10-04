import { objectEntries } from '@tempots/std'
import { colors } from './base-colors'

export type ColorName = keyof typeof colors

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

export const colorShades = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as ColorShade[]

export type SemanticColorName =
  | 'primary'
  | 'secondary'
  | 'base'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export type ThemeColorName = ColorName | SemanticColorName

export const semanticColorNames = [
  'primary',
  'secondary',
  'base',
  'success',
  'warning',
  'error',
  'info',
] as const

export const themeColorNames = [
  ...semanticColorNames,
  ...objectEntries(colors).map(([colorName]) => colorName),
]

export const semanticColors = {
  primary: 'blue',
  secondary: 'gray',
  base: 'gray',
  success: 'green',
  warning: 'amber',
  error: 'red',
  info: 'blue',
} as Record<SemanticColorName, ColorName>

export type SemanticColorOverrides = Partial<
  Record<SemanticColorName, ThemeColorName>
>

export function resolveSemanticColorMap(overrides?: SemanticColorOverrides) {
  return { ...semanticColors, ...overrides }
}

export type BackgroundColorName =
  | 'background'
  | 'surface'
  | 'subtle'
  | 'elevated'
  | 'raised'
  | 'overlay'

// Background colors
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

export type TextColorName = 'normal' | 'muted' | 'inverted'

export const textColors = {
  light: {
    normal: ['base', 900],
    muted: ['base', 600],
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

export type BorderColorName = 'border' | 'divider' | 'inverted'

export const borderColors = {
  light: {
    border: ['base', 200],
    divider: ['base', 300],
    inverted: ['base', 100],
  },
  dark: {
    border: ['base', 700],
    divider: ['base', 600],
    inverted: ['base', 900],
  },
} as {
  light: Record<BorderColorName, [ThemeColorName, ColorShade]>
  dark: Record<BorderColorName, [ThemeColorName, ColorShade]>
}

// Interactive colors for focus, hover, and active states
export type InteractiveColorName = 'focus' | 'hover' | 'active'

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

// Helper function to get color CSS variable
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

export function getColorVarName(
  color: ThemeColorName,
  shade: ColorShade
): `--color-${ThemeColorName}-${ColorShade}` {
  return `--color-${color}-${shade}`
}

export function getColorVar(color: ThemeColorName, shade: ColorShade) {
  return `var(${getColorVarName(color, shade)})`
}

// Background utility configuration
export type BackgroundVariant = 'solid' | 'soft' | 'light' | 'lighter'

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
      light: { bgShade: 500, textColor: 'var(--color-white)' },
      dark: { bgShade: 600, textColor: 'var(--color-black)' },
    },
    soft: {
      light: { bgShade: 300, textColor: 'var(--text-normal-light)' },
      dark: { bgShade: 700, textColor: 'var(--text-normal-dark)' },
    },
    light: {
      light: { bgShade: 200, textColor: 'var(--text-normal-light)' },
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

// Generate background utility CSS
// Generate foreground (text color) utility CSS
// Generate CSS variables from color tokens
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

export function generateColorVariables(): Record<string, string> {
  return {
    ...generateCoreColorVariables(),
    ...generateSemanticColorVariables(),
  }
}
