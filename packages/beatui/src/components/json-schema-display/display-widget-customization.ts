import type { Renderable } from '@tempots/dom'
import type { Value } from '@tempots/dom'
import type { SchemaContext, JSONSchema } from '../json-schema/schema-context'
import type { Mismatch } from './mismatch'
import { resolveWidget, type ResolvedWidget } from '../json-schema/widgets/utils'

/**
 * Display widget factory function signature.
 * Unlike form WidgetFactory, takes a read-only Value<unknown> instead of Controller<T>.
 */
export type DisplayWidgetFactory = (props: {
  value: Value<unknown>
  ctx: SchemaContext
  mismatches?: Mismatch[]
  options?: Record<string, unknown>
}) => Renderable

/**
 * Display widget registration entry
 */
export interface DisplayWidgetRegistration {
  /** Widget factory function */
  factory: DisplayWidgetFactory
  /** Custom matcher function for widget selection */
  matcher: (ctx: SchemaContext) => boolean
  /** Widget priority (higher = preferred, default: 50) */
  priority?: number
  /** Widget display name (for debugging) */
  displayName?: string
  /** Widget description */
  description?: string
}

/**
 * Array of custom display widget registrations
 */
export type CustomDisplayWidgets = DisplayWidgetRegistration[]

/**
 * Display widget registry for managing custom display widgets
 */
export class DisplayWidgetRegistry {
  private widgets: DisplayWidgetRegistration[] = []

  register(registration: DisplayWidgetRegistration): void {
    this.widgets.push(registration)
    // Keep sorted by priority descending
    this.widgets.sort(
      (a, b) => (b.priority ?? 50) - (a.priority ?? 50)
    )
  }

  /**
   * Find the best display widget for a schema context.
   * Returns the factory if found, undefined otherwise.
   */
  findBestWidget(
    ctx: SchemaContext
  ): { factory: DisplayWidgetFactory; resolved?: ResolvedWidget } | undefined {
    // First try widget registry name-based resolution
    const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
    if (resolved?.widget) {
      const byName = this.widgets.find(
        w =>
          w.displayName === resolved.widget &&
          w.matcher(ctx)
      )
      if (byName) {
        return { factory: byName.factory, resolved }
      }
    }

    // Try matcher-based widgets (already sorted by priority)
    for (const registration of this.widgets) {
      try {
        if (registration.matcher(ctx)) {
          return { factory: registration.factory, resolved }
        }
      } catch (error) {
        console.warn(
          `Error in display widget matcher "${registration.displayName ?? 'unknown'}":`,
          error
        )
      }
    }

    return undefined
  }
}

/**
 * Create a custom display widget registration that matches by explicit x:ui widget name.
 */
export function forDisplayXUI(
  widgetName: string,
  factory: DisplayWidgetFactory,
  options?: Partial<
    Omit<DisplayWidgetRegistration, 'factory' | 'matcher'>
  >
): DisplayWidgetRegistration {
  return {
    factory,
    matcher: ctx => {
      const schema = ctx.definition as JSONSchema
      const xui = schema['x:ui']
      return (
        xui === widgetName ||
        (typeof xui === 'object' &&
          xui !== null &&
          (xui as Record<string, unknown>).widget === widgetName)
      )
    },
    displayName: options?.displayName ?? widgetName,
    priority: options?.priority ?? 100,
    ...options,
  }
}

/**
 * Create a custom display widget registration that matches by schema format.
 */
export function forDisplayFormat(
  format: string,
  factory: DisplayWidgetFactory,
  options?: Partial<
    Omit<DisplayWidgetRegistration, 'factory' | 'matcher'>
  >
): DisplayWidgetRegistration {
  return {
    factory,
    matcher: ctx => {
      const schema = ctx.definition as JSONSchema
      return schema.format === format
    },
    displayName: options?.displayName ?? `${format} display`,
    priority: options?.priority ?? 75,
    ...options,
  }
}

/**
 * Create a custom display widget registration that matches by type + format combination.
 */
export function forDisplayTypeAndFormat(
  type: string,
  format: string,
  factory: DisplayWidgetFactory,
  options?: Partial<
    Omit<DisplayWidgetRegistration, 'factory' | 'matcher'>
  >
): DisplayWidgetRegistration {
  return {
    factory,
    matcher: ctx => {
      const schema = ctx.definition as JSONSchema
      return schema.type === type && schema.format === format
    },
    displayName: options?.displayName ?? `${type}:${format} display`,
    priority: options?.priority ?? 80,
    ...options,
  }
}
