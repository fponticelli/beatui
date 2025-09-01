import { Fragment, Renderable, Value } from '@tempots/dom'
import { Control, CheckboxInput, type Controller } from '../../form'
import { NullableResetAfter } from '../../form/input/nullable-utils'
import type { SchemaContext } from '../schema-context'
import { definitionToInputWrapperOptions } from './shared-utils'

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
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    return Fragment()
  }

  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    // Disable input if readOnly (unless overridden) or deprecated
    disabled: (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated,
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
      controller.value as unknown as Value<boolean | null>,
      (controller as unknown as Controller<boolean | null>).disabled,
      v => (controller as unknown as Controller<boolean | null>).change(v)
    ),
  })
}
