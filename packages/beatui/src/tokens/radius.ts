/**
 * Radius (border-radius) design tokens for BeatUI.
 *
 * Defines a scale of border-radius values based on the spacing base unit.
 * Includes both primitive radius sizes and semantic radius roles for
 * controls, surfaces, and overlays.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * Radius scale definitions mapping size names to CSS values.
 * Values are expressed as multiples of the base spacing variable.
 *
 * | Name | Value                        | Approx |
 * |------|------------------------------|--------|
 * | none | 0                            | 0      |
 * | xs   | base / 2                     | 2px    |
 * | sm   | base                         | 4px    |
 * | md   | base * 1.5                   | 6px    |
 * | lg   | base * 2                     | 8px    |
 * | xl   | base * 3                     | 12px   |
 * | full | 9999px                       | pill   |
 */
export const radius = {
  none: '0',
  xs: 'calc(var(--spacing-base) / 2)',
  sm: 'var(--spacing-base)',
  md: 'calc(var(--spacing-base) * 1.5)',
  lg: 'calc(var(--spacing-base) * 2)',
  xl: 'calc(var(--spacing-base) * 3)',
  full: '9999px',
} as const

/**
 * Union type of all available radius size names.
 */
export type RadiusName = keyof typeof radius

/**
 * Returns the CSS custom property name for a radius size.
 *
 * @param size - The radius size name
 * @returns The CSS variable name (e.g., `'--radius-md'`)
 *
 * @example
 * ```ts
 * getRadiusVarName('md') // '--radius-md'
 * ```
 */
export function getRadiusVarName(size: RadiusName): string {
  return `--radius-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the radius custom property.
 *
 * @param size - The radius size name
 * @returns A CSS `var()` string (e.g., `'var(--radius-md)'`)
 *
 * @example
 * ```ts
 * getRadiusVar('md') // 'var(--radius-md)'
 * ```
 */
export function getRadiusVar(size: RadiusName): string {
  return `var(${getRadiusVarName(size)})`
}

/**
 * Returns a CSS media query string for a minimum-width breakpoint based on
 * the radius value. Primarily used for internal utilities.
 *
 * @param size - The radius size name
 * @returns A media query string
 */
export function getRadiusMediaQuery(size: RadiusName): string {
  return `@media (width >= ${radius[size]})`
}

/**
 * Generates CSS custom property declarations for all radius tokens.
 *
 * @returns A record mapping CSS variable names to their radius values
 *
 * @example
 * ```ts
 * const vars = generateRadiusVariables()
 * // vars['--radius-md'] === 'calc(var(--spacing-base) * 1.5)'
 * ```
 */
export function generateRadiusVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(radius).forEach(([size, value]) => {
    variables[getRadiusVarName(size as RadiusName)] = value
  })

  return variables
}

/**
 * Tuple of all semantic radius role names.
 */
export const semanticRadiusNames = [
  'control',
  'control-sm',
  'control-xs',
  'button',
  'surface',
  'overlay',
  'popover',
  'pill',
  'focus',
] as const

/**
 * Union type of all semantic radius role names.
 */
export type SemanticRadiusName = (typeof semanticRadiusNames)[number]

/**
 * Partial record for overriding default semantic radius assignments.
 */
export type SemanticRadiusOverrides = Partial<
  Record<SemanticRadiusName, string>
>

/**
 * Default semantic radius values mapping roles to primitive radius variables.
 */
const defaultSemanticRadii: Record<SemanticRadiusName, string> = {
  control: getRadiusVar('md'),
  'control-sm': getRadiusVar('sm'),
  'control-xs': getRadiusVar('xs'),
  button: getRadiusVar('md'),
  surface: getRadiusVar('lg'),
  overlay: getRadiusVar('lg'),
  popover: getRadiusVar('md'),
  pill: getRadiusVar('full'),
  focus: getRadiusVar('sm'),
}

/**
 * Returns the CSS custom property name for a semantic radius role.
 *
 * @param name - The semantic radius name
 * @returns The CSS variable name (e.g., `'--radius-control'`)
 *
 * @example
 * ```ts
 * getSemanticRadiusVarName('button') // '--radius-button'
 * ```
 */
export function getSemanticRadiusVarName(name: SemanticRadiusName): string {
  return `--radius-${name}`
}

/**
 * Generates CSS custom property declarations for semantic radius tokens,
 * merging defaults with any provided overrides.
 *
 * @param overrides - Optional overrides for semantic radius values
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticRadiusVariables({ button: 'var(--radius-full)' })
 * // vars['--radius-button'] === 'var(--radius-full)'
 * ```
 */
export function generateSemanticRadiusVariables(
  overrides?: SemanticRadiusOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticRadii, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticRadiusVarName(name as SemanticRadiusName)] = value
  })

  return variables
}
