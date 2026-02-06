/**
 * Tuple Control for JSON Structure
 *
 * Handles tuple type with fixed-length ordered elements.
 * Each element has a named definition, but serializes to a JSON array in the specified order.
 */

import { Renderable, html, attr } from '@tempots/dom'
import { ArrayController } from '../../form'
import type { StructureContext } from '../structure-context'
import type { TupleTypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'
import { createInputOptions, makeDefaultValue } from './control-utils'

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
