// Design Tokens Export
// Central export for all design tokens

export * from './base-colors'
export * from './breakpoints'
export * from './colors'
export * from './radius'
export * from './spacing'
export * from './shadows'
export * from './typography'
export * from './z-index'
export * from './motion'
export * from './text-shadows'

import {
  generateCoreColorVariables,
  generateSemanticColorVariables,
  SemanticColorOverrides,
} from './colors'
import { generateSpacingVariables } from './spacing'
import {
  generateSemanticFontVariables,
  generateTypographyVariables,
  SemanticFontOverrides,
} from './typography'
import { generateBreakpointVariables } from './breakpoints'
import {
  generateRadiusVariables,
  generateSemanticRadiusVariables,
  SemanticRadiusOverrides,
} from './radius'
import {
  generateShadowVariables,
  generateSemanticShadowVariables,
  SemanticShadowOverrides,
} from './shadows'
import { generateTextShadowVariables } from './text-shadows'
import {
  generateSemanticTextShadowVariables,
  SemanticTextShadowOverrides,
} from './text-shadows'
import { generateZIndexVariables } from './z-index'
import {
  generateMotionVariables,
  generateSemanticMotionVariables,
  SemanticMotionOverrides,
} from './motion'
import {
  generateSemanticSpacingVariables,
  SemanticSpacingOverrides,
} from './spacing'

// Generate all CSS variables
export function generateCoreTokenVariables(): Record<string, string> {
  return {
    ...generateCoreColorVariables(),
    ...generateSpacingVariables(),
    ...generateTypographyVariables(),
    ...generateBreakpointVariables(),
    ...generateRadiusVariables(),
    ...generateShadowVariables(),
    ...generateMotionVariables(),
    ...generateTextShadowVariables(),
    ...generateZIndexVariables(),
  }
}

export interface SemanticTokenOverrideOptions {
  colors?: SemanticColorOverrides
  fonts?: SemanticFontOverrides
  radii?: SemanticRadiusOverrides
  shadows?: SemanticShadowOverrides
  motion?: SemanticMotionOverrides
  spacing?: SemanticSpacingOverrides
  textShadows?: SemanticTextShadowOverrides
}

function isSemanticTokenOverrideOptions(
  overrides: SemanticColorOverrides | SemanticTokenOverrideOptions | undefined
): overrides is SemanticTokenOverrideOptions {
  return (
    typeof overrides === 'object' &&
    overrides !== null &&
    ('colors' in overrides ||
      'fonts' in overrides ||
      'radii' in overrides ||
      'shadows' in overrides ||
      'motion' in overrides ||
      'spacing' in overrides ||
      'textShadows' in overrides)
  )
}

export function generateSemanticTokenVariables(
  overrides?: SemanticColorOverrides | SemanticTokenOverrideOptions
): Record<string, string> {
  let colorOverrides: SemanticColorOverrides | undefined
  let fontOverrides: SemanticFontOverrides | undefined
  let radiusOverrides: SemanticRadiusOverrides | undefined
  let shadowOverrides: SemanticShadowOverrides | undefined
  let motionOverrides: SemanticMotionOverrides | undefined
  let spacingOverrides: SemanticSpacingOverrides | undefined
  let textShadowOverrides: SemanticTextShadowOverrides | undefined

  if (isSemanticTokenOverrideOptions(overrides)) {
    colorOverrides = overrides.colors
    fontOverrides = overrides.fonts
    radiusOverrides = overrides.radii
    shadowOverrides = overrides.shadows
    motionOverrides = overrides.motion
    spacingOverrides = overrides.spacing
    textShadowOverrides = overrides.textShadows
  } else {
    colorOverrides = overrides
  }

  return {
    ...generateSemanticColorVariables(colorOverrides),
    ...generateSemanticFontVariables(fontOverrides),
    ...generateSemanticRadiusVariables(radiusOverrides),
    ...generateSemanticShadowVariables(shadowOverrides),
    ...generateSemanticMotionVariables(motionOverrides),
    ...generateSemanticSpacingVariables(spacingOverrides),
    ...generateSemanticTextShadowVariables(textShadowOverrides),
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
