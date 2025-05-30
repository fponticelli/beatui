// Design Tokens Export
// Central export for all design tokens

export * from './colors'
export * from './spacing'
export * from './typography'

import { generateColorVariables } from './colors'
import { generateSpacingVariables, generateRadiusVariables } from './spacing'
import { generateTypographyVariables } from './typography'

// Generate all CSS variables
export function generateAllTokenVariables(): Record<string, string> {
  return {
    ...generateColorVariables(),
    ...generateSpacingVariables(),
    ...generateRadiusVariables(),
    ...generateTypographyVariables(),
  }
}

// Runtime token access
// These functions read the computed CSS values to stay in sync with themes
export function getTokenValue(tokenName: string): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const computedStyle = getComputedStyle(document.documentElement)
  return computedStyle.getPropertyValue(tokenName).trim()
}

export function getColorToken(color: string, shade: string | number): string {
  return getTokenValue(`--color-${color}-${shade}`)
}

export function getSpacingToken(size: string | number): string {
  return getTokenValue(`--spacing-${size}`)
}

export function getFontSizeToken(size: string): string {
  return getTokenValue(`--font-size-${size}`)
}

// Theme utilities
export interface ThemeTokens {
  colors: Record<string, string>
  spacing: Record<string, string>
  typography: Record<string, string>
}

export function getAllTokens(): ThemeTokens {
  const allVariables = generateAllTokenVariables()

  const colors: Record<string, string> = {}
  const spacing: Record<string, string> = {}
  const typography: Record<string, string> = {}

  Object.entries(allVariables).forEach(([key, value]) => {
    if (key.startsWith('--color-')) {
      colors[key] = value
    } else if (key.startsWith('--spacing-') || key.startsWith('--radius-')) {
      spacing[key] = value
    } else if (
      key.startsWith('--font-') ||
      key.startsWith('--line-') ||
      key.startsWith('--letter-')
    ) {
      typography[key] = value
    }
  })

  return { colors, spacing, typography }
}
