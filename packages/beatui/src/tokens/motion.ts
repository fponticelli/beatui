/**
 * Motion (animation) design tokens for BeatUI.
 *
 * Defines animation duration and easing curve values that are exposed as CSS
 * custom properties. Includes both primitive duration/easing tokens and semantic
 * motion roles for transitions and animations throughout the UI.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * The base motion duration used as the foundation for the duration scale.
 *
 * @default '200ms'
 */
export const baseMotionDuration = '200ms'

/**
 * Motion duration scale mapping names to CSS time values.
 * All values (except `instant`) are derived from `--motion-duration-base`
 * via `calc()`, allowing the entire timing scale to be adjusted by changing
 * a single variable.
 *
 * | Name    | Multiplier | Default |
 * |---------|------------|---------|
 * | instant | —          | 0s      |
 * | fast    | 0.6        | 120ms   |
 * | base    | 1          | 200ms   |
 * | slow    | 1.6        | 320ms   |
 * | relaxed | 2.4        | 480ms   |
 */
export const motionDurations = {
  instant: '0s',
  fast: 'calc(var(--motion-duration-base) * 0.6)',
  base: baseMotionDuration,
  slow: 'calc(var(--motion-duration-base) * 1.6)',
  relaxed: 'calc(var(--motion-duration-base) * 2.4)',
} as const

/**
 * Motion easing curve definitions mapping names to CSS `cubic-bezier()` values.
 *
 * | Name       | Curve                          | Use case                |
 * |------------|--------------------------------|-------------------------|
 * | standard   | cubic-bezier(0.2, 0, 0, 1)    | General transitions     |
 * | emphasized | cubic-bezier(0.33, 1, 0.68, 1) | Attention-drawing motion |
 * | entrance   | cubic-bezier(0, 0, 0.2, 1)    | Elements appearing      |
 * | exit       | cubic-bezier(0.8, 0, 0.6, 1)  | Elements disappearing   |
 */
export const motionEasings = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.33, 1, 0.68, 1)',
  entrance: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.8, 0, 0.6, 1)',
} as const

/**
 * Union type of all available motion duration names.
 */
export type MotionDurationName = keyof typeof motionDurations

/**
 * Union type of all available motion easing names.
 */
export type MotionEasingName = keyof typeof motionEasings

/**
 * Returns the CSS custom property name for a motion duration.
 *
 * @param name - The motion duration name
 * @returns The CSS variable name (e.g., `'--motion-duration-fast'`)
 *
 * @example
 * ```ts
 * getMotionDurationVarName('fast') // '--motion-duration-fast'
 * ```
 */
export function getMotionDurationVarName(name: MotionDurationName): string {
  return `--motion-duration-${name}`
}

/**
 * Returns a CSS `var()` expression referencing the motion duration custom property.
 *
 * @param name - The motion duration name
 * @returns A CSS `var()` string (e.g., `'var(--motion-duration-fast)'`)
 */
export function getMotionDurationVar(name: MotionDurationName): string {
  return `var(${getMotionDurationVarName(name)})`
}

/**
 * Returns the CSS custom property name for the base motion duration.
 *
 * @returns The CSS variable name `'--motion-duration-base'`
 */
export function getBaseMotionDurationVarName(): string {
  return '--motion-duration-base'
}

/**
 * Returns a CSS `var()` expression referencing the base motion duration custom property.
 *
 * @returns A CSS `var()` string `'var(--motion-duration-base)'`
 */
export function getBaseMotionDurationVar(): string {
  return `var(${getBaseMotionDurationVarName()})`
}

/**
 * Returns the CSS custom property name for a motion easing curve.
 *
 * @param name - The motion easing name
 * @returns The CSS variable name (e.g., `'--motion-easing-standard'`)
 *
 * @example
 * ```ts
 * getMotionEasingVarName('standard') // '--motion-easing-standard'
 * ```
 */
export function getMotionEasingVarName(name: MotionEasingName): string {
  return `--motion-easing-${name}`
}

/**
 * Returns a CSS `var()` expression referencing the motion easing custom property.
 *
 * @param name - The motion easing name
 * @returns A CSS `var()` string (e.g., `'var(--motion-easing-standard)'`)
 */
export function getMotionEasingVar(name: MotionEasingName): string {
  return `var(${getMotionEasingVarName(name)})`
}

/**
 * Generates CSS custom property declarations for all motion tokens,
 * including both durations and easing curves.
 *
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateMotionVariables()
 * // vars['--motion-duration-base'] === '200ms'
 * // vars['--motion-duration-fast'] === 'calc(var(--motion-duration-base) * 0.6)'
 * // vars['--motion-easing-standard'] === 'cubic-bezier(0.2, 0, 0, 1)'
 * ```
 */
export function generateMotionVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(motionDurations).forEach(([name, value]) => {
    variables[getMotionDurationVarName(name as MotionDurationName)] = value
  })

  objectEntries(motionEasings).forEach(([name, value]) => {
    variables[getMotionEasingVarName(name as MotionEasingName)] = value
  })

  return variables
}

/**
 * Tuple of all semantic motion role names, covering both transition
 * durations and easing curves.
 */
export const semanticMotionNames = [
  'transition-fast',
  'transition-medium',
  'transition-slow',
  'transition-overlay',
  'transition-emphasis',
  'easing-standard',
  'easing-emphasis',
  'easing-entrance',
  'easing-exit',
] as const

/**
 * Union type of all semantic motion role names.
 */
export type SemanticMotionName = (typeof semanticMotionNames)[number]

/**
 * Partial record for overriding default semantic motion assignments.
 */
export type SemanticMotionOverrides = Partial<
  Record<SemanticMotionName, string>
>

/**
 * Default semantic motion values mapping roles to primitive motion variables.
 */
const defaultSemanticMotion: Record<SemanticMotionName, string> = {
  'transition-fast': getMotionDurationVar('fast'),
  'transition-medium': getMotionDurationVar('base'),
  'transition-slow': getMotionDurationVar('slow'),
  'transition-overlay': getMotionDurationVar('relaxed'),
  'transition-emphasis': getMotionDurationVar('fast'),
  'easing-standard': getMotionEasingVar('standard'),
  'easing-emphasis': getMotionEasingVar('emphasized'),
  'easing-entrance': getMotionEasingVar('entrance'),
  'easing-exit': getMotionEasingVar('exit'),
}

/**
 * Returns the CSS custom property name for a semantic motion role.
 *
 * @param name - The semantic motion name
 * @returns The CSS variable name (e.g., `'--motion-transition-fast'`)
 *
 * @example
 * ```ts
 * getSemanticMotionVarName('transition-fast') // '--motion-transition-fast'
 * ```
 */
export function getSemanticMotionVarName(name: SemanticMotionName): string {
  return `--motion-${name}`
}

/**
 * Generates CSS custom property declarations for semantic motion tokens,
 * merging defaults with any provided overrides.
 *
 * @param overrides - Optional overrides for semantic motion values
 * @returns A record mapping CSS variable names to their values
 *
 * @example
 * ```ts
 * const vars = generateSemanticMotionVariables({ 'transition-fast': '80ms' })
 * // vars['--motion-transition-fast'] === '80ms'
 * ```
 */
export function generateSemanticMotionVariables(
  overrides?: SemanticMotionOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticMotion, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    const varName = getSemanticMotionVarName(name as SemanticMotionName)
    // Skip entries where the semantic var name is the same as the referenced
    // core var — e.g. --motion-easing-standard: var(--motion-easing-standard)
    // would create a circular self-reference in CSS.
    if (value === `var(${varName})`) return
    variables[varName] = value
  })

  return variables
}
