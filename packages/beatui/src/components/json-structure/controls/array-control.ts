/**
 * Array Control for JSON Structure
 *
 * Handles array type with items definition and minItems/maxItems constraints
 */

import { Renderable, computedOf, html } from '@tempots/dom'
import { ListControl, ArrayController } from '../../form'
import type { StructureContext } from '../structure-context'
import type { ArrayTypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'
import { createInputOptions, makeDefaultValue } from './control-utils'

/**
 * Control for array type
 */
export function StructureArrayControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: ArrayController<unknown[]>
}): Renderable {
  const definition = ctx.definition as ArrayTypeDefinition

  // Type guard to ensure we have an array definition
  if (definition.type !== 'array' || !('items' in definition)) {
    console.warn('StructureArrayControl requires an ArrayTypeDefinition')
    return html.div('Invalid array definition')
  }

  const itemsSchema = definition.items
  const minItems = definition.minItems ?? 0
  const maxItems = definition.maxItems ?? Infinity

  // Determine if add button should be disabled based on maxItems constraint
  const canAddItems = computedOf(controller.signal)(value => {
    const currentLength = value?.length ?? 0
    return currentLength < maxItems
  })

  // Determine if remove button should be disabled based on minItems
  const canRemoveItems = computedOf(controller.signal)(value => {
    const currentLength = value?.length ?? 0
    return currentLength > minItems
  })

  return ListControl({
    ...createInputOptions(ctx),
    controller,
    createItem: () => makeDefaultValue(itemsSchema),
    showAdd: true,
    addDisabled: computedOf(canAddItems)(v => !v || ctx.readOnly),
    showRemove: true,
    removeDisabled: computedOf(canRemoveItems)(v => !v || ctx.readOnly),
    element: payload => {
      const index = payload.position.index
      const item = payload.item

      return StructureGenericControl({
        ctx: ctx
          .with({
            definition: itemsSchema,
            suppressLabel: true,
          })
          .append(index),
        controller: item,
      })
    },
  })
}
