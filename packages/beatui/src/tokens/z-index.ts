/**
 * Z-index design tokens for BeatUI.
 *
 * Defines a consistent layering system for stacking context management.
 * Values increase in increments of 10 to allow intermediate values when needed.
 * The scale covers common UI layers from base content through navigation,
 * overlays, tooltips, and notifications.
 *
 * @module
 */

import { objectEntries } from '@tempots/std'

/**
 * Z-index scale definitions mapping layer names to numeric values.
 *
 * | Name         | Value | Use case                |
 * |--------------|-------|-------------------------|
 * | base         | 0     | Default stacking        |
 * | raised       | 100   | Slightly elevated items |
 * | navigation   | 200   | Nav bars, headers       |
 * | sidebar      | 200   | Side navigation         |
 * | overlay      | 500   | Backdrop overlays       |
 * | modal        | 600   | Modal dialogs           |
 * | tooltip      | 700   | Tooltip content         |
 * | popover      | 800   | Popover menus           |
 * | notification | 900   | Toast notifications     |
 * | maximum      | 1000  | Highest priority        |
 */
export const zIndex = {
  // Base layers
  base: 0,
  raised: 100,

  // Navigation and layout
  navigation: 200,
  sidebar: 200,

  // Overlays and modals
  overlay: 500,
  modal: 600,

  // Tooltips and popovers
  tooltip: 700,
  popover: 800,

  // Notifications and alerts
  notification: 900,

  // Maximum priority
  maximum: 1000,
} as const

/**
 * Union type of all available z-index layer names.
 */
export type ZIndexName = keyof typeof zIndex

/**
 * Returns the CSS custom property name for a z-index layer.
 *
 * @param level - The z-index layer name
 * @returns The CSS variable name (e.g., `'--z-index-modal'`)
 *
 * @example
 * ```ts
 * getZIndexVarName('modal') // '--z-index-modal'
 * ```
 */
export function getZIndexVarName(level: ZIndexName): string {
  return `--z-index-${level}`
}

/**
 * Returns a CSS `var()` expression referencing the z-index custom property.
 *
 * @param level - The z-index layer name
 * @returns A CSS `var()` string (e.g., `'var(--z-index-modal)'`)
 *
 * @example
 * ```ts
 * getZIndexVar('modal') // 'var(--z-index-modal)'
 * ```
 */
export function getZIndexVar(level: ZIndexName): string {
  return `var(${getZIndexVarName(level)})`
}

/**
 * Generates CSS custom property declarations for all z-index tokens.
 *
 * @returns A record mapping CSS variable names to their numeric string values
 *
 * @example
 * ```ts
 * const vars = generateZIndexVariables()
 * // vars['--z-index-modal'] === '60'
 * ```
 */
export function generateZIndexVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(zIndex).forEach(([level, value]) => {
    variables[getZIndexVarName(level as ZIndexName)] = value.toString()
  })

  return variables
}
