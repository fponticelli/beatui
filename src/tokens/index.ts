// Design Tokens Export
// Central export for all design tokens

export * from './colors'
export * from './spacing'
export * from './typography'

import { generateColorVariables } from './colors'
import { generateSpacingVariables } from './spacing'
import { generateTypographyVariables } from './typography'

// Generate all CSS variables
export function generateAllTokenVariables(): Record<string, string> {
  return {
    ...generateColorVariables(),
    ...generateSpacingVariables(),
    ...generateTypographyVariables(),
  }
}

// Runtime token access
// These functions read the computed CSS values to stay in sync with themes
export function getTokenValue(
  tokenName: string,
  element?: HTMLElement
): string {
  if (element == null && typeof window === 'undefined') {
    return ''
  }

  const computedStyle = getComputedStyle(element ?? document.documentElement)
  return computedStyle.getPropertyValue(tokenName).trim()
}
