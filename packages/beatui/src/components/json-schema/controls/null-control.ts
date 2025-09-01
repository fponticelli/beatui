import { Renderable, WithElement } from '@tempots/dom'
import type { Controller } from '../../form'
import type { SchemaContext } from '../schema-context'

/**
 * Control for null schemas
 */
export function JSONSchemaNull({
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<null>
}): Renderable {
  return WithElement(() => {
    controller.change(null)
  })
}
