import { Fragment, Renderable, Value } from '@tempots/dom'
import { Control, CheckboxInput, type Controller } from '../../form'
import { NullableResetAfter } from '../../form/input/nullable-utils'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { resolveWidget } from '../widgets/utils'
import {
  definitionToInputWrapperOptions,
  shouldHideWriteOnly,
  shouldDisableControl,
  tryResolveCustomWidget,
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

  // Try to resolve a custom widget first
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller: controller as unknown as Controller<unknown>,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    disabled: shouldDisableControl(ctx),
  }

  // Use non-nullable boolean by default
  const base = Control(CheckboxInput, {
    ...baseOptions,
    controller: controller as unknown as Controller<boolean>,
  })

  // Use nullable controls (with reset button) for:
  // 1. Explicitly nullable schemas, OR
  // 2. Optional primitive fields that don't show presence toggles
  // Return base (non-nullable) only when NOT nullable AND (required OR has presence toggle)
  if (!ctx.isNullable && (!ctx.isOptional || ctx.shouldShowPresenceToggle))
    return base

  // Use undefined (not null) as the cleared value for optional-only properties
  // that aren't explicitly nullable in the schema
  const useUndefinedForClear = !ctx.isNullable

  // Nullable/optional boolean: add a small clear button that sets the value to null/undefined
  return Control(CheckboxInput, {
    ...baseOptions,
    controller: controller as unknown as Controller<boolean>,
    after: NullableResetAfter(
      controller.signal as unknown as Value<boolean | null>,
      (controller as unknown as Controller<boolean | null>).disabled,
      () =>
        (
          controller as unknown as Controller<boolean | null | undefined>
        ).change(useUndefinedForClear ? undefined : null)
    ),
  })
}
