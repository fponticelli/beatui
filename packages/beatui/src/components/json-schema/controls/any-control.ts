import { Renderable } from '@tempots/dom'
import type { Controller } from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { JSONSchemaUnion } from './union-control'
import { tryResolveCustomWidget } from './shared-utils'
import { resolveWidget } from '../widgets/utils'

/**
 * Control for any/unknown type schemas
 */
export function JSONSchemaAny({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): Renderable {
  // Try to resolve a custom widget first
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  if (ctx.definition === true) {
    return JSONSchemaAny({
      ctx: ctx.with({
        definition: {
          type: ['string', 'number', 'object', 'array', 'boolean', 'null'],
        },
      }),
      controller: controller as unknown as Controller<unknown>,
    })
  }

  return JSONSchemaUnion({
    ctx: ctx.with({
      definition: {
        ...ctx.definition,
        type: ['string', 'number', 'object', 'array', 'boolean', 'null'],
      },
    }),
    controller: controller as unknown as Controller<unknown>,
  })
}
