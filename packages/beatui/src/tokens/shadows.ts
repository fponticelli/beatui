/**
 * Box shadow design tokens for BeatUI.
 *
 * Defines a scale of box-shadow values from subtle to dramatic, including both
 * bottom-facing and top-facing shadow variants. Also includes semantic shadow
 * roles for common UI surfaces.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * Box shadow scale definitions mapping size names to CSS `box-shadow` values.
 * Includes standard (bottom-facing) and `top-*` (top-facing) variants.
 *
 * Standard shadows project downward; `top-*` shadows project upward
 * and are useful for bottom-anchored elements like bottom sheets.
 */
export const shadows = {
  none: 'none',
  '2xs': '0 1px rgb(0 0 0 / 0.05)',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'top-2xs': '0 -1px rgb(0 0 0 / 0.05)',
  'top-xs': '0 -1px 2px 0 rgb(0 0 0 / 0.05)',
  'top-sm': '0 -1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'top-md': '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'top-lg':
    '0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'top-xl':
    '0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'top-2xl': '0 -25px 50px -12px rgb(0 0 0 / 0.25)',
} as const

/**
 * Union type of all available shadow size names.
 */
export type ShadowSize = keyof typeof shadows

/**
 * Returns the CSS custom property name for a shadow size.
 *
 * @param size - The shadow size name
 * @returns The CSS variable name (e.g., `'--shadow-md'`)
 *
 * @example
 * ```ts
 * getShadowVarName('md') // '--shadow-md'
 * ```
 */
export function getShadowVarName(size: ShadowSize): string {
  return `--shadow-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the shadow custom property.
 *
 * @param size - The shadow size name
 * @returns A CSS `var()` string (e.g., `'var(--shadow-md)'`)
 *
 * @example
 * ```ts
 * getShadowVar('md') // 'var(--shadow-md)'
 * ```
 */
export function getShadowVar(size: ShadowSize): string {
  return `var(${getShadowVarName(size)})`
}

/**
 * Generates CSS custom property declarations for all shadow tokens.
 *
 * @returns A record mapping CSS variable names to their shadow values
 *
 * @example
 * ```ts
 * const vars = generateShadowVariables()
 * // vars['--shadow-md'] === '0 4px 6px -1px rgb(0 0 0 / 0.1), ...'
 * ```
 */
export function generateShadowVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(shadows).forEach(([size, value]) => {
    variables[getShadowVarName(size as ShadowSize)] = value
  })

  return variables
}

/**
 * Tuple of all semantic shadow role names.
 */
export const semanticShadowNames = [
  'surface',
  'surface-elevated',
  'popover',
  'overlay',
  'button',
] as const

/**
 * Union type of all semantic shadow role names.
 */
export type SemanticShadowName = (typeof semanticShadowNames)[number]

/**
 * Partial record for overriding default semantic shadow assignments.
 */
export type SemanticShadowOverrides = Partial<
  Record<SemanticShadowName, string>
>

/**
 * Default semantic shadow values mapping roles to primitive shadow variables.
 */
const defaultSemanticShadows: Record<SemanticShadowName, string> = {
  surface: getShadowVar('sm'),
  'surface-elevated': getShadowVar('md'),
  popover: getShadowVar('lg'),
  overlay: getShadowVar('xl'),
  button: getShadowVar('xs'),
}

/**
 * Returns the CSS custom property name for a semantic shadow role.
 *
 * @param name - The semantic shadow name
 * @returns The CSS variable name (e.g., `'--shadow-popover'`)
 *
 * @example
 * ```ts
 * getSemanticShadowVarName('popover') // '--shadow-popover'
 * ```
 */
export function getSemanticShadowVarName(name: SemanticShadowName): string {
  return `--shadow-${name}`
}

/**
 * Generates CSS custom property declarations for semantic shadow tokens,
 * merging defaults with any provided overrides.
 *
 * @param overrides - Optional overrides for semantic shadow values
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticShadowVariables({ popover: 'var(--shadow-xl)' })
 * // vars['--shadow-popover'] === 'var(--shadow-xl)'
 * ```
 */
export function generateSemanticShadowVariables(
  overrides?: SemanticShadowOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticShadows, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticShadowVarName(name as SemanticShadowName)] = value
  })

  return variables
}
