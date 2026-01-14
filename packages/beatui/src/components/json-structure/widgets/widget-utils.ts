/**
 * Widget Resolution Utilities
 *
 * Utilities for resolving and configuring widgets based on structure context.
 */

import type { StructureContext } from '../structure-context'
import type { WidgetRegistry, ResolvedWidget } from './widget-registry'
import { getGlobalWidgetRegistry } from './widget-registry'

/**
 * Options extracted from widget configuration
 */
export interface WidgetOptions {
  /** Widget-specific options from definition */
  options?: Record<string, unknown>
  /** Priority override */
  priority?: number
}

/**
 * Resolve the best widget for a given context
 *
 * Resolution order:
 * 1. Form-scoped registry (if provided in context)
 * 2. Global registry
 * 3. Returns null if no matching widget found
 *
 * @param ctx - Structure context containing type information
 * @param registry - Optional form-scoped registry (overrides global)
 * @returns Resolved widget or null if no match
 */
export function resolveWidget(
  ctx: StructureContext,
  registry?: WidgetRegistry
): ResolvedWidget | null {
  // First, try form-scoped registry if provided
  if (registry) {
    const formWidget = registry.findBestWidget(ctx)
    if (formWidget) {
      return formWidget
    }
  }

  // Fall back to global registry
  const globalRegistry = getGlobalWidgetRegistry()
  return globalRegistry.findBestWidget(ctx)
}

/**
 * Extract widget options from context definition
 *
 * Looks for widget configuration in:
 * - `x:ui` extension field
 * - `widget` field (legacy)
 * - Direct widget options
 *
 * @param ctx - Structure context
 * @returns Widget options if found
 */
export function getWidgetOptions(ctx: StructureContext): WidgetOptions | undefined {
  const def = ctx.definition
  const options: WidgetOptions = {}

  // Check x:ui extension
  if (typeof def === 'object' && 'x:ui' in def) {
    const xui = def['x:ui'] as Record<string, unknown>

    // Extract widget-specific options
    if (xui.widget && typeof xui.widget === 'object') {
      options.options = xui.widget as Record<string, unknown>
    }

    // Extract priority override
    if (typeof xui.priority === 'number') {
      options.priority = xui.priority
    }
  }

  // Check legacy widget field
  if (typeof def === 'object' && 'widget' in def) {
    const widget = def.widget
    if (typeof widget === 'object' && widget !== null) {
      options.options = { ...(options.options ?? {}), ...(widget as Record<string, unknown>) }
    }
  }

  return Object.keys(options).length > 0 ? options : undefined
}

/**
 * Get widget name from explicit definition override
 *
 * Checks for explicit widget name in:
 * - `x:ui.widget` (if string)
 * - `widget.type` (legacy)
 *
 * @param ctx - Structure context
 * @returns Explicit widget name or undefined
 */
export function getExplicitWidgetName(ctx: StructureContext): string | undefined {
  const def = ctx.definition

  // Check x:ui.widget
  if (typeof def === 'object' && 'x:ui' in def) {
    const xui = def['x:ui'] as Record<string, unknown>
    if (typeof xui.widget === 'string') {
      return xui.widget
    }
  }

  // Check legacy widget.type
  if (typeof def === 'object' && 'widget' in def) {
    const widget = def.widget as Record<string, unknown> | undefined
    if (widget && typeof widget.type === 'string') {
      return widget.type
    }
  }

  return undefined
}

/**
 * Check if a context has a custom widget override
 *
 * @param ctx - Structure context
 * @returns True if an explicit widget is specified
 */
export function hasCustomWidget(ctx: StructureContext): boolean {
  return getExplicitWidgetName(ctx) !== undefined
}

/**
 * Resolve widget with explicit name override
 *
 * If the context specifies an explicit widget name, tries to resolve
 * that widget directly. Otherwise, falls back to automatic resolution.
 *
 * @param ctx - Structure context
 * @param registry - Optional form-scoped registry
 * @returns Resolved widget or null
 */
export function resolveWidgetWithOverride(
  ctx: StructureContext,
  registry?: WidgetRegistry
): ResolvedWidget | null {
  // Check for explicit widget name
  const explicitName = getExplicitWidgetName(ctx)
  if (explicitName) {
    // Try form-scoped registry first
    if (registry) {
      const registration = registry.get(explicitName)
      if (registration) {
        return { name: explicitName, registration }
      }
    }

    // Try global registry
    const globalRegistry = getGlobalWidgetRegistry()
    const registration = globalRegistry.get(explicitName)
    if (registration) {
      return { name: explicitName, registration }
    }

    // Widget name specified but not found
    console.warn(
      `Widget "${explicitName}" specified in definition but not found in registry`,
      { path: ctx.jsonPath }
    )
  }

  // Fall back to automatic resolution
  return resolveWidget(ctx, registry)
}

/**
 * Merge widget options from multiple sources
 *
 * @param baseOptions - Base options from widget registration
 * @param contextOptions - Options from context definition
 * @param userOptions - User-provided options
 * @returns Merged options (user > context > base)
 */
export function mergeWidgetOptions(
  baseOptions?: Record<string, unknown>,
  contextOptions?: Record<string, unknown>,
  userOptions?: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...baseOptions,
    ...contextOptions,
    ...userOptions,
  }
}
