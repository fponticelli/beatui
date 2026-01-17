import type { Renderable } from '@tempots/dom'
import { html, attr, Async } from '@tempots/dom'
import type { Controller } from '../../form'
import { Control } from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { resolveWidget, type ResolvedWidget } from './utils'

/**
 * Widget factory function signature
 */
export type WidgetFactory<T = unknown> = (props: {
  controller: Controller<T>
  ctx: SchemaContext
  options?: Record<string, unknown>
}) => Renderable

/**
 * Widget registration entry
 */
export interface WidgetRegistration<T = unknown> {
  /** Widget factory function */
  factory: WidgetFactory<T>
  /** Widget display name */
  displayName: string
  /** Widget description */
  description?: string
  /** Supported JSON Schema types */
  supportedTypes?: string[]
  /** Default configuration */
  defaultConfig?: Record<string, unknown>
  /** Configuration schema for the widget */
  configSchema?: JSONSchema
  /** Widget priority (higher = preferred when multiple widgets match) */
  priority?: number
  /** Whether this widget can be used as a fallback */
  canFallback?: boolean
  /** Custom matcher function for widget selection */
  matcher?: (ctx: SchemaContext) => boolean
}

/**
 * Widget customization configuration from x:ui
 */
export interface WidgetCustomization {
  /** Custom widget type override */
  widget?: string
  /** Widget-specific configuration */
  config?: Record<string, unknown>
  /** Custom CSS classes */
  className?: string
  /** Custom styles */
  style?: Record<string, string>
  /** Custom attributes */
  attributes?: Record<string, string>
  /** Widget wrapper configuration */
  wrapper?: {
    tag?: string
    className?: string
    style?: Record<string, string>
    attributes?: Record<string, string>
  }
  /** Conditional widget selection */
  conditional?: {
    condition: string | ((value: unknown, formData: unknown) => boolean)
    then?: WidgetCustomization
    else?: WidgetCustomization
  }
}

/**
 * Custom widget registration for form-scoped widgets
 */
export interface CustomWidgetRegistration<T = unknown> {
  /** Widget name */
  name: string
  /** Widget factory function */
  factory: WidgetFactory<T>
  /** Widget display name */
  displayName?: string
  /** Widget description */
  description?: string
  /** Supported JSON Schema types */
  supportedTypes?: string[]
  /** Widget priority (higher = preferred, default: 50) */
  priority?: number
  /** Custom matcher function for widget selection */
  matcher?: (ctx: SchemaContext) => boolean
}

/**
 * Array of custom widget registrations for the customWidgets option
 */
export type CustomWidgets = CustomWidgetRegistration[]

/**
 * Widget registry for managing custom widgets
 */
export class WidgetRegistry {
  private widgets = new Map<string, WidgetRegistration<unknown>>()
  private typeMapping = new Map<string, string[]>() // JSON Schema type -> widget names

  /**
   * Register a custom widget
   */
  register<T = unknown>(
    name: string,
    registration: WidgetRegistration<T>
  ): void {
    this.widgets.set(name, registration as WidgetRegistration<unknown>)

    // Update type mapping
    if (registration.supportedTypes) {
      for (const type of registration.supportedTypes) {
        if (!this.typeMapping.has(type)) {
          this.typeMapping.set(type, [])
        }
        this.typeMapping.get(type)!.push(name)

        // Sort by priority (highest first)
        this.typeMapping.get(type)!.sort((a, b) => {
          const priorityA = this.widgets.get(a)?.priority || 0
          const priorityB = this.widgets.get(b)?.priority || 0
          return priorityB - priorityA
        })
      }
    }
  }

  /**
   * Unregister a widget
   */
  unregister(name: string): void {
    const registration = this.widgets.get(name)
    if (!registration) return

    this.widgets.delete(name)

    // Update type mapping
    if (registration.supportedTypes) {
      for (const type of registration.supportedTypes) {
        const widgets = this.typeMapping.get(type)
        if (widgets) {
          const index = widgets.indexOf(name)
          if (index >= 0) {
            widgets.splice(index, 1)
          }
          if (widgets.length === 0) {
            this.typeMapping.delete(type)
          }
        }
      }
    }
  }

  /**
   * Get a registered widget
   */
  get(name: string): WidgetRegistration<unknown> | undefined {
    return this.widgets.get(name)
  }

  /**
   * Get all registered widgets
   */
  getAll(): Map<string, WidgetRegistration<unknown>> {
    return new Map(this.widgets)
  }

  /**
   * Get widgets that support a specific JSON Schema type
   */
  getForType(type: string): WidgetRegistration<unknown>[] {
    const widgetNames = this.typeMapping.get(type) || []
    return widgetNames.map(name => this.widgets.get(name)!).filter(Boolean)
  }

  /**
   * Find the best widget for a schema context
   */
  findBestWidget(ctx: SchemaContext): {
    name: string
    registration: WidgetRegistration<unknown>
    resolved: ResolvedWidget
  } | null {
    // First try to resolve using the standard widget resolver
    const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)

    if (resolved?.widget) {
      const registration = this.widgets.get(resolved.widget)
      if (registration) {
        return { name: resolved.widget, registration, resolved }
      }
    }

    // Try matcher-based widgets (sorted by priority)
    const matchedWidgets: Array<{
      name: string
      registration: WidgetRegistration<unknown>
      priority: number
    }> = []

    for (const [name, registration] of this.widgets.entries()) {
      if (registration.matcher) {
        try {
          if (registration.matcher(ctx)) {
            matchedWidgets.push({
              name,
              registration,
              priority: registration.priority ?? 0,
            })
          }
        } catch (error) {
          console.warn(`Error in matcher for widget "${name}":`, error)
        }
      }
    }

    // Sort by priority (highest first)
    if (matchedWidgets.length > 0) {
      matchedWidgets.sort((a, b) => b.priority - a.priority)
      const best = matchedWidgets[0]
      return {
        name: best.name,
        registration: best.registration,
        resolved: { widget: best.name, source: 'heuristics' },
      }
    }

    // Fallback to type-based matching
    if (typeof ctx.definition === 'object' && ctx.definition.type) {
      const type = Array.isArray(ctx.definition.type)
        ? ctx.definition.type[0]
        : ctx.definition.type

      const candidates = this.getForType(type)
      if (candidates.length > 0) {
        const name = this.typeMapping.get(type)![0]
        return {
          name,
          registration: candidates[0],
          resolved: { widget: name, source: 'type-fallback' },
        }
      }
    }

    return null
  }
}

/**
 * Global widget registry instance
 */
export const globalWidgetRegistry = new WidgetRegistry()

/**
 * Extract widget customization from schema x:ui
 */
export function getWidgetCustomization(
  schema: JSONSchema
): WidgetCustomization | undefined {
  if (typeof schema === 'boolean') return undefined

  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (!xui) return undefined

  const customization: WidgetCustomization = {}

  // Extract widget override
  if (typeof xui.widget === 'string') {
    customization.widget = xui.widget
  }

  // Extract configuration
  if (xui.config && typeof xui.config === 'object') {
    customization.config = xui.config as Record<string, unknown>
  }

  // Extract styling
  if (typeof xui.className === 'string') {
    customization.className = xui.className
  }

  if (xui.style && typeof xui.style === 'object') {
    customization.style = xui.style as Record<string, string>
  }

  if (xui.attributes && typeof xui.attributes === 'object') {
    customization.attributes = xui.attributes as Record<string, string>
  }

  // Extract wrapper configuration
  if (xui.wrapper && typeof xui.wrapper === 'object') {
    customization.wrapper = xui.wrapper as WidgetCustomization['wrapper']
  }

  // Extract conditional configuration
  if (xui.conditional && typeof xui.conditional === 'object') {
    const cond = xui.conditional as Record<string, unknown>
    if (cond.condition) {
      customization.conditional = {
        condition: cond.condition as
          | string
          | ((value: unknown, formData: unknown) => boolean),
        then: cond.then as WidgetCustomization | undefined,
        else: cond.else as WidgetCustomization | undefined,
      }
    }
  }

  return Object.keys(customization).length > 0 ? customization : undefined
}

/**
 * Apply widget customization to a rendered widget
 */
export function applyWidgetCustomization(
  widget: Renderable,
  customization: WidgetCustomization,
  value?: unknown,
  formData?: unknown
): Renderable {
  let result = widget

  // Apply conditional customization first
  if (customization.conditional) {
    const condition = customization.conditional.condition
    let conditionMet = false

    if (typeof condition === 'function') {
      try {
        conditionMet = condition(value, formData)
      } catch (error) {
        console.warn('Error evaluating widget condition:', error)
      }
    } else if (typeof condition === 'string') {
      // Simple string conditions (could be enhanced with expression evaluation)
      conditionMet = Boolean(value)
    }

    const conditionalCustomization = conditionMet
      ? customization.conditional.then
      : customization.conditional.else

    if (conditionalCustomization) {
      result = applyWidgetCustomization(
        result,
        conditionalCustomization,
        value,
        formData
      )
    }
  }

  // Apply wrapper if specified
  if (customization.wrapper) {
    const wrapper = customization.wrapper
    const tag = wrapper.tag || 'div'

    // Create wrapper element with customization using html helper
    const htmlElement = html[tag as keyof typeof html] as (
      ...args: unknown[]
    ) => Renderable

    const attributes: unknown[] = []

    if (wrapper.className) {
      attributes.push(attr.class(wrapper.className))
    }

    if (wrapper.style) {
      const styleString = Object.entries(wrapper.style)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')
      attributes.push(attr.style(styleString))
    }

    if (wrapper.attributes) {
      Object.entries(wrapper.attributes).forEach(([key, value]) => {
        // Create a generic attribute object for custom attributes
        attributes.push({ [key]: value })
      })
    }

    result = htmlElement(...attributes, result)
  }

  return result
}

/**
 * Create a customized widget factory
 */
export function createCustomizedWidget<T = unknown>(
  baseFactory: WidgetFactory<T>,
  customization: WidgetCustomization
): WidgetFactory<T> {
  return props => {
    // Apply base configuration
    const mergedOptions = {
      ...customization.config,
      ...props.options,
    }

    // Create base widget
    const baseWidget = baseFactory({
      ...props,
      options: mergedOptions,
    })

    // Apply customization
    const controller = props.controller
    const currentValue = controller.signal.value

    return applyWidgetCustomization(
      baseWidget,
      customization,
      currentValue,
      currentValue // Simplified - in real implementation, this would be the full form data
    )
  }
}

/**
 * Register built-in enhanced widgets
 */
export function registerEnhancedWidgets(
  registry: WidgetRegistry = globalWidgetRegistry
): void {
  // File upload widget
  registry.register('file-upload', {
    factory: ({ controller, options }) => {
      const accept = options?.accept as string | undefined
      const maxFiles = options?.maxFiles as number | undefined
      const maxFileSize = options?.maxFileSize as number | undefined
      const mode = options?.mode as 'default' | 'input' | 'compact' | undefined

      return Async(import('../../form/input/files-input'), {
        then: ({ FilesInput }) =>
          Control(FilesInput, {
            controller,
            accept,
            maxFiles,
            maxFileSize,
            mode: mode ?? 'default',
            showFileList: true,
          }),
      })
    },
    displayName: 'File Upload',
    description: 'Upload files with drag & drop support',
    supportedTypes: ['string', 'array'],
    priority: 80,
  })

  // Code editor widget
  registry.register('code-editor', {
    factory: ({ controller, options }) => {
      const language = options?.language as string | undefined
      const readOnly = options?.readOnly as boolean | undefined
      const editorOptions = options?.editorOptions as
        | Record<string, unknown>
        | undefined

      return Async(import('../../monaco/monaco-editor-input'), {
        then: ({ MonacoEditorInput }) =>
          Control(MonacoEditorInput, {
            controller,
            language: language ?? 'plaintext',
            readOnly: readOnly ?? false,
            editorOptions,
          }),
      })
    },
    displayName: 'Code Editor',
    description: 'Syntax-highlighted code editor',
    supportedTypes: ['string'],
    priority: 60,
  })
}

/**
 * Helper to register a simple widget
 */
export function registerWidget<T = unknown>(
  name: string,
  factory: WidgetFactory<T>,
  options: Partial<WidgetRegistration<T>> = {},
  registry: WidgetRegistry = globalWidgetRegistry
): void {
  registry.register(name, {
    factory,
    displayName: options.displayName || name,
    ...options,
  })
}

/**
 * Create a custom widget registration that matches by explicit x:ui widget name
 *
 * @example
 * ```typescript
 * forXUI('fancy-email', myEmailWidget)
 * // Matches schema: { type: 'string', 'x:ui': 'fancy-email' }
 * ```
 */
export function forXUI<T = unknown>(
  widgetName: string,
  factory: WidgetFactory<T>,
  options?: Partial<
    Omit<CustomWidgetRegistration<T>, 'name' | 'factory' | 'matcher'>
  >
): CustomWidgetRegistration<T> {
  return {
    name: widgetName,
    factory,
    displayName: options?.displayName || widgetName,
    priority: options?.priority ?? 100, // High priority for explicit matches
    ...options,
  }
}

/**
 * Create a custom widget registration that matches by schema format
 *
 * @example
 * ```typescript
 * forFormat('email', myEmailWidget)
 * // Matches ANY schema with: { format: 'email' }
 * ```
 */
export function forFormat<T = unknown>(
  format: string,
  factory: WidgetFactory<T>,
  options?: Partial<Omit<CustomWidgetRegistration<T>, 'factory' | 'matcher'>>
): CustomWidgetRegistration<T> {
  return {
    name: options?.name || `custom-${format}`,
    factory,
    displayName: options?.displayName || `${format} widget`,
    priority: options?.priority ?? 75,
    matcher: ctx => {
      const schema = ctx.definition as JSONSchema
      return schema.format === format
    },
    ...options,
  }
}

/**
 * Create a custom widget registration that matches by type + format combination
 *
 * @example
 * ```typescript
 * forTypeAndFormat('string', 'uuid', myUuidWidget)
 * // Matches schema: { type: 'string', format: 'uuid' }
 * ```
 */
export function forTypeAndFormat<T = unknown>(
  type: string,
  format: string,
  factory: WidgetFactory<T>,
  options?: Partial<Omit<CustomWidgetRegistration<T>, 'factory' | 'matcher'>>
): CustomWidgetRegistration<T> {
  return {
    name: options?.name || `custom-${type}-${format}`,
    factory,
    displayName: options?.displayName || `${type}:${format} widget`,
    priority: options?.priority ?? 80,
    matcher: ctx => {
      const schema = ctx.definition as JSONSchema
      return schema.type === type && schema.format === format
    },
    ...options,
  }
}

/**
 * Create a diagnostic custom widget registration for debugging custom widget matching.
 *
 * This utility helps diagnose issues where custom widgets aren't being matched as expected.
 * It logs detailed information about each property that's being processed, including:
 * - Property name and path
 * - Schema type
 * - Whether the widgetRegistry is available
 * - Custom matcher results
 *
 * @example
 * ```typescript
 * const customWidgets = [
 *   // Add the diagnostic widget first to trace all properties
 *   createDiagnosticWidget({
 *     logPrefix: 'CUSTOM_WIDGET_DEBUG',
 *     filterFn: (ctx) => true, // Log all properties
 *   }),
 *   // Then add your actual custom widgets
 *   myCustomWidget,
 * ]
 * ```
 */
export function createDiagnosticWidget<T = unknown>(options?: {
  /** Prefix for log messages (default: 'WIDGET_DIAG') */
  logPrefix?: string
  /** Filter function to control which properties are logged */
  filterFn?: (ctx: SchemaContext) => boolean
  /** Callback function called for each processed property */
  onProcess?: (info: {
    name: string | undefined
    path: string[]
    type: string | undefined
    hasRegistry: boolean
    definition: unknown
  }) => void
}): CustomWidgetRegistration<T> {
  const prefix = options?.logPrefix ?? 'WIDGET_DIAG'
  const filterFn = options?.filterFn ?? (() => true)

  return {
    name: '__diagnostic-widget__',
    factory: () => null as unknown as Renderable,
    displayName: 'Diagnostic Widget (never matches)',
    priority: -1000, // Very low priority, should never actually match
    matcher: ctx => {
      if (!filterFn(ctx)) return false

      const def = ctx.definition as JSONSchema | undefined
      const info = {
        name: ctx.name,
        path: ctx.path.map(String),
        type: def?.type as string | undefined,
        hasRegistry: ctx.widgetRegistry !== undefined,
        definition: def,
      }

      // Log to console for debugging
      console.log(
        `[${prefix}] name="${info.name ?? 'ROOT'}" path=[${info.path.join(', ')}] type="${info.type ?? 'unknown'}" hasRegistry=${info.hasRegistry}`
      )

      // Call the optional callback
      options?.onProcess?.(info)

      // Always return false - this is for diagnostics only
      return false
    },
  }
}
