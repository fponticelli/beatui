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

// Helper function to get color CSS variable
export function normalizeColorName(color: ThemeColorName) {
  if (semanticColorNames.includes(color as SemanticColorName)) {
    return semanticColors[color as SemanticColorName]
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
export type BackgroundVariant = 'solid' | 'light' | 'lighter'

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
export function generateBackgroundUtilities(): string {
  let css = `/*
 * Background Utilities - Auto-generated from design tokens
 *
 * This file is automatically generated from src/tokens/colors.ts
 * Do not edit this file directly - modify the tokens instead.
 *
 * Generated variants:
 * - .bu-bg--{color} (solid)
 * - .bu-bg--light-{color} (light)
 * - .bu-bg--lighter-{color} (lighter)
 *
 * Each variant includes dark mode overrides with .b-dark prefix.
 */

@layer components {\n`

  // Generate special colors first
  objectEntries(backgroundConfig.special).forEach(([colorName, styles]) => {
    css += `  .bu-bg--${colorName} {\n`
    css += `    background-color: ${styles.backgroundColor};\n`
    css += `    color: ${styles.color};\n`
    css += `  }\n\n`
  })

  // Generate standard color variants
  const allColors = [
    ...semanticColorNames,
    ...objectEntries(colors).map(([name]) => name),
  ]

  // Solid variant (default)
  css += '  /* solid */\n'
  allColors.forEach(colorName => {
    const lightConfig = backgroundConfig.variants.solid.light

    css += `  .bu-bg--${colorName} {\n`
    css += `    background-color: var(--color-${colorName}-${lightConfig.bgShade});\n`
    css += `    color: ${lightConfig.textColor};\n`
    css += `  }\n`
  })

  css += '\n'

  // Dark mode overrides for solid
  allColors.forEach(colorName => {
    const darkConfig = backgroundConfig.variants.solid.dark

    css += `  .b-dark .bu-bg--${colorName} {\n`
    css += `    background-color: var(--color-${colorName}-${darkConfig.bgShade});\n`
    css += `    color: ${darkConfig.textColor};\n`
    css += `  }\n`
  })

  css += '\n'

  // Light variant
  css += '  /* light */\n'

  // Add special colors for light variant
  objectEntries(backgroundConfig.special).forEach(([colorName, styles]) => {
    css += `  .bu-bg--light-${colorName} {\n`
    css += `    background-color: ${styles.backgroundColor};\n`
    css += `    color: ${styles.color};\n`
    css += `  }\n`
  })

  allColors.forEach(colorName => {
    const lightConfig = backgroundConfig.variants.light.light

    // Check for overrides
    const override =
      backgroundConfig.overrides[
        colorName as keyof typeof backgroundConfig.overrides
      ]
    if (override) {
      css += `  .bu-bg--light-${colorName} {\n`
      css += `    background-color: ${override.light.backgroundColor};\n`
      css += `    color: ${override.light.color};\n`
      css += `  }\n`
    } else {
      css += `  .bu-bg--light-${colorName} {\n`
      css += `    background-color: var(--color-${colorName}-${lightConfig.bgShade});\n`
      css += `    color: ${lightConfig.textColor};\n`
      css += `  }\n`
    }
  })

  css += '\n'

  // Dark mode overrides for light variant
  css += '  /* light dark */\n'

  // Add special colors for light variant dark mode
  objectEntries(backgroundConfig.special).forEach(([colorName, styles]) => {
    const override =
      backgroundConfig.overrides[
        colorName as keyof typeof backgroundConfig.overrides
      ]
    if (override) {
      css += `  .b-dark .bu-bg--light-${colorName} {\n`
      css += `    background-color: ${override.dark.backgroundColor};\n`
      css += `    color: ${override.dark.color};\n`
      css += `  }\n`
    } else {
      css += `  .b-dark .bu-bg--light-${colorName} {\n`
      css += `    background-color: ${styles.backgroundColor};\n`
      css += `    color: ${styles.color};\n`
      css += `  }\n`
    }
  })

  allColors.forEach(colorName => {
    const darkConfig = backgroundConfig.variants.light.dark

    // Check for overrides
    const override =
      backgroundConfig.overrides[
        colorName as keyof typeof backgroundConfig.overrides
      ]
    if (override) {
      css += `  .b-dark .bu-bg--light-${colorName} {\n`
      css += `    background-color: ${override.dark.backgroundColor};\n`
      css += `    color: ${override.dark.color};\n`
      css += `  }\n`
    } else {
      css += `  .b-dark .bu-bg--light-${colorName} {\n`
      css += `    background-color: var(--color-${colorName}-${darkConfig.bgShade});\n`
      css += `    color: ${darkConfig.textColor};\n`
      css += `  }\n`
    }
  })

  css += '\n'

  // Lighter variant
  css += '  /* lighter */\n'

  // Add special colors for lighter variant
  objectEntries(backgroundConfig.special).forEach(([colorName, styles]) => {
    css += `  .bu-bg--lighter-${colorName} {\n`
    css += `    background-color: ${styles.backgroundColor};\n`
    css += `    color: ${styles.color};\n`
    css += `  }\n`
  })

  allColors.forEach(colorName => {
    const lightConfig = backgroundConfig.variants.lighter.light

    // Check for overrides
    const override =
      backgroundConfig.overrides[
        colorName as keyof typeof backgroundConfig.overrides
      ]
    if (override) {
      css += `  .bu-bg--lighter-${colorName} {\n`
      css += `    background-color: ${override.light.backgroundColor};\n`
      css += `    color: ${override.light.color};\n`
      css += `  }\n`
    } else {
      css += `  .bu-bg--lighter-${colorName} {\n`
      css += `    background-color: var(--color-${colorName}-${lightConfig.bgShade});\n`
      css += `    color: ${lightConfig.textColor};\n`
      css += `  }\n`
    }
  })

  css += '\n'

  // Dark mode overrides for lighter variant
  css += '  /* light dark */\n'

  // Add special colors for lighter variant dark mode
  objectEntries(backgroundConfig.special).forEach(([colorName, styles]) => {
    const override =
      backgroundConfig.overrides[
        colorName as keyof typeof backgroundConfig.overrides
      ]
    if (override) {
      css += `  .b-dark .bu-bg--lighter-${colorName} {\n`
      css += `    background-color: ${override.dark.backgroundColor};\n`
      css += `    color: ${override.dark.color};\n`
      css += `  }\n`
    } else {
      css += `  .b-dark .bu-bg--lighter-${colorName} {\n`
      css += `    background-color: ${styles.backgroundColor};\n`
      css += `    color: ${styles.color};\n`
      css += `  }\n`
    }
  })

  allColors.forEach(colorName => {
    const darkConfig = backgroundConfig.variants.lighter.dark

    // Check for overrides
    const override =
      backgroundConfig.overrides[
        colorName as keyof typeof backgroundConfig.overrides
      ]
    if (override) {
      css += `  .b-dark .bu-bg--lighter-${colorName} {\n`
      css += `    background-color: ${override.dark.backgroundColor};\n`
      css += `    color: ${override.dark.color};\n`
      css += `  }\n`
    } else {
      css += `  .b-dark .bu-bg--lighter-${colorName} {\n`
      css += `    background-color: var(--color-${colorName}-${darkConfig.bgShade});\n`
      css += `    color: ${darkConfig.textColor};\n`
      css += `  }\n`
    }
  })

  css += '}\n'

  return css
}

// Generate CSS variables from color tokens
export function generateColorVariables(): Record<string, string> {
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
