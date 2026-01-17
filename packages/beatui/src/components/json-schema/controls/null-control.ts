import { Renderable, WithElement } from '@tempots/dom'
import type { Controller } from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { tryResolveCustomWidget } from './shared-utils'
import { resolveWidget } from '../widgets/utils'

/**
 * Control for null schemas
 */
export function JSONSchemaNull({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<null>
}): Renderable {
  // Try to resolve a custom widget first
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller: controller as unknown as Controller<unknown>,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  return WithElement(() => {
    controller.change(null)
  })
}
