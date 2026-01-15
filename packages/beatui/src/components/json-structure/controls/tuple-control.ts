/**
 * Tuple Control for JSON Structure
 *
 * Handles tuple type with fixed-length ordered elements.
 * Each element has a named definition, but serializes to a JSON array in the specified order.
 */

import { Renderable, html, attr } from '@tempots/dom'
import { ArrayController } from '../../form'
import type { StructureContext } from '../structure-context'
import type { TupleTypeDefinition, TypeDefinition } from '../structure-types'
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
 * Get the default value for a tuple element based on its type definition
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
 * Control for tuple type
 *
 * Tuples are fixed-length arrays where each position has a specific type.
 * The `tuple` array defines the order of elements by referencing keys in `properties`.
 */
export function StructureTupleControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: ArrayController<unknown[]>
}): Renderable {
  const definition = ctx.definition as TupleTypeDefinition

  // Type guard to ensure we have a tuple definition
  if (
    definition.type !== 'tuple' ||
    !('tuple' in definition) ||
    !('properties' in definition)
  ) {
    console.warn('StructureTupleControl requires a TupleTypeDefinition')
    return html.div('Invalid tuple definition')
  }

  const tupleOrder = definition.tuple
  const properties = definition.properties

  // Ensure the array is initialized with the correct length
  const currentValue = controller.signal.value
  if (
    !Array.isArray(currentValue) ||
    currentValue.length !== tupleOrder.length
  ) {
    // Initialize array with default values in the correct order
    const initialValues = tupleOrder.map(key => {
      const propDef = properties[key]
      return propDef ? makeDefaultValue(propDef) : undefined
    })
    controller.change(initialValues as unknown[])
  }

  const inputOptions = createInputOptions(ctx)

  return html.div(
    attr.class('bc-json-structure-tuple'),

    // Optional label and description
    inputOptions.label &&
      html.label(
        attr.class('bc-json-structure-tuple-label'),
        inputOptions.label,
        inputOptions.required &&
          html.span(attr.class('bc-required-indicator'), '*')
      ),
    inputOptions.description &&
      html.div(
        attr.class('bc-json-structure-tuple-description'),
        inputOptions.description
      ),

    // Render tuple elements
    html.div(
      attr.class('bc-json-structure-tuple-elements'),
      ...tupleOrder.map((key, index) => {
        const propDef = properties[key]
        if (!propDef) {
          console.warn(
            `Tuple element "${key}" at index ${index} not found in properties`
          )
          return html.div(
            attr.class('bc-json-structure-tuple-element'),
            html.span(`Missing definition for "${key}"`)
          )
        }

        const itemController = controller.item(index)
        const elementLabel = propDef.name || key

        return html.div(
          attr.class('bc-json-structure-tuple-element'),

          // Element position indicator and label
          html.div(
            attr.class('bc-json-structure-tuple-element-header'),
            html.span(
              attr.class('bc-json-structure-tuple-position'),
              `[${index}]`
            ),
            html.span(
              attr.class('bc-json-structure-tuple-element-name'),
              elementLabel
            )
          ),

          // Element control
          html.div(
            attr.class('bc-json-structure-tuple-element-control'),
            StructureGenericControl({
              ctx: ctx
                .with({
                  definition: propDef,
                  suppressLabel: true, // Label already shown in header
                })
                .append(index),
              controller: itemController,
            })
          )
        )
      })
    )
  )
}
