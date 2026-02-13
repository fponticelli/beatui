/**
 * Text shadow design tokens for BeatUI.
 *
 * Defines a scale of CSS `text-shadow` values for enhancing text readability
 * and visual depth. Includes both primitive size-based shadows and semantic
 * roles for button text styles.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * Text shadow scale definitions mapping size names to CSS `text-shadow` values.
 * Shadows increase in intensity from `2xs` (subtle) to `lg` (dramatic).
 */
export const textShadows = {
  none: 'none',
  '2xs': '0px 1px 0px rgb(0 0 0 / 0.15)',
  xs: '0px 1px 1px rgb(0 0 0 / 0.2)',
  sm: '0px 1px 0px rgb(0 0 0 / 0.075), 0px 1px 1px rgb(0 0 0 / 0.075), 0px 2px 2px rgb(0 0 0 / 0.075)',
  md: '0px 1px 1px rgb(0 0 0 / 0.1), 0px 1px 2px rgb(0 0 0 / 0.1), 0px 2px 4px rgb(0 0 0 / 0.1)',
  lg: '0px 1px 2px rgb(0 0 0 / 0.1), 0px 3px 2px rgb(0 0 0 / 0.1), 0px 4px 8px rgb(0 0 0 / 0.1)',
} as const

/**
 * Union type of all available text shadow size names.
 */
export type TextShadowSize = keyof typeof textShadows

/**
 * Tuple of all semantic text shadow role names.
 */
export const semanticTextShadowNames = [
  'button-filled',
  'button-light',
  'button-default',
] as const

/**
 * Union type of all semantic text shadow role names.
 */
export type SemanticTextShadowName = (typeof semanticTextShadowNames)[number]

/**
 * Partial record for overriding default semantic text shadow assignments.
 */
export type SemanticTextShadowOverrides = Partial<
  Record<SemanticTextShadowName, string>
>

/**
 * Default semantic text shadow values mapping button variant roles
 * to primitive text shadow variables.
 */
const defaultSemanticTextShadows: Record<SemanticTextShadowName, string> = {
  'button-filled': getTextShadowVar('sm'),
  'button-light': getTextShadowVar('xs'),
  'button-default': getTextShadowVar('2xs'),
}

/**
 * Returns the CSS custom property name for a text shadow size.
 *
 * @param size - The text shadow size name
 * @returns The CSS variable name (e.g., `'--text-shadow-sm'`)
 *
 * @example
 * ```ts
 * getTextShadowVarName('sm') // '--text-shadow-sm'
 * ```
 */
export function getTextShadowVarName(size: TextShadowSize): string {
  return `--text-shadow-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the text shadow custom property.
 *
 * @param size - The text shadow size name
 * @returns A CSS `var()` string (e.g., `'var(--text-shadow-sm)'`)
 *
 * @example
 * ```ts
 * getTextShadowVar('sm') // 'var(--text-shadow-sm)'
 * ```
 */
export function getTextShadowVar(size: TextShadowSize): string {
  return `var(${getTextShadowVarName(size)})`
}

/**
 * Generates CSS custom property declarations for all text shadow tokens.
 *
 * @returns A record mapping CSS variable names to their text shadow values
 *
 * @example
 * ```ts
 * const vars = generateTextShadowVariables()
 * // vars['--text-shadow-sm'] === '0px 1px 0px rgb(0 0 0 / 0.075), ...'
 * ```
 */
export function generateTextShadowVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(textShadows).forEach(([size, value]) => {
    variables[getTextShadowVarName(size as TextShadowSize)] = value
  })

  return variables
}

/**
 * Returns the CSS custom property name for a semantic text shadow role.
 *
 * @param name - The semantic text shadow name
 * @returns The CSS variable name (e.g., `'--text-shadow-button-filled'`)
 *
 * @example
 * ```ts
 * getSemanticTextShadowVarName('button-filled') // '--text-shadow-button-filled'
 * ```
 */
export function getSemanticTextShadowVarName(
  name: SemanticTextShadowName
): string {
  return `--text-shadow-${name}`
}

/**
 * Generates CSS custom property declarations for semantic text shadow tokens,
 * merging defaults with any provided overrides.
 *
 * @param overrides - Optional overrides for semantic text shadow values
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticTextShadowVariables({ 'button-filled': 'var(--text-shadow-lg)' })
 * // vars['--text-shadow-button-filled'] === 'var(--text-shadow-lg)'
 * ```
 */
export function generateSemanticTextShadowVariables(
  overrides?: SemanticTextShadowOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticTextShadows, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticTextShadowVarName(name as SemanticTextShadowName)] =
      value
  })

  return variables
}
