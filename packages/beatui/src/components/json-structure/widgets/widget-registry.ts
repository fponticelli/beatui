/**
 * Widget Registry for JSON Structure Forms
 *
 * Manages custom widget registrations and resolution.
 */

import type { Renderable } from '@tempots/dom'
import type { Controller } from '../../form'
import type { StructureContext } from '../structure-context'

/**
 * Props passed to widget factories
 */
export interface WidgetProps<T = unknown> {
  /** Controller for this field's value */
  controller: Controller<T>
  /** Current structure context */
  ctx: StructureContext
  /** Widget-specific options */
  options?: Record<string, unknown>
}

/**
 * Factory function to create a widget
 */
export interface WidgetFactory<T = unknown> {
  (props: WidgetProps<T>): Renderable
}

/**
 * Widget registration entry
 */
export interface WidgetRegistration {
  /** Factory function to create the widget */
  factory: WidgetFactory
  /** Human-readable display name */
  displayName: string
  /** Optional description */
  description?: string
  /** JSON Structure types this widget handles */
  supportedTypes?: string[]
  /** JSON Structure formats this widget handles */
  supportedFormats?: string[]
  /** Resolution priority (higher = preferred) */
  priority?: number
  /** Whether this can be used as fallback */
  canFallback?: boolean
  /** Custom matching logic */
  matcher?: (ctx: StructureContext) => boolean
}

/**
 * Resolved widget ready for use
 */
export interface ResolvedWidget {
  name: string
  registration: WidgetRegistration
}

/**
 * Widget registry interface
 */
export interface WidgetRegistry {
  /** Register a widget */
  register(name: string, registration: WidgetRegistration): void

  /** Unregister a widget */
  unregister(name: string): void

  /** Get all registrations for a type */
  getForType(type: string): WidgetRegistration[]

  /** Get all registrations for a format */
  getForFormat(format: string): WidgetRegistration[]

  /** Find best matching widget for context */
  findBestWidget(ctx: StructureContext): ResolvedWidget | null

  /** Get registration by name */
  get(name: string): WidgetRegistration | undefined

  /** Check if a widget is registered */
  has(name: string): boolean

  /** Get all widget names */
  names(): string[]

  /** Create a child registry that inherits from this one */
  createChild(): WidgetRegistry
}

/**
 * Default implementation of WidgetRegistry
 */
export class DefaultWidgetRegistry implements WidgetRegistry {
  private readonly registrations = new Map<string, WidgetRegistration>()
  private readonly parent: WidgetRegistry | null

  constructor(parent?: WidgetRegistry) {
    this.parent = parent ?? null
  }

  register(name: string, registration: WidgetRegistration): void {
    this.registrations.set(name, registration)
  }

  unregister(name: string): void {
    this.registrations.delete(name)
  }

  get(name: string): WidgetRegistration | undefined {
    return this.registrations.get(name) ?? this.parent?.get(name)
  }

  has(name: string): boolean {
    return this.registrations.has(name) || (this.parent?.has(name) ?? false)
  }

  names(): string[] {
    const parentNames = this.parent?.names() ?? []
    const localNames = Array.from(this.registrations.keys())
    return [...new Set([...parentNames, ...localNames])]
  }

  getForType(type: string): WidgetRegistration[] {
    const results: WidgetRegistration[] = []

    // Collect from parent first (lower priority)
    if (this.parent) {
      results.push(...this.parent.getForType(type))
    }

    // Add local registrations
    for (const registration of this.registrations.values()) {
      if (registration.supportedTypes?.includes(type)) {
        results.push(registration)
      }
    }

    return results
  }

  getForFormat(format: string): WidgetRegistration[] {
    const results: WidgetRegistration[] = []

    // Collect from parent first (lower priority)
    if (this.parent) {
      results.push(...this.parent.getForFormat(format))
    }

    // Add local registrations
    for (const registration of this.registrations.values()) {
      if (registration.supportedFormats?.includes(format)) {
        results.push(registration)
      }
    }

    return results
  }

  findBestWidget(ctx: StructureContext): ResolvedWidget | null {
    const candidates: Array<{
      name: string
      registration: WidgetRegistration
      score: number
    }> = []

    // Check all registrations (including parent)
    for (const name of this.names()) {
      const registration = this.get(name)
      if (!registration) continue

      const score = this.scoreWidget(registration, ctx)
      if (score > 0) {
        candidates.push({ name, registration, score })
      }
    }

    if (candidates.length === 0) {
      return null
    }

    // Sort by score (descending), then by priority (descending)
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (b.registration.priority ?? 0) - (a.registration.priority ?? 0)
    })

    const best = candidates[0]
    return { name: best.name, registration: best.registration }
  }

  /**
   * Score how well a widget matches the context
   */
  private scoreWidget(
    registration: WidgetRegistration,
    ctx: StructureContext
  ): number {
    let score = 0

    // Custom matcher has highest priority
    if (registration.matcher) {
      if (registration.matcher(ctx)) {
        score += 100
      } else {
        return 0 // Matcher returned false, don't use this widget
      }
    }

    // Type match
    const primaryType = ctx.primaryType
    if (primaryType && registration.supportedTypes?.includes(primaryType)) {
      score += 50
    }

    // Format match (for string types)
    const format = ctx.format
    if (format && registration.supportedFormats?.includes(format)) {
      score += 30
    }

    // Add priority as tiebreaker
    score += registration.priority ?? 0

    return score
  }

  createChild(): WidgetRegistry {
    return new DefaultWidgetRegistry(this)
  }
}

/**
 * Global widget registry instance
 */
let globalRegistry: WidgetRegistry | null = null

/**
 * Get the global widget registry
 */
export function getGlobalWidgetRegistry(): WidgetRegistry {
  if (!globalRegistry) {
    globalRegistry = new DefaultWidgetRegistry()
  }
  return globalRegistry
}

/**
 * Set the global widget registry
 */
export function setGlobalWidgetRegistry(registry: WidgetRegistry): void {
  globalRegistry = registry
}

/**
 * Create a new widget registry
 */
export function createWidgetRegistry(parent?: WidgetRegistry): WidgetRegistry {
  return new DefaultWidgetRegistry(parent)
}

// =============================================================================
// Registration Helper Functions
// =============================================================================

export interface WidgetRegistrationOptions {
  displayName?: string
  description?: string
  priority?: number
  canFallback?: boolean
}

/**
 * Create a widget registration for a specific type
 */
export function forType(
  type: string,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
): { name: string; registration: WidgetRegistration } {
  const name = `type:${type}`
  return {
    name,
    registration: {
      factory,
      displayName: options?.displayName ?? `${type} widget`,
      description: options?.description,
      supportedTypes: [type],
      priority: options?.priority ?? 0,
      canFallback: options?.canFallback ?? false,
    },
  }
}

/**
 * Create a widget registration for a specific format
 */
export function forFormat(
  format: string,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
): { name: string; registration: WidgetRegistration } {
  const name = `format:${format}`
  return {
    name,
    registration: {
      factory,
      displayName: options?.displayName ?? `${format} widget`,
      description: options?.description,
      supportedFormats: [format],
      priority: options?.priority ?? 10, // Format widgets have higher priority than type widgets
      canFallback: options?.canFallback ?? false,
    },
  }
}

/**
 * Create a widget registration for a type+format combination
 */
export function forTypeAndFormat(
  type: string,
  format: string,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
): { name: string; registration: WidgetRegistration } {
  const name = `type:${type}:format:${format}`
  return {
    name,
    registration: {
      factory,
      displayName: options?.displayName ?? `${type}/${format} widget`,
      description: options?.description,
      supportedTypes: [type],
      supportedFormats: [format],
      priority: options?.priority ?? 20, // Type+format widgets have highest priority
      canFallback: options?.canFallback ?? false,
    },
  }
}

/**
 * Create a widget registration with custom matcher
 */
export function forMatcher(
  name: string,
  matcher: (ctx: StructureContext) => boolean,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
): { name: string; registration: WidgetRegistration } {
  return {
    name,
    registration: {
      factory,
      displayName: options?.displayName ?? name,
      description: options?.description,
      matcher,
      priority: options?.priority ?? 50, // Custom matchers have very high priority
      canFallback: options?.canFallback ?? false,
    },
  }
}
