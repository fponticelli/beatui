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
 * | raised       | 10    | Slightly elevated items |
 * | navigation   | 20    | Nav bars, headers       |
 * | sidebar      | 20    | Side navigation         |
 * | overlay      | 50    | Backdrop overlays       |
 * | modal        | 60    | Modal dialogs           |
 * | tooltip      | 70    | Tooltip content         |
 * | popover      | 80    | Popover menus           |
 * | notification | 90    | Toast notifications     |
 * | maximum      | 100   | Highest priority        |
 */
export const zIndex = {
  // Base layers
  base: 0,
  raised: 10,

  // Navigation and layout
  navigation: 20,
  sidebar: 20,

  // Overlays and modals
  overlay: 50,
  modal: 60,

  // Tooltips and popovers
  tooltip: 70,
  popover: 80,

  // Notifications and alerts
  notification: 90,

  // Maximum priority
  maximum: 100,
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
