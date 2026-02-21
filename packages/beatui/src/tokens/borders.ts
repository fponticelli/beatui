/**
 * Border and outline design tokens for BeatUI.
 *
 * Defines scales for border widths and outline widths used consistently
 * across all interactive components.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * Border width scale mapping size names to CSS values.
 *
 * | Name    | Value  | Usage                                |
 * |---------|--------|--------------------------------------|
 * | none    | 0      | No border                            |
 * | thin    | 1px    | Subtle separators, dividers          |
 * | default | 1.5px  | Buttons, inputs, badges              |
 * | medium  | 2px    | Focus rings, emphasis, tabs          |
 * | thick   | 3px    | Modals, heavy emphasis               |
 */
export const borderWidth = {
  none: '0',
  thin: '1px',
  default: '1.5px',
  medium: '2px',
  thick: '3px',
} as const

/**
 * Union type of all available border width names.
 */
export type BorderWidthName = keyof typeof borderWidth

/**
 * Returns the CSS custom property name for a border width.
 *
 * @param size - The border width name
 * @returns The CSS variable name (e.g., `'--border-width-default'`)
 *
 * @example
 * ```ts
 * getBorderWidthVarName('default') // '--border-width-default'
 * ```
 */
export function getBorderWidthVarName(size: BorderWidthName): string {
  return `--border-width-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the border width custom property.
 *
 * @param size - The border width name
 * @returns A CSS `var()` string (e.g., `'var(--border-width-default)'`)
 *
 * @example
 * ```ts
 * getBorderWidthVar('default') // 'var(--border-width-default)'
 * ```
 */
export function getBorderWidthVar(size: BorderWidthName): string {
  return `var(${getBorderWidthVarName(size)})`
}

/**
 * Generates CSS custom property declarations for all border width tokens.
 *
 * @returns A record mapping CSS variable names to their border width values
 *
 * @example
 * ```ts
 * const vars = generateBorderWidthVariables()
 * // vars['--border-width-default'] === '1.5px'
 * ```
 */
export function generateBorderWidthVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(borderWidth).forEach(([size, value]) => {
    variables[getBorderWidthVarName(size as BorderWidthName)] = value
  })

  return variables
}

/**
 * Outline width scale mapping size names to CSS values.
 *
 * | Name    | Value | Usage                            |
 * |---------|-------|----------------------------------|
 * | none    | 0     | No outline                       |
 * | default | 1px   | Default input outline            |
 * | focus   | 2px   | Focus state, error state         |
 */
export const outlineWidth = {
  none: '0',
  default: '1px',
  focus: '2px',
} as const

/**
 * Union type of all available outline width names.
 */
export type OutlineWidthName = keyof typeof outlineWidth

/**
 * Returns the CSS custom property name for an outline width.
 *
 * @param size - The outline width name
 * @returns The CSS variable name (e.g., `'--outline-width-focus'`)
 */
export function getOutlineWidthVarName(size: OutlineWidthName): string {
  return `--outline-width-${size}`
}

/**
 * Returns a CSS `var()` expression referencing the outline width custom property.
 *
 * @param size - The outline width name
 * @returns A CSS `var()` string (e.g., `'var(--outline-width-focus)'`)
 */
export function getOutlineWidthVar(size: OutlineWidthName): string {
  return `var(${getOutlineWidthVarName(size)})`
}

/**
 * Generates CSS custom property declarations for all outline width tokens.
 *
 * @returns A record mapping CSS variable names to their outline width values
 */
export function generateOutlineWidthVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(outlineWidth).forEach(([size, value]) => {
    variables[getOutlineWidthVarName(size as OutlineWidthName)] = value
  })

  return variables
}
