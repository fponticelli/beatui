/**
 * Boolean Control for JSON Structure
 *
 * Handles boolean type with CheckboxInput
 */

import { Renderable, Value } from '@tempots/dom'
import { Control, CheckboxInput, type Controller } from '../../form'
import { NullableResetAfter } from '../../form/input/nullable-utils'
import type { StructureContext } from '../structure-context'
import { withDeprecationBadge } from './deprecation-utils'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext) {
  return {
    label: ctx.suppressLabel
      ? undefined
      : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
  }
}

/**
 * Control for boolean type
 */
export function StructureBooleanControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<boolean | null>
}): Renderable {
  const options = createInputOptions(ctx)

  // Use non-nullable boolean by default
  const base = Control(CheckboxInput, {
    ...options,
    controller: controller as unknown as Controller<boolean>,
  })

  // For nullable types, add a reset button
  if (!ctx.isNullable) {
    return base
  }

  // Nullable boolean: add a small clear button that sets the value to null
  return Control(CheckboxInput, {
    ...options,
    controller: controller as unknown as Controller<boolean>,
    after: NullableResetAfter(
      controller.signal as unknown as Value<boolean | null>,
      (controller as unknown as Controller<boolean | null>).disabled,
      v => (controller as unknown as Controller<boolean | null>).change(v)
    ),
  })
}
