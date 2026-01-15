/**
 * Object Control for JSON Structure
 *
 * Handles object type with properties and additionalProperties support
 */

import { attr, html, Renderable, Value, MapSignal } from '@tempots/dom'
import { ObjectController, InputWrapper } from '../../form'
import { Button } from '../../button'
import { objectEntries } from '@tempots/std'
import type { StructureContext } from '../structure-context'
import type { TypeDefinition } from '../structure-types'
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
 * Check if a property is required based on the required constraint
 * Supports both string[] (flat list) and string[][] (grouped requirements)
 */
function isPropertyRequired(
  propertyKey: string,
  required: string[] | string[][] | undefined
): boolean {
  if (!required || required.length === 0) return false

  // Check if it's a flat array of strings
  if (typeof required[0] === 'string') {
    return (required as string[]).includes(propertyKey)
  }

  // Check if it's an array of arrays (grouped requirements)
  if (Array.isArray(required[0])) {
    return (required as string[][]).some(group => group.includes(propertyKey))
  }

  return false
}

/**
 * Get the default value for a new property based on its type definition
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
        type === 'uint8' ||
        type === 'uint16' ||
        type === 'uint32' ||
        type === 'uint64' ||
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
 * Generate a unique property key that doesn't exist in the current object
 */
function generateUniqueKey(
  existingKeys: Set<string>,
  baseName = 'property'
): string {
  if (!existingKeys.has(baseName)) return baseName

  let counter = 1
  while (existingKeys.has(`${baseName}${counter}`)) {
    counter++
  }
  return `${baseName}${counter}`
}

/**
 * Control for object type
 */
export function StructureObjectControl({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: ObjectController<{ [key: string]: unknown }>
}): Renderable {
  const definition = ctx.definition

  // Type guard to ensure we have an object definition
  if (definition.type !== 'object' || !('properties' in definition)) {
    console.warn('StructureObjectControl requires an ObjectTypeDefinition')
    return html.div('Invalid object definition')
  }

  // Use MapSignal to reactively update when the value changes
  return MapSignal(controller.signal, current => {
    const properties = definition.properties as Record<string, TypeDefinition>
    const required = definition.required as string[] | string[][] | undefined
    const additionalProperties = definition.additionalProperties as
      | boolean
      | TypeDefinition
      | undefined

    // Determine if additional properties are allowed
    const allowAdditional = additionalProperties !== false
    const additionalSchema: TypeDefinition =
      typeof additionalProperties === 'object' && additionalProperties !== null
        ? additionalProperties
        : ({ type: 'any' } as TypeDefinition)

    // Get min/max properties constraints
    const minProps =
      (definition as { minProperties?: number }).minProperties ?? 0
    const maxProps =
      (definition as { maxProperties?: number }).maxProperties ?? Infinity

    // Collect known property names
    const propertyEntries = objectEntries(properties)
    const knownPropertyNames = new Set(
      propertyEntries.map(([key]) => key as string)
    )

    // Get current additional property keys
    const currentKeys = Object.keys(current ?? {})
    const additionalKeys = currentKeys.filter(k => !knownPropertyNames.has(k))

    // Determine if we can add properties
    const canAdd =
      allowAdditional && currentKeys.length < maxProps && !ctx.readOnly
    const canRemove = currentKeys.length > minProps && !ctx.readOnly

    // Render known properties
    const propertyChildren = propertyEntries.map(([key, propDef]) => {
      const propKey = key as string
      const field = controller.field(propKey)
      const isPropRequired = isPropertyRequired(propKey, required)

      return StructureGenericControl({
        ctx: ctx
          .with({
            definition: propDef,
            isPropertyRequired: isPropRequired,
            suppressLabel: false,
          })
          .append(propKey),
        controller: field,
      })
    })

    // Render additional properties
    const additionalChildren = additionalKeys.map(key => {
      const field = controller.field(key)

      return html.div(
        attr.class('bc-json-structure-additional-property'),
        html.div(
          attr.class('bc-json-structure-additional-property-header'),
          html.strong(`${key}:`),
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
          attr.class('bc-json-structure-additional-property-value'),
          StructureGenericControl({
            ctx: ctx
              .with({
                definition: additionalSchema,
                isPropertyRequired: false,
                suppressLabel: true,
              })
              .append(key),
            controller: field,
          })
        )
      )
    })

    // Add property button
    const addPropertyButton = canAdd
      ? Button(
          {
            variant: 'outline',
            size: 'sm',
            onClick: () => {
              const currentValue = Value.get(controller.signal) ?? {}
              const existingKeys = new Set(Object.keys(currentValue))
              const newKey = generateUniqueKey(existingKeys)
              const newValue = makeDefaultValue(additionalSchema)

              controller.change({
                ...currentValue,
                [newKey]: newValue,
              })
            },
          },
          'Add Property'
        )
      : null

    // Combine all children
    const content = html.div(
      attr.class('bc-json-structure-object-fields'),
      ...propertyChildren,
      ...additionalChildren,
      addPropertyButton
    )

    // Wrap with visual hierarchy for nested objects
    const wrappedContent = html.div(
      attr.class('bc-json-structure-object'),
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
