/**
 * Control design tokens for BeatUI.
 *
 * Defines semantic tokens for interactive controls (buttons, inputs, badges, etc.)
 * including heights, padding, gaps, and overlay sizing. All values are computed
 * from the base spacing variable, enabling global scaling.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

// ---------------------------------------------------------------------------
// Control height
// ---------------------------------------------------------------------------

/**
 * Semantic control height scale. All values are multiples of `--spacing-base`,
 * so changing the base spacing unit scales every control uniformly.
 *
 * | Name | Multiplier | Approx (at 0.25rem base) |
 * |------|------------|--------------------------|
 * | xs   | base * 7   | 28px                     |
 * | sm   | base * 8   | 32px                     |
 * | md   | base * 10  | 40px                     |
 * | lg   | base * 12  | 48px                     |
 * | xl   | base * 14  | 56px                     |
 */
export const controlHeight = {
  xs: 'calc(var(--spacing-base) * 7)',
  sm: 'calc(var(--spacing-base) * 8)',
  md: 'calc(var(--spacing-base) * 10)',
  lg: 'calc(var(--spacing-base) * 12)',
  xl: 'calc(var(--spacing-base) * 14)',
} as const

export type ControlHeightName = keyof typeof controlHeight

export function getControlHeightVarName(size: ControlHeightName): string {
  return `--control-height-${size}`
}

export function getControlHeightVar(size: ControlHeightName): string {
  return `var(${getControlHeightVarName(size)})`
}

export function generateControlHeightVariables(): Record<string, string> {
  const variables: Record<string, string> = {}
  objectEntries(controlHeight).forEach(([size, value]) => {
    variables[getControlHeightVarName(size as ControlHeightName)] = value
  })
  return variables
}

// ---------------------------------------------------------------------------
// Control padding (asymmetric block / inline)
// ---------------------------------------------------------------------------

/**
 * Semantic control block (vertical) padding scale.
 *
 * | Name | Token reference  | Approx |
 * |------|------------------|--------|
 * | xs   | --spacing-xs     | 2px    |
 * | sm   | --spacing-sm     | 4px    |
 * | md   | --spacing-md     | 8px    |
 * | lg   | --spacing-mdh    | 12px   |
 * | xl   | --spacing-lg     | 16px   |
 */
export const controlPaddingBlock = {
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-mdh)',
  xl: 'var(--spacing-lg)',
} as const

export type ControlPaddingBlockName = keyof typeof controlPaddingBlock

export function getControlPaddingBlockVarName(
  size: ControlPaddingBlockName
): string {
  return `--control-padding-block-${size}`
}

export function getControlPaddingBlockVar(
  size: ControlPaddingBlockName
): string {
  return `var(${getControlPaddingBlockVarName(size)})`
}

/**
 * Semantic control inline (horizontal) padding scale.
 *
 * | Name | Token reference  | Approx |
 * |------|------------------|--------|
 * | xs   | --spacing-md     | 8px    |
 * | sm   | --spacing-mdh    | 12px   |
 * | md   | --spacing-lg     | 16px   |
 * | lg   | --spacing-lgh    | 20px   |
 * | xl   | --spacing-xl     | 24px   |
 */
export const controlPaddingInline = {
  xs: 'var(--spacing-md)',
  sm: 'var(--spacing-mdh)',
  md: 'var(--spacing-lg)',
  lg: 'var(--spacing-lgh)',
  xl: 'var(--spacing-xl)',
} as const

export type ControlPaddingInlineName = keyof typeof controlPaddingInline

export function getControlPaddingInlineVarName(
  size: ControlPaddingInlineName
): string {
  return `--control-padding-inline-${size}`
}

export function getControlPaddingInlineVar(
  size: ControlPaddingInlineName
): string {
  return `var(${getControlPaddingInlineVarName(size)})`
}

export function generateControlPaddingVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(controlPaddingBlock).forEach(([size, value]) => {
    variables[getControlPaddingBlockVarName(size as ControlPaddingBlockName)] =
      value
  })

  objectEntries(controlPaddingInline).forEach(([size, value]) => {
    variables[
      getControlPaddingInlineVarName(size as ControlPaddingInlineName)
    ] = value
  })

  return variables
}

// ---------------------------------------------------------------------------
// Control gap
// ---------------------------------------------------------------------------

/**
 * Semantic control gap scale for spacing between icon and text, items, etc.
 *
 * | Name | Token reference  | Approx |
 * |------|------------------|--------|
 * | xs   | --spacing-xs     | 2px    |
 * | sm   | --spacing-sm     | 4px    |
 * | md   | --spacing-smh    | 6px    |
 * | lg   | --spacing-md     | 8px    |
 * | xl   | --spacing-mdh    | 12px   |
 */
export const controlGap = {
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-smh)',
  lg: 'var(--spacing-md)',
  xl: 'var(--spacing-mdh)',
} as const

export type ControlGapName = keyof typeof controlGap

export function getControlGapVarName(size: ControlGapName): string {
  return `--control-gap-${size}`
}

export function getControlGapVar(size: ControlGapName): string {
  return `var(${getControlGapVarName(size)})`
}

export function generateControlGapVariables(): Record<string, string> {
  const variables: Record<string, string> = {}
  objectEntries(controlGap).forEach(([size, value]) => {
    variables[getControlGapVarName(size as ControlGapName)] = value
  })
  return variables
}

// ---------------------------------------------------------------------------
// Overlay width
// ---------------------------------------------------------------------------

/**
 * Semantic overlay/container width scale for modals, tooltips, menus, etc.
 *
 * | Name      | Value               | Approx |
 * |-----------|---------------------|--------|
 * | xs        | min(20rem, 90vw)    | ~320px |
 * | sm        | min(25rem, 90vw)    | ~400px |
 * | md        | min(37.5rem, 90vw)  | ~600px |
 * | lg        | min(50rem, 90vw)    | ~800px |
 * | xl        | min(62.5rem, 90vw)  | ~1000px|
 * | min-width | 12rem               | ~192px |
 */
export const overlayWidth = {
  xs: 'min(20rem, 90vw)',
  sm: 'min(25rem, 90vw)',
  md: 'min(37.5rem, 90vw)',
  lg: 'min(50rem, 90vw)',
  xl: 'min(62.5rem, 90vw)',
  'min-width': '12rem',
} as const

export type OverlayWidthName = keyof typeof overlayWidth

export function getOverlayWidthVarName(size: OverlayWidthName): string {
  return `--overlay-width-${size}`
}

export function getOverlayWidthVar(size: OverlayWidthName): string {
  return `var(${getOverlayWidthVarName(size)})`
}

export function generateOverlayWidthVariables(): Record<string, string> {
  const variables: Record<string, string> = {}
  objectEntries(overlayWidth).forEach(([size, value]) => {
    variables[getOverlayWidthVarName(size as OverlayWidthName)] = value
  })
  return variables
}

// ---------------------------------------------------------------------------
// Aggregate generation
// ---------------------------------------------------------------------------

/**
 * Generates CSS custom property declarations for all control and overlay tokens.
 *
 * @returns A record mapping CSS variable names to their values
 */
export function generateControlTokenVariables(): Record<string, string> {
  return {
    ...generateControlHeightVariables(),
    ...generateControlPaddingVariables(),
    ...generateControlGapVariables(),
    ...generateOverlayWidthVariables(),
  }
}
