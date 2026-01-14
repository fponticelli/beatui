/**
 * Enum and Const Controls for JSON Structure
 *
 * Handles enum selection and const value display
 */

import { Renderable, WithElement, Value, Fragment } from '@tempots/dom'
import { Group } from '../../layout'
import { NativeSelectControl, type Controller } from '../../form'
import { Label, MutedLabel } from '../../typography'
import type { StructureContext } from '../structure-context'
import { withDeprecationBadge } from './deprecation-utils'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext) {
  return {
    label: ctx.suppressLabel ? undefined : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
  }
}

/**
 * Control for enum schemas
 */
export function StructureEnumControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<unknown>
}): Renderable {
  const options = createInputOptions(ctx)

  return NativeSelectControl({
    ...options,
    options: (ctx.enumValues ?? []).map((e: unknown) => ({
      type: 'value',
      value: e,
      label: String(e),
    })),
    controller,
  })
}

/**
 * Control for const schemas
 */
export function StructureConstControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<unknown>
}): Renderable {
  return Fragment(
    WithElement(() => {
      // Set const value on mount
      if (Value.get(controller.signal) !== ctx.constValue) {
        controller.change(ctx.constValue)
      }
    }),
    Group(MutedLabel(ctx.label, ': '), Label(String(ctx.constValue)))
  )
}
