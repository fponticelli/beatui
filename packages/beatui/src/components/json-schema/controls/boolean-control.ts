import { Fragment, Renderable, Value } from '@tempots/dom'
import { Control, CheckboxInput, type Controller } from '../../form'
import { NullableResetAfter } from '../../form/input/nullable-utils'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { resolveWidget } from '../widgets/utils'
import { globalWidgetRegistry } from '../widgets/widget-customization'
import {
  definitionToInputWrapperOptions,
  shouldHideWriteOnly,
  shouldDisableControl,
} from './shared-utils'

/**
 * Control for boolean schemas
 */
export function JSONSchemaBoolean({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<boolean | null>
}): Renderable {
  // Handle writeOnly fields - hide them unless explicitly shown
  if (shouldHideWriteOnly(ctx)) {
    return Fragment()
  }

  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const widget = resolved?.widget

  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    disabled: shouldDisableControl(ctx),
  }

  // Step 1: Check for explicit x:ui widget in custom registry
  if (widget != null && ctx.widgetRegistry) {
    const customWidgetReg = ctx.widgetRegistry.get(widget)
    if (customWidgetReg) {
      return customWidgetReg.factory({
        controller: controller as unknown as Controller<unknown>,
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
        controller: controller as unknown as Controller<unknown>,
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
        controller: controller as unknown as Controller<unknown>,
        ctx,
        options: resolved?.options,
      })
    }
  }

  // Step 4: Check global registry with matchers
  const globalMatched = globalWidgetRegistry.findBestWidget(ctx)
  if (globalMatched) {
    return globalMatched.registration.factory({
      controller: controller as unknown as Controller<unknown>,
      ctx,
      options: resolved?.options,
    })
  }

  // Use non-nullable boolean by default
  const base = Control(CheckboxInput, {
    ...baseOptions,
    controller: controller as unknown as Controller<boolean>,
  })

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (!ctx.isNullable || (ctx.isOptional && !ctx.shouldShowPresenceToggle))
    return base

  // Nullable boolean: add a small clear button that sets the value to null
  return Control(CheckboxInput, {
    ...baseOptions,
    controller: controller as unknown as Controller<boolean>,
    after: NullableResetAfter(
      controller.signal as unknown as Value<boolean | null>,
      (controller as unknown as Controller<boolean | null>).disabled,
      v => (controller as unknown as Controller<boolean | null>).change(v)
    ),
  })
}
