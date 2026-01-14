/**
 * Any Control for JSON Structure
 *
 * Handles any type with JSON textarea
 */

import { Renderable } from '@tempots/dom'
import { Control, TextArea, type Controller } from '../../form'
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
    placeholder: 'Enter JSON value',
  }
}

/**
 * Controller transformer to handle JSON serialization
 */
function createJsonController(
  controller: Controller<unknown>
): Controller<string | undefined> {
  return controller.transform(
    // To input: serialize value to JSON string
    v => (v === undefined ? undefined : JSON.stringify(v, null, 2)),
    // From input: parse JSON string back to value
    v => {
      if (v === undefined || v.trim() === '') {
        return undefined
      }
      try {
        return JSON.parse(v)
      } catch (e) {
        // Invalid JSON - return as-is and let validation handle it
        return v as unknown
      }
    }
  )
}

/**
 * Control for any type (JSON textarea)
 */
export function StructureAnyControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<unknown>
}): Renderable {
  const options = createInputOptions(ctx)

  // Use TextArea with JSON serialization
  return Control(TextArea, {
    ...options,
    controller: createJsonController(controller),
  })
}
