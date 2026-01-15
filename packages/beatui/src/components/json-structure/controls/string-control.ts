/**
 * String Control for JSON Structure
 *
 * Handles string type with TextInput
 */

import { Renderable } from '@tempots/dom'
import {
  Control,
  TextInput,
  transformEmptyStringToUndefined,
  type Controller,
} from '../../form'
import type { StructureContext } from '../structure-context'
import { withDeprecationBadge } from './deprecation-utils'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext) {
  // Use first example as placeholder if available
  const placeholder =
    ctx.examples?.[0] != null ? String(ctx.examples[0]) : undefined

  return {
    label: ctx.suppressLabel
      ? undefined
      : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
    placeholder,
  }
}

/**
 * Control for string type
 */
export function StructureStringControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<string | undefined>
}): Renderable {
  const options = createInputOptions(ctx)

  // Use TextInput with empty string to undefined transform
  return Control(TextInput, {
    ...options,
    controller: transformEmptyStringToUndefined(controller),
  })
}
