/**
 * URI Control for JSON Structure
 *
 * Handles uri type with URLInput
 */

import { Renderable } from '@tempots/dom'
import {
  Control,
  UrlInput,
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
    placeholder: 'https://example.com',
  }
}

/**
 * Control for uri type
 */
export function StructureUriControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<string | undefined>
}): Renderable {
  const options = createInputOptions(ctx)

  // Use UrlInput with empty string to undefined transform
  return Control(UrlInput, {
    ...options,
    controller: transformEmptyStringToUndefined(controller),
  })
}
