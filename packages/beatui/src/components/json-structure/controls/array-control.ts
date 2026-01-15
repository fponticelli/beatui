/**
 * Array Control for JSON Structure
 *
 * Handles array type with items definition and minItems/maxItems constraints
 */

import { Renderable, computedOf, html } from '@tempots/dom'
import { ListControl, ArrayController } from '../../form'
import type { StructureContext } from '../structure-context'
import type { TypeDefinition, ArrayTypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext) {
  return {
    label: ctx.suppressLabel ? undefined : ctx.label,
    description: ctx.description,
    required: ctx.isRequired,
  }
}

/**
 * Get the default value for a new array item based on its type definition
 */
function makeDefaultValue(definition: TypeDefinition): unknown {
  // Use default if provided
  if (definition.default !== undefined) {
    return definition.default
  }

  // Use first example if available
  if (definition.examples && definition.examples.length > 0) {
    return definition.examples[0]
  }

  // Generate empty value based on type
  if (!definition.type) return undefined

  const type = Array.isArray(definition.type)
    ? definition.type[0]
    : definition.type

  if (typeof type === 'object' && '$ref' in type) {
    return undefined // Can't infer value for references
  }

  switch (type) {
    case 'string':
      return ''
    case 'boolean':
      return false
    case 'null':
      return null
    case 'object':
      return {}
    case 'array':
    case 'set':
      return []
    case 'map':
      return {}
    case 'any':
      return undefined
    default:
      // Numeric types
      if (
        type === 'int8' ||
        type === 'int16' ||
        type === 'int32' ||
        type === 'int64' ||
        type === 'int128' ||
        type === 'uint8' ||
        type === 'uint16' ||
        type === 'uint32' ||
        type === 'uint64' ||
        type === 'uint128' ||
        type === 'float' ||
        type === 'double' ||
        type === 'decimal'
      ) {
        return 0
      }
      return undefined
  }
}

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
