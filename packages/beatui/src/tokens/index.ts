// Design Tokens Export
// Central export for all design tokens

export * from './base-colors'
export * from './breakpoints'
export * from './colors'
export * from './radius'
export * from './spacing'
export * from './typography'

import { generateColorVariables } from './colors'
import { generateSpacingVariables } from './spacing'
import { generateTypographyVariables } from './typography'
import { generateBreakpointVariables } from './breakpoints'
import { generateRadiusVariables } from './radius'

// Generate all CSS variables
export function generateAllTokenVariables(): Record<string, string> {
  return {
    ...generateColorVariables(),
    ...generateSpacingVariables(),
    ...generateTypographyVariables(),
    ...generateBreakpointVariables(),
    ...generateRadiusVariables(),
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
