/**
 * Spacing design tokens for BeatUI.
 *
 * Defines a spacing scale based on a configurable base unit (`0.25rem` by default).
 * Spacing values are expressed as CSS `calc()` expressions referencing the base
 * spacing variable, allowing the entire scale to be adjusted by changing a single value.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * The base spacing unit used as the foundation for the spacing scale.
 *
 * @default '0.25rem'
 */
export const baseSpacing = '0.25rem'

/**
 * Spacing scale definitions mapping size names to CSS values.
 * All values (except `none`, `px`, `base`, and `full`) are computed
 * as multiples of `var(--spacing-base)`.
 *
 * | Name | Value                            | Approx |
 * |------|----------------------------------|--------|
 * | none | 0                                | 0      |
 * | px   | 1px                              | 1px    |
 * | base | 0.25rem                          | 4px    |
 * | xs   | base / 2                         | 2px    |
 * | sm   | base                             | 4px    |
 * | smh  | base * 1.5                       | 6px    |
 * | md   | base * 2                         | 8px    |
 * | mdh  | base * 3                         | 12px   |
 * | lg   | base * 4                         | 16px   |
 * | lgh  | base * 5                         | 20px   |
 * | xl   | base * 6                         | 24px   |
 * | 2xl  | base * 8                         | 32px   |
 * | 2xlh | base * 10                        | 40px   |
 * | 3xl  | base * 12                        | 48px   |
 * | 4xl  | base * 16                        | 64px   |
 * | full | 2000px                           | 2000px |
 */
export const spacing = {
  none: '0',
  px: '1px',
  base: baseSpacing,
  xs: 'calc(var(--spacing-base) / 2)',
  sm: 'var(--spacing-base)',
  smh: 'calc(var(--spacing-base) * 1.5)',
  md: 'calc(var(--spacing-base) * 2)',
  mdh: 'calc(var(--spacing-base) * 3)',
  lg: 'calc(var(--spacing-base) * 4)',
  lgh: 'calc(var(--spacing-base) * 5)',
  xl: 'calc(var(--spacing-base) * 6)',
  '2xl': 'calc(var(--spacing-base) * 8)',
  '2xlh': 'calc(var(--spacing-base) * 10)',
  '3xl': 'calc(var(--spacing-base) * 12)',
  '4xl': 'calc(var(--spacing-base) * 16)',
  full: '2000px',
} as const

/**
 * Union type of all available spacing size names.
 */
export type SpacingName = keyof typeof spacing

/**
 * Returns the CSS custom property name for a spacing size.
 *
 * @param size - The spacing size name
 * @returns The CSS variable name (e.g., `'--spacing-md'`)
 *
 * @example
 * ```ts
 * getSpacingVarName('md') // '--spacing-md'
 * ```
 */
export function getSpacingVarName(size: SpacingName): string {
  return `--spacing-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the spacing custom property.
 *
 * @param size - The spacing size name
 * @returns A CSS `var()` string (e.g., `'var(--spacing-md)'`)
 *
 * @example
 * ```ts
 * getSpacingVar('md') // 'var(--spacing-md)'
 * ```
 */
export function getSpacingVar(size: SpacingName): string {
  return `var(${getSpacingVarName(size)})`
}

/**
 * Generates CSS custom property declarations for all spacing tokens.
 *
 * @returns A record mapping CSS variable names to their spacing values
 *
 * @example
 * ```ts
 * const vars = generateSpacingVariables()
 * // vars['--spacing-md'] === 'calc(var(--spacing-base) * 2)'
 * ```
 */
export function generateSpacingVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(spacing).forEach(([size, value]) => {
    variables[getSpacingVarName(size as SpacingName)] = value
  })

  return variables
}

/**
 * Tuple of all semantic spacing names, used for stack/gap spacing roles.
 */
export const semanticSpacingNames = [
  'stack-2xs',
  'stack-xs',
  'stack-sm',
  'stack-md',
  'stack-lg',
  'stack-xl',
] as const

/**
 * Union type of all semantic spacing names.
 */
export type SemanticSpacingName = (typeof semanticSpacingNames)[number]

/**
 * Partial record for overriding default semantic spacing values.
 */
export type SemanticSpacingOverrides = Partial<
  Record<SemanticSpacingName, string>
>

/**
 * Default semantic spacing values, expressed as multiples of the base spacing variable.
 */
const defaultSemanticSpacing: Record<SemanticSpacingName, string> = {
  'stack-2xs': 'var(--spacing-xs)',
  'stack-xs': 'var(--spacing-sm)',
  'stack-sm': 'var(--spacing-md)',
  'stack-md': 'var(--spacing-mdh)',
  'stack-lg': 'var(--spacing-lg)',
  'stack-xl': 'var(--spacing-xl)',
}

/**
 * Returns the CSS custom property name for a semantic spacing name.
 *
 * @param name - The semantic spacing name
 * @returns The CSS variable name (e.g., `'--spacing-stack-md'`)
 *
 * @example
 * ```ts
 * getSemanticSpacingVarName('stack-md') // '--spacing-stack-md'
 * ```
 */
export function getSemanticSpacingVarName(name: SemanticSpacingName): string {
  return `--spacing-${name}`
}

/**
 * Generates CSS custom property declarations for semantic spacing tokens,
 * merging defaults with any provided overrides.
 *
 * @param overrides - Optional overrides for semantic spacing values
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticSpacingVariables({ 'stack-md': '1rem' })
 * // vars['--spacing-stack-md'] === '1rem'
 * ```
 */
export function generateSemanticSpacingVariables(
  overrides?: SemanticSpacingOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticSpacing, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticSpacingVarName(name as SemanticSpacingName)] = value
  })

  return variables
}
