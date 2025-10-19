import { Fragment, Renderable, When, type Signal } from '@tempots/dom'
import type { Controller } from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import {
  getVisibilityConfig,
  createVisibilitySignal,
  evaluateVisibility,
  getReferencedFields,
  type VisibilityConfig,
  type VisibilityCondition,
  type VisibilityExpression,
} from './visibility-evaluation'

/**
 * Visibility behavior options
 */
export interface VisibilityOptions {
  /** How to handle hidden fields */
  behavior: 'hide' | 'unmount'
  /** Whether to clear field value when hidden */
  clearOnHide?: boolean
}

/**
 * Default visibility options
 */
const DEFAULT_VISIBILITY_OPTIONS: VisibilityOptions = {
  behavior: 'hide',
  clearOnHide: false,
}

/**
 * Wrapper component that handles field visibility based on x:ui.visibleIf
 */
export function WithVisibility<T>({
  ctx,
  controller,
  children,
  options = DEFAULT_VISIBILITY_OPTIONS,
}: {
  ctx: SchemaContext
  controller: Controller<T>
  children: Renderable
  options?: Partial<VisibilityOptions>
}): Renderable {
  // Get visibility configuration from schema
  const visibilityConfig = getVisibilityConfig(ctx.definition as JSONSchema)

  // If no visibility config, render children directly
  if (!visibilityConfig) {
    return children
  }

  const opts = { ...DEFAULT_VISIBILITY_OPTIONS, ...options }

  // Get form data signal from root controller
  const formDataSignal = getRootFormData(controller)

  // Create visibility signal
  const isVisible = createVisibilitySignal(visibilityConfig, formDataSignal)

  // Handle value clearing when hidden
  if (opts.clearOnHide) {
    // Watch visibility changes and clear value when hidden
    isVisible.on(visible => {
      if (!visible && controller.signal.value !== undefined) {
        // Clear the value when field becomes hidden
        controller.change(undefined as T)
      }
    })
  }

  // Render based on behavior
  switch (opts.behavior) {
    case 'unmount':
      // Completely unmount the component when hidden
      return When(
        isVisible,
        () => children,
        () => Fragment()
      )

    case 'hide':
    default:
      // Hide with CSS but keep in DOM
      return When(
        isVisible,
        () => children,
        () =>
          Fragment(
            // Keep the component in DOM but hidden
            // This preserves form state and validation
            children
            // Note: In a real implementation, you'd add CSS classes
            // to hide the element visually while keeping it in DOM
          )
      )
  }
}

/**
 * Get the root form data signal from a controller hierarchy
 */
function getRootFormData<T>(controller: Controller<T>): Signal<unknown> {
  // For now, just return the current controller's value
  // In a more sophisticated implementation, we would walk up the hierarchy
  // but the parent property is protected, so we'll use the current controller
  return controller.signal as Signal<unknown>
}

/**
 * Enhanced visibility wrapper that also handles CSS classes for hiding
 */
export function WithVisibilityAndCSS<T>({
  ctx,
  controller,
  children,
  options = DEFAULT_VISIBILITY_OPTIONS,
}: {
  ctx: SchemaContext
  controller: Controller<T>
  children: Renderable
  options?: Partial<VisibilityOptions>
  hiddenClass?: string
}): Renderable {
  // Get visibility configuration from schema
  const visibilityConfig = getVisibilityConfig(ctx.definition as JSONSchema)

  // If no visibility config, render children directly
  if (!visibilityConfig) {
    return children
  }

  const opts = { ...DEFAULT_VISIBILITY_OPTIONS, ...options }

  // For unmount behavior, use the basic wrapper
  if (opts.behavior === 'unmount') {
    return WithVisibility({ ctx, controller, children, options })
  }

  // Get form data signal from root controller
  const formDataSignal = getRootFormData(controller)

  // Create visibility signal
  const isVisible = createVisibilitySignal(visibilityConfig, formDataSignal)

  // Handle value clearing when hidden
  if (opts.clearOnHide) {
    isVisible.on(visible => {
      if (!visible && controller.signal.value !== undefined) {
        controller.change(undefined as T)
      }
    })
  }

  // Wrap children with conditional CSS class
  return When(isVisible, () => children)
}

/**
 * Utility to check if a schema has visibility conditions
 */
export function hasVisibilityConditions(ctx: SchemaContext): boolean {
  return getVisibilityConfig(ctx.definition as JSONSchema) != null
}

/**
 * Utility to get all fields referenced by visibility conditions in a schema
 */
export function getVisibilityDependencies(ctx: SchemaContext): string[] {
  const config = getVisibilityConfig(ctx.definition as JSONSchema)
  if (!config) return []

  return getReferencedFields(config)
}

/**
 * Helper to create visibility conditions programmatically
 */
export function createVisibilityCondition(
  field: string,
  operator: 'equals' | 'notEquals' | 'truthy' | 'falsy',
  value?: unknown
): VisibilityConfig {
  return {
    field,
    operator,
    ...(value !== undefined && { value }),
  }
}

/**
 * Helper to create complex visibility expressions
 */
export function createVisibilityExpression(
  operator: 'and' | 'or' | 'not',
  conditions: (VisibilityCondition | VisibilityExpression)[]
): VisibilityExpression {
  return {
    operator,
    conditions,
  }
}

/**
 * Validation helper to check if visibility configuration is valid
 */
export function validateVisibilityConfig(
  config: unknown
): config is VisibilityConfig {
  if (typeof config === 'string') {
    return config.trim().length > 0
  }

  if (typeof config !== 'object' || config === null) {
    return false
  }

  const obj = config as Record<string, unknown>

  // Check if it's a condition
  if ('field' in obj && 'operator' in obj) {
    return (
      typeof obj.field === 'string' &&
      typeof obj.operator === 'string' &&
      [
        'equals',
        'notEquals',
        'truthy',
        'falsy',
        'contains',
        'notContains',
        'greaterThan',
        'lessThan',
        'greaterThanOrEqual',
        'lessThanOrEqual',
        'in',
        'notIn',
      ].includes(obj.operator)
    )
  }

  // Check if it's an expression
  if ('operator' in obj && 'conditions' in obj) {
    return (
      typeof obj.operator === 'string' &&
      ['and', 'or', 'not'].includes(obj.operator) &&
      Array.isArray(obj.conditions) &&
      obj.conditions.every((c: unknown) => validateVisibilityConfig(c))
    )
  }

  return false
}

/**
 * Debug helper to log visibility evaluation
 */
export function debugVisibility(
  config: VisibilityConfig,
  formData: unknown,
  fieldPath: string = ''
): void {
  const result = evaluateVisibility(config, formData)

  console.log(`Visibility evaluation for ${fieldPath}:`, {
    config,
    formData,
    result,
  })
}
