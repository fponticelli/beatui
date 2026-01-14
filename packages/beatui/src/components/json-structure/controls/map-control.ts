/**
 * Map Control for JSON Structure
 *
 * Handles map type with key-value pairs and minProperties/maxProperties constraints
 */

import { attr, html, Renderable, Value, MapSignal } from '@tempots/dom'
import { ObjectController, InputWrapper } from '../../form'
import { Button } from '../../button'
import type { StructureContext } from '../structure-context'
import type { TypeDefinition, MapTypeDefinition } from '../structure-types'
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
 * Get the default value for a new map value based on its type definition
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

  const type = Array.isArray(definition.type) ? definition.type[0] : definition.type

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
        type === 'int8' || type === 'int16' || type === 'int32' || type === 'int64' ||
        type === 'int128' || type === 'uint8' || type === 'uint16' || type === 'uint32' ||
        type === 'uint64' || type === 'uint128' || type === 'float' || type === 'double' ||
        type === 'decimal'
      ) {
        return 0
      }
      return undefined
  }
}

/**
 * Generate a unique key that doesn't exist in the current map
 */
function generateUniqueKey(existingKeys: Set<string>, baseName = 'key'): string {
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

  // Use MapSignal to reactively update when the value changes
  return MapSignal(controller.signal, current => {
    const currentKeys = Object.keys(current ?? {})
    const currentCount = currentKeys.length

    // Determine if we can add/remove properties based on constraints
    const canAdd = currentCount < maxProperties && !ctx.readOnly
    const canRemove = currentCount > minProperties && !ctx.readOnly

    // Render each key-value pair
    const entryChildren = currentKeys.map(key => {
      const field = controller.field(key)

      return html.div(
        attr.class('bc-json-structure-map-entry'),
        html.div(
          attr.class('bc-json-structure-map-entry-header'),
          html.strong(attr.class('bc-json-structure-map-entry-key'), `${key}:`),
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

    // Add entry button
    const addEntryButton = canAdd
      ? Button(
          {
            variant: 'outline',
            size: 'sm',
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
      ...entryChildren,
      addEntryButton
    )

    // Wrap with visual hierarchy
    const wrappedContent = html.div(
      attr.class('bc-json-structure-map'),
      content
    )

    // Wrap with InputWrapper if label should be shown
    if (!ctx.suppressLabel && ctx.name) {
      return InputWrapper({
        ...createInputOptions(ctx),
        content: wrappedContent,
      })
    }

    return wrappedContent
  })
}
