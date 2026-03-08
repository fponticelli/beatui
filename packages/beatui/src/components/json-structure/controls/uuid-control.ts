/**
 * UUID Control for JSON Structure
 *
 * Handles uuid type with UuidInput
 */

import { Renderable } from '@tempots/dom'
import {
  Control,
  UuidInput,
  transformEmptyStringToUndefined,
  type Controller,
} from '../../form'
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
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  }
}

/**
 * Control for uuid type
 */
export function StructureUuidControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<string | undefined>
}): Renderable {
  const options = createInputOptions(ctx)

  // Use UuidInput with empty string to undefined transform
  return Control(UuidInput, {
    ...options,
    controller: transformEmptyStringToUndefined(controller),
  })
}
