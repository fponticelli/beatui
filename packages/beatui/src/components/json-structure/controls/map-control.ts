/**
 * Map Control for JSON Structure
 *
 * Handles map type with key-value pairs and minProperties/maxProperties constraints
 */

import {
  attr,
  html,
  Renderable,
  Value,
  MapSignal,
  Fragment,
  Empty,
} from '@tempots/dom'
import { ObjectController, InputWrapper } from '../../form'
import { Button } from '../../button'
import type { StructureContext } from '../structure-context'
import type { MapTypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'
import { createInputOptions, makeDefaultValue } from './control-utils'

/**
 * Generate a unique key that doesn't exist in the current map
 */
function generateUniqueKey(
  existingKeys: Set<string>,
  baseName = 'key'
): string {
  if (!existingKeys.has(baseName)) return baseName

  let counter = 1
  while (existingKeys.has(`${baseName}${counter}`)) {
    counter++
  }
  return `${baseName}${counter}`
}

/**
 * Control for map type (key-value pairs)
 */
export function StructureMapControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: ObjectController<{ [key: string]: unknown }>
}): Renderable {
  const definition = ctx.definition as MapTypeDefinition

  // Type guard to ensure we have a map definition
  if (definition.type !== 'map' || !('values' in definition)) {
    console.warn('StructureMapControl requires a MapTypeDefinition')
    return html.div('Invalid map definition')
  }

  const valuesSchema = definition.values
  const minProperties = definition.minProperties ?? 0
  const maxProperties = definition.maxProperties ?? Infinity

  // Dynamic entries — MapSignal only for entries that depend on dynamic keys
  const entriesSection = MapSignal(controller.signal, current => {
    const currentKeys = Object.keys(current ?? {})

    if (currentKeys.length === 0) return Empty

    const canRemove = currentKeys.length > minProperties && !ctx.readOnly

    return Fragment(
      ...currentKeys.map(key => {
        const field = controller.field(key)

        return html.div(
          attr.class('bc-json-structure-map-entry'),
          html.div(
            attr.class('bc-json-structure-map-entry-header'),
            html.strong(
              attr.class('bc-json-structure-map-entry-key'),
              `${key}:`
            ),
            Button(
              {
                variant: 'text',
                size: 'xs',
                onClick: () => {
                  const updated = { ...(Value.get(controller.signal) ?? {}) }
                  delete updated[key]
                  controller.change(updated)
                },
                disabled: !canRemove,
              },
              'Remove'
            )
          ),
          html.div(
            attr.class('bc-json-structure-map-entry-value'),
            StructureGenericControl({
              ctx: ctx
                .with({
                  definition: valuesSchema,
                  suppressLabel: true,
                })
                .append(key),
              controller: field,
            })
          )
        )
      })
    )
  })

  // Add entry button with reactive disabled state
  const addEntryButton = !ctx.readOnly
    ? Button(
        {
          variant: 'outline',
          size: 'sm',
          disabled: Value.map(
            controller.signal,
            current => Object.keys(current ?? {}).length >= maxProperties
          ),
          onClick: () => {
            const currentValue = Value.get(controller.signal) ?? {}
            const existingKeys = new Set(Object.keys(currentValue))
            const newKey = generateUniqueKey(existingKeys)
            const newValue = makeDefaultValue(valuesSchema)

            controller.change({
              ...currentValue,
              [newKey]: newValue,
            })
          },
        },
        'Add Entry'
      )
    : null

  // Combine all children
  const content = html.div(
    attr.class('bc-json-structure-map-entries'),
    entriesSection,
    addEntryButton
  )

  // Wrap with visual hierarchy
  const wrappedContent = html.div(attr.class('bc-json-structure-map'), content)

  // Wrap with InputWrapper if label should be shown
  if (!ctx.suppressLabel && ctx.name) {
    return InputWrapper({
      ...createInputOptions(ctx),
      content: wrappedContent,
    })
  }

  return wrappedContent
}
