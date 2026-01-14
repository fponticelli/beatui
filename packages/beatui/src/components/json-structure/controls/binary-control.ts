/**
 * Binary Control for JSON Structure
 *
 * Handles binary type with FileInput
 */

import { Renderable } from '@tempots/dom'
import { Control, FileInput, type Controller } from '../../form'
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
 * Control for binary type
 */
export function StructureBinaryControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<File | undefined>
}): Renderable {
  const options = createInputOptions(ctx)

  // Use FileInput for binary data
  return Control(FileInput, {
    ...options,
    controller,
  })
}
