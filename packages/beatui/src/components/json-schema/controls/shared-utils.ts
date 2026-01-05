import type { JSONSchema } from '../schema-context'
import type { InputWrapperOptions, Controller } from '../../form'
import type { Renderable } from '@tempots/dom'
import { globalWidgetRegistry } from '../widgets/widget-customization'
import type { ResolvedWidget } from '../widgets/utils'

/**
 * Convert schema definition to input wrapper options
 */
export function definitionToInputWrapperOptions({
  ctx,
}: {
  ctx: import('../schema-context').SchemaContext
}): Partial<InputWrapperOptions> {
  const { examples, default: defaultValue } = ctx
  let { description } = ctx
  if (description == null && examples != null && defaultValue != null) {
    if (Array.isArray(examples)) {
      description = `example: ${examples[0]}`
    } else {
      description = `example: ${examples}`
    }
  }

  // Add deprecated/readOnly/writeOnly indicators to description
  const indicators: string[] = []
  if (ctx.isDeprecated) {
    indicators.push('deprecated')
  }
  if (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) {
    indicators.push('read-only')
  }
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    indicators.push('write-only')
  }

  if (indicators.length > 0) {
    const indicatorText = `(${indicators.join(', ')})`
    description = description
      ? `${description} ${indicatorText}`
      : indicatorText
  }

  return {
    label: ctx.suppressLabel ? undefined : ctx.widgetLabel,
    description,
    required: ctx.isPropertyRequired,
    layout: ctx.horizontal ? 'horizontal' : 'vertical',
  }
}

/**
 * Create placeholder value from schema definition
 */
export function makePlaceholder<T>(
  definition: JSONSchema,
  converter: (value: unknown) => T
) {
  if (definition.default != null) {
    return converter(definition.default)
  }
  if (Array.isArray(definition.examples)) {
    return converter(definition.examples[0])
  }
  if (definition.examples != null) {
    return converter(definition.examples)
  }
  return undefined
}

/**
 * Convert multipleOf to integer step for integer inputs
 */
export function integerMultipleOf(multipleOf?: number) {
  if (multipleOf == null) return 1
  return Math.round(multipleOf)
}

/**
 * Check if a writeOnly field should be hidden
 */
export function shouldHideWriteOnly(
  ctx: import('../schema-context').SchemaContext
): boolean {
  return ctx.isWriteOnly && !ctx.shouldShowWriteOnly
}

/**
 * Determine if a control should be disabled based on readOnly or deprecated status
 */
export function shouldDisableControl(
  ctx: import('../schema-context').SchemaContext
): boolean {
  return (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated
}

/**
 * Try to resolve and render a custom widget following the precedence order:
 * 1. Explicit x:ui widget in custom registry (highest priority)
 * 2. Explicit x:ui widget in global registry
 * 3. Matcher-based custom widgets (by priority)
 * 4. Matcher-based global widgets (lowest priority)
 *
 * Returns the rendered widget if found, or null if no custom widget matches
 */
export function tryResolveCustomWidget({
  ctx,
  controller,
  resolved,
}: {
  ctx: import('../schema-context').SchemaContext
  controller: Controller<unknown>
  resolved: ResolvedWidget | null | undefined
}): Renderable | null {
  const widget = resolved?.widget

  // Step 1: Check for explicit x:ui widget in custom registry
  if (widget != null && ctx.widgetRegistry) {
    const customWidgetReg = ctx.widgetRegistry.get(widget)
    if (customWidgetReg) {
      return customWidgetReg.factory({
        controller,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 2: Check for explicit x:ui widget in global registry
  if (widget != null) {
    const globalWidgetReg = globalWidgetRegistry.get(widget)
    if (globalWidgetReg) {
      return globalWidgetReg.factory({
        controller,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 3: Try matcher-based custom widgets (by priority)
  if (ctx.widgetRegistry) {
    const matchedWidget = ctx.widgetRegistry.findBestWidget(ctx)
    if (matchedWidget) {
      return matchedWidget.registration.factory({
        controller,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 4: Check global registry with matchers
  const globalMatched = globalWidgetRegistry.findBestWidget(ctx)
  if (globalMatched) {
    return globalMatched.registration.factory({
      controller,
      ctx,
      options: resolved?.options,
    })
  }

  // No custom widget found
  return null
}
