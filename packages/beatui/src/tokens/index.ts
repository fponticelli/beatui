// Design Tokens Export
// Central export for all design tokens

export * from './base-colors'
export * from './breakpoints'
export * from './colors'
export * from './radius'
export * from './spacing'
export * from './typography'
export * from './z-index'

import {
  generateColorVariables,
  generateCoreColorVariables,
  generateSemanticColorVariables,
  SemanticColorOverrides,
} from './colors'
import { generateSpacingVariables } from './spacing'
import { generateTypographyVariables } from './typography'
import { generateBreakpointVariables } from './breakpoints'
import { generateRadiusVariables } from './radius'
import { generateShadowVariables } from './shadows'
import { generateTextShadowVariables } from './text-shadows'
import { generateZIndexVariables } from './z-index'

// Generate all CSS variables
export function generateCoreTokenVariables(): Record<string, string> {
  return {
    ...generateCoreColorVariables(),
    ...generateSpacingVariables(),
    ...generateTypographyVariables(),
    ...generateBreakpointVariables(),
    ...generateRadiusVariables(),
    ...generateShadowVariables(),
    ...generateTextShadowVariables(),
    ...generateZIndexVariables(),
  }
}

export function generateSemanticTokenVariables(
  overrides?: SemanticColorOverrides
): Record<string, string> {
  return {
    ...generateSemanticColorVariables(overrides),
  }
}

export function generateAllTokenVariables(): Record<string, string> {
  return {
    ...generateCoreTokenVariables(),
    ...generateSemanticTokenVariables(),
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
