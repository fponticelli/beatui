import type { Renderable } from '@tempots/dom'
import { html, attr } from '@tempots/dom'
import type { Controller } from '../../form'
import type { SchemaContext, JSONSchemaDefinition } from '../schema-context'
import type { WidgetFactory } from './widget-customization'

/**
 * Helper function to apply dynamic attributes safely
 * Only handles the attributes we actually use to avoid complex union types
 */
function applyAttributes(attrs: Record<string, string>): Renderable[] {
  const result: Renderable[] = []

  if (attrs.class) {
    result.push(attr.class(attrs.class))
  }

  if (attrs.style) {
    result.push(attr.style(attrs.style))
  }

  if (attrs.id) {
    result.push(attr.id(attrs.id))
  }

  if (attrs.title) {
    result.push(attr.title(attrs.title))
  }

  return result
}

/**
 * Widget composition configuration
 */
export interface WidgetComposition {
  /** Layout type for composition */
  layout: 'horizontal' | 'vertical' | 'grid' | 'tabs' | 'accordion' | 'custom'
  /** Widgets to compose */
  widgets: ComposedWidget[]
  /** Layout-specific options */
  layoutOptions?: {
    /** Grid columns (for grid layout) */
    columns?: number
    /** Gap between widgets */
    gap?: string
    /** Alignment */
    align?: 'start' | 'center' | 'end' | 'stretch'
    /** Custom CSS classes */
    className?: string
  }
  /** Conditional composition rules */
  conditions?: CompositionCondition[]
}

/**
 * Individual widget in a composition
 */
export interface ComposedWidget {
  /** Widget type/name */
  type: string
  /** Widget-specific configuration */
  config?: Record<string, unknown>
  /** Widget label/title */
  label?: string
  /** Widget description */
  description?: string
  /** Conditional visibility */
  condition?: string | ((value: unknown, formData: unknown) => boolean)
  /** Layout constraints */
  layout?: {
    /** Grid column span */
    colSpan?: number
    /** Grid row span */
    rowSpan?: number
    /** Flex grow factor */
    grow?: number
    /** Flex shrink factor */
    shrink?: number
    /** Minimum width */
    minWidth?: string
    /** Maximum width */
    maxWidth?: string
  }
  /** Custom styling */
  style?: Record<string, string>
  /** Custom CSS classes */
  className?: string
}

/**
 * Composition condition for dynamic widget selection
 */
export interface CompositionCondition {
  /** Condition to evaluate */
  condition: string | ((value: unknown, formData: unknown) => boolean)
  /** Composition to use when condition is true */
  then: WidgetComposition
  /** Composition to use when condition is false */
  else?: WidgetComposition
}

/**
 * Widget composition renderer
 */
export class WidgetComposer {
  private widgetFactories = new Map<string, WidgetFactory>()

  /**
   * Register a widget factory for composition
   */
  registerWidget(name: string, factory: WidgetFactory): void {
    this.widgetFactories.set(name, factory)
  }

  /**
   * Unregister a widget factory
   */
  unregisterWidget(name: string): void {
    this.widgetFactories.delete(name)
  }

  /**
   * Render a composed widget
   */
  renderComposition(
    composition: WidgetComposition,
    controller: Controller<unknown>,
    ctx: SchemaContext
  ): Renderable {
    // Evaluate conditions first
    const effectiveComposition = this.evaluateConditions(
      composition,
      controller.signal.value,
      controller.signal.value // Simplified - would be full form data
    )

    // Filter visible widgets
    const visibleWidgets = effectiveComposition.widgets.filter(widget =>
      this.evaluateWidgetCondition(
        widget,
        controller.signal.value,
        controller.signal.value
      )
    )

    // Render widgets

    const renderedWidgets = visibleWidgets.map(widget =>
      this.renderWidget(widget, controller, ctx)
    )

    // Apply layout
    return this.applyLayout(
      effectiveComposition.layout,
      renderedWidgets,
      effectiveComposition.layoutOptions
    )
  }

  /**
   * Evaluate composition conditions
   */
  private evaluateConditions(
    composition: WidgetComposition,
    value: unknown,
    formData: unknown
  ): WidgetComposition {
    if (!composition.conditions || composition.conditions.length === 0) {
      return composition
    }

    for (const condition of composition.conditions) {
      const conditionMet = this.evaluateCondition(
        condition.condition,
        value,
        formData
      )

      if (conditionMet) {
        return condition.then
      } else if (condition.else) {
        return condition.else
      }
    }

    return composition
  }

  /**
   * Evaluate widget visibility condition
   */
  private evaluateWidgetCondition(
    widget: ComposedWidget,
    value: unknown,
    formData: unknown
  ): boolean {
    if (!widget.condition) return true

    return this.evaluateCondition(widget.condition, value, formData)
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(
    condition: string | ((value: unknown, formData: unknown) => boolean),
    value: unknown,
    formData: unknown
  ): boolean {
    if (typeof condition === 'function') {
      try {
        return condition(value, formData)
      } catch (error) {
        console.warn('Error evaluating widget condition:', error)
        return false
      }
    }

    // Simple string condition evaluation
    // In a real implementation, this would use a proper expression evaluator
    if (condition === 'truthy') return Boolean(value)
    if (condition === 'falsy') return !value
    if (condition.startsWith('equals:')) {
      const expectedValue = condition.slice(7)
      return String(value) === expectedValue
    }

    return Boolean(value)
  }

  /**
   * Render an individual widget
   */
  private renderWidget(
    widget: ComposedWidget,
    controller: Controller<unknown>,
    ctx: SchemaContext
  ): Renderable {
    const factory = this.widgetFactories.get(widget.type)
    if (!factory) {
      console.warn(`Widget factory not found: ${widget.type}`)
      return html.div(
        attr.class('bc-widget-error'),
        `Unknown widget: ${widget.type}`
      )
    }

    // Create widget with configuration
    const renderedWidget = factory({
      controller,
      ctx,
      options: widget.config,
    })

    // Wrap with layout constraints and styling
    return this.wrapWidget(renderedWidget, widget)
  }

  /**
   * Wrap widget with layout constraints and styling
   */
  private wrapWidget(widget: Renderable, config: ComposedWidget): Renderable {
    const wrapperAttrs: Record<string, string> = {}
    const wrapperStyles: string[] = []

    // Apply layout constraints
    if (config.layout) {
      const layout = config.layout

      if (layout.colSpan)
        wrapperStyles.push(`grid-column: span ${layout.colSpan}`)
      if (layout.rowSpan) wrapperStyles.push(`grid-row: span ${layout.rowSpan}`)
      if (layout.grow) wrapperStyles.push(`flex-grow: ${layout.grow}`)
      if (layout.shrink) wrapperStyles.push(`flex-shrink: ${layout.shrink}`)
      if (layout.minWidth) wrapperStyles.push(`min-width: ${layout.minWidth}`)
      if (layout.maxWidth) wrapperStyles.push(`max-width: ${layout.maxWidth}`)
    }

    // Apply custom styles
    if (config.style) {
      for (const [property, value] of Object.entries(config.style)) {
        wrapperStyles.push(`${property}: ${value}`)
      }
    }

    // Set attributes
    if (config.className) {
      wrapperAttrs.class = config.className
    }

    if (wrapperStyles.length > 0) {
      wrapperAttrs.style = wrapperStyles.join('; ')
    }

    // Create wrapper if needed
    const needsWrapper =
      Object.keys(wrapperAttrs).length > 0 || config.label || config.description

    if (!needsWrapper) {
      return widget
    }

    return html.div(
      ...applyAttributes(wrapperAttrs),

      // Label
      config.label &&
        html.label(attr.class('bc-composed-widget__label'), config.label),

      // Widget
      widget,

      // Description
      config.description &&
        html.div(
          attr.class('bc-composed-widget__description'),
          config.description
        )
    )
  }

  /**
   * Apply layout to rendered widgets
   */
  private applyLayout(
    layout: WidgetComposition['layout'],
    widgets: Renderable[],
    options?: WidgetComposition['layoutOptions']
  ): Renderable {
    const containerAttrs: Record<string, string> = {}
    const containerStyles: string[] = []

    // Apply layout-specific styling
    switch (layout) {
      case 'horizontal':
        containerStyles.push('display: flex', 'flex-direction: row')
        if (options?.align)
          containerStyles.push(`align-items: ${options.align}`)
        break

      case 'vertical':
        containerStyles.push('display: flex', 'flex-direction: column')
        if (options?.align)
          containerStyles.push(`align-items: ${options.align}`)
        break

      case 'grid':
        containerStyles.push('display: grid')
        if (options?.columns) {
          containerStyles.push(
            `grid-template-columns: repeat(${options.columns}, 1fr)`
          )
        }
        break

      case 'tabs':
        // Tabs layout would require more complex implementation
        containerStyles.push('display: block')
        break

      case 'accordion':
        // Accordion layout would require more complex implementation
        containerStyles.push('display: block')
        break

      case 'custom':
        // Custom layout relies on CSS classes
        break
    }

    // Apply gap
    if (options?.gap) {
      containerStyles.push(`gap: ${options.gap}`)
    }

    // Apply custom classes
    if (options?.className) {
      containerAttrs.class = options.className
    }

    // Set container styles
    if (containerStyles.length > 0) {
      containerAttrs.style = containerStyles.join('; ')
    }

    return html.div(
      attr.class('bc-composed-widget'),
      attr.class(`bc-composed-widget--${layout}`),
      ...applyAttributes(containerAttrs),
      ...widgets
    )
  }
}

/**
 * Global widget composer instance
 */
export const globalWidgetComposer = new WidgetComposer()

/**
 * Extract widget composition from schema x:ui
 */
export function getWidgetComposition(
  schema: JSONSchemaDefinition
): WidgetComposition | undefined {
  if (typeof schema === 'boolean') return undefined

  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (!xui || !xui.composition) return undefined

  const comp = xui.composition as Record<string, unknown>

  if (!comp.layout || !Array.isArray(comp.widgets)) {
    return undefined
  }

  return {
    layout: comp.layout as WidgetComposition['layout'],
    widgets: comp.widgets as ComposedWidget[],
    layoutOptions: comp.layoutOptions as WidgetComposition['layoutOptions'],
    conditions: comp.conditions as CompositionCondition[],
  }
}

/**
 * Helper to create a simple horizontal composition
 */
export function createHorizontalComposition(
  widgets: Array<{
    type: string
    config?: Record<string, unknown>
    label?: string
  }>,
  options?: { gap?: string; align?: 'start' | 'center' | 'end' | 'stretch' }
): WidgetComposition {
  return {
    layout: 'horizontal',
    widgets: widgets.map(w => ({
      type: w.type,
      config: w.config,
      label: w.label,
    })),
    layoutOptions: options,
  }
}

/**
 * Helper to create a simple grid composition
 */
export function createGridComposition(
  widgets: Array<{
    type: string
    config?: Record<string, unknown>
    label?: string
    colSpan?: number
    rowSpan?: number
  }>,
  columns: number,
  options?: { gap?: string }
): WidgetComposition {
  return {
    layout: 'grid',
    widgets: widgets.map(w => ({
      type: w.type,
      config: w.config,
      label: w.label,
      layout: {
        colSpan: w.colSpan,
        rowSpan: w.rowSpan,
      },
    })),
    layoutOptions: {
      columns,
      ...options,
    },
  }
}
