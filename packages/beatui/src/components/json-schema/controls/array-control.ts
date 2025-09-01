import { Renderable } from '@tempots/dom'
import { ListControl, type ArrayController, type Controller } from '../../form'
import type {
  SchemaContext,
  JSONSchema,
  JSONSchemaDefinition,
} from '../schema-context'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
} from './shared-utils'
import { JSONSchemaGenericControl } from './generic-control'

/**
 * Control for array schemas
 */
export function JSONSchemaArray({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: ArrayController<unknown[]>
}): Renderable {
  return ListControl({
    ...definitionToInputWrapperOptions({ ctx }),
    createItem: () =>
      makePlaceholder(ctx.definition as JSONSchema, () => undefined),
    controller,
    element: payload => {
      const item = payload.item as Controller<unknown>
      const index = payload.position.index
      const d = ctx.definition as JSONSchema
      const definition = Array.isArray(d.items)
        ? d.items[payload.position.index]
        : d.items === false
          ? false
          : (d.items ?? {})

      return JSONSchemaGenericControl({
        ctx: ctx
          .with({ definition: definition as JSONSchemaDefinition })
          .append(index),
        controller: item,
      })
    },
  })
}
