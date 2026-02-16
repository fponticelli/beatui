/**
 * Set Control for JSON Structure
 *
 * Handles set type with items definition, uniqueness validation, and minItems/maxItems constraints
 */

import {
  attr,
  computedOf,
  Fragment,
  html,
  Renderable,
  When,
} from '@tempots/dom'
import { ListControl, ArrayController } from '../../form'
import { Label } from '../../typography'
import type { StructureContext } from '../structure-context'
import type { SetTypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'

import { createInputOptions, makeDefaultValue } from './control-utils'

/**
 * Control for set type (array with uniqueness enforcement)
 */
export function StructureSetControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: ArrayController<unknown[]>
}): Renderable {
  const definition = ctx.definition as SetTypeDefinition

  // Type guard to ensure we have a set definition
  if (definition.type !== 'set' || !('items' in definition)) {
    console.warn('StructureSetControl requires a SetTypeDefinition')
    return html.div('Invalid set definition')
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

  // Get duplicate indices for highlighting
  const duplicateIndices = computedOf(controller.signal)(value => {
    if (!value || value.length === 0) return new Set<number>()

    const seen = new Map<string, number>()
    const duplicates = new Set<number>()

    for (let i = 0; i < value.length; i++) {
      const key = JSON.stringify(value[i])
      if (seen.has(key)) {
        duplicates.add(seen.get(key)!)
        duplicates.add(i)
      } else {
        seen.set(key, i)
      }
    }
    return duplicates
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

      // Check if this item is a duplicate
      const isDuplicate = duplicateIndices.map(indices => indices.has(index))

      const control = StructureGenericControl({
        ctx: ctx
          .with({
            definition: itemsSchema,
            suppressLabel: true,
          })
          .append(index),
        controller: item,
      })

      // Add duplicate indicator if needed
      return Fragment(
        control,
        When(isDuplicate, () =>
          Label(
            attr.class('bc-json-structure-set-error'),
            'Duplicate value - sets must contain unique items'
          )
        )
      )
    },
  })
}
