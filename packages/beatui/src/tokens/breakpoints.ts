/**
 * Breakpoint design tokens for BeatUI.
 *
 * Defines responsive breakpoint values that are converted to CSS custom properties
 * and media queries at build time. Breakpoints use `rem` units for accessibility
 * and follow a mobile-first approach.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * Breakpoint size definitions mapping size names to their `rem` values.
 *
 * | Name | Value   | Pixels |
 * |------|---------|--------|
 * | sm   | 40rem   | 640px  |
 * | md   | 48rem   | 768px  |
 * | lg   | 64rem   | 1024px |
 * | xl   | 80rem   | 1280px |
 * | 2xl  | 96rem   | 1536px |
 */
export const breakpoints = {
  sm: '40rem', // 640px
  md: '48rem', // 768px
  lg: '64rem', // 1024px
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
} as const

/**
 * Union type of all available breakpoint size names.
 */
export type BreakpointName = keyof typeof breakpoints

/**
 * Returns the CSS custom property name for a breakpoint size.
 *
 * @param size - The breakpoint size name
 * @returns The CSS variable name (e.g., `'--breakpoint-md'`)
 *
 * @example
 * ```ts
 * getBreakpointVarName('md') // '--breakpoint-md'
 * ```
 */
export function getBreakpointVarName(size: BreakpointName): string {
  return `--breakpoint-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the breakpoint custom property.
 *
 * @param size - The breakpoint size name
 * @returns A CSS `var()` string (e.g., `'var(--breakpoint-md)'`)
 *
 * @example
 * ```ts
 * getBreakpointVar('md') // 'var(--breakpoint-md)'
 * ```
 */
export function getBreakpointVar(size: BreakpointName): string {
  return `var(${getBreakpointVarName(size)})`
}

/**
 * Returns a CSS media query string for a minimum-width breakpoint.
 *
 * @param size - The breakpoint size name
 * @returns A media query string (e.g., `'@media (width >= 48rem)'`)
 *
 * @example
 * ```ts
 * getBreakpointMediaQuery('md') // '@media (width >= 48rem)'
 * ```
 */
export function getBreakpointMediaQuery(size: BreakpointName): string {
  return `@media (width >= ${breakpoints[size]})`
}

/**
 * Generates CSS custom property declarations for all breakpoint tokens.
 *
 * @returns A record mapping CSS variable names to their breakpoint values
 *
 * @example
 * ```ts
 * const vars = generateBreakpointVariables()
 * // vars['--breakpoint-md'] === '48rem'
 * ```
 */
export function generateBreakpointVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(breakpoints).forEach(([size, value]) => {
    variables[getBreakpointVarName(size as BreakpointName)] = value
  })

  return variables
}
