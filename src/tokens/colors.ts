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

export type AnyColorName = ColorName | SemanticColorName

export const semanticColorNames = [
  'primary',
  'secondary',
  'base',
  'success',
  'warning',
  'error',
  'info',
] as const

export const semanticColors = {
  primary: 'blue',
  secondary: 'gray',
  base: 'gray',
  success: 'green',
  warning: 'amber',
  error: 'red',
  info: 'blue',
} as Record<SemanticColorName, ColorName>

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
  light: Record<BackgroundColorName, [AnyColorName, ColorShade]>
  dark: Record<BackgroundColorName, [AnyColorName, ColorShade]>
}

export type TextColorName = 'text' | 'muted'

export const textColors = {
  light: {
    text: ['base', 900],
    muted: ['base', 600],
  },
  dark: {
    text: ['base', 100],
    muted: ['base', 400],
  },
} as {
  light: Record<TextColorName, [AnyColorName, ColorShade]>
  dark: Record<TextColorName, [AnyColorName, ColorShade]>
}

export type BorderColorName = 'border' | 'divider'

export const borderColors = {
  light: {
    border: ['base', 200],
    divider: ['base', 300],
  },
  dark: {
    border: ['base', 700],
    divider: ['base', 600],
  },
} as {
  light: Record<BorderColorName, [AnyColorName, ColorShade]>
  dark: Record<BorderColorName, [AnyColorName, ColorShade]>
}

// Helper function to get color CSS variable
export function normalizeColorName(color: AnyColorName) {
  if (semanticColorNames.includes(color as SemanticColorName)) {
    return semanticColors[color as SemanticColorName]
  }
  return color
}

export function getColorVarName(
  color: AnyColorName,
  shade: ColorShade
): `--color-${AnyColorName}-${ColorShade}` {
  return `--color-${color}-${shade}`
}

export function getColorVar(color: AnyColorName, shade: ColorShade) {
  return `var(${getColorVarName(color, shade)})`
}

// Generate CSS variables from color tokens
export function generateColorVariables(): Record<string, string> {
  const variables = {} as Record<string, string>

  // base colors
  objectEntries(colors).forEach(([colorName, shades]) => {
    objectEntries(shades).forEach(([shade, value]) => {
      variables[getColorVarName(colorName, shade)] = value
    })
  })

  // semantic colors
  semanticColorNames.forEach(colorName => {
    const baseColor = semanticColors[colorName]
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

  return variables
}
