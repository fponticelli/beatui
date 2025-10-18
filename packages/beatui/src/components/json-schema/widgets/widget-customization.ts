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
    const currentValue = controller.value.value

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
      const mode = options?.mode as 'default' | 'compact' | undefined

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
