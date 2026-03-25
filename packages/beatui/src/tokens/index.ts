// Design Tokens Export
// Central export for all design tokens

export * from './base-colors'
export * from './borders'
export * from './breakpoints'
export * from './colors'
export * from './controls'
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
  type ColorShadeMap,
  type SemanticColorOverrides,
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
import {
  generateBorderWidthVariables,
  generateOutlineWidthVariables,
} from './borders'
import { generateControlTokenVariables } from './controls'

// Generate all CSS variables
export function generateCoreTokenVariables<C extends string = never>(
  customColors?: Record<C, ColorShadeMap>
): Record<string, string> {
  return {
    ...generateCoreColorVariables(customColors),
    ...generateSpacingVariables(),
    ...generateTypographyVariables(),
    ...generateBreakpointVariables(),
    ...generateRadiusVariables(),
    ...generateShadowVariables(),
    ...generateMotionVariables(),
    ...generateTextShadowVariables(),
    ...generateZIndexVariables(),
    ...generateBorderWidthVariables(),
    ...generateOutlineWidthVariables(),
    ...generateControlTokenVariables(),
  }
}

export interface SemanticTokenOverrideOptions<C extends string = never> {
  colors?: SemanticColorOverrides<C>
  customColors?: Record<C, ColorShadeMap>
  fonts?: SemanticFontOverrides
  radii?: SemanticRadiusOverrides
  shadows?: SemanticShadowOverrides
  motion?: SemanticMotionOverrides
  spacing?: SemanticSpacingOverrides
  textShadows?: SemanticTextShadowOverrides
}

function isSemanticTokenOverrideOptions<C extends string = never>(
  overrides:
    | SemanticColorOverrides<C>
    | SemanticTokenOverrideOptions<C>
    | undefined
): overrides is SemanticTokenOverrideOptions<C> {
  return (
    typeof overrides === 'object' &&
    overrides !== null &&
    ('colors' in overrides ||
      'customColors' in overrides ||
      'fonts' in overrides ||
      'radii' in overrides ||
      'shadows' in overrides ||
      'motion' in overrides ||
      'spacing' in overrides ||
      'textShadows' in overrides)
  )
}

export function generateSemanticTokenVariables<C extends string = never>(
  overrides?:
    | SemanticColorOverrides<C>
    | SemanticTokenOverrideOptions<C>
): Record<string, string> {
  let colorOverrides: SemanticColorOverrides<C> | undefined
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

export function generateAllTokenVariables<C extends string = never>(
  customColors?: Record<C, ColorShadeMap>
): Record<string, string> {
  return {
    ...generateCoreTokenVariables(customColors),
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
