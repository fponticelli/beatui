/**
 * Object Control for JSON Structure
 *
 * Handles object type with properties and additionalProperties support
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
import { objectEntries } from '@tempots/std'
import type { StructureContext } from '../structure-context'
import type { TypeDefinition } from '../structure-types'
import { StructureGenericControl } from './generic-control'
import { createInputOptions, makeDefaultValue } from './control-utils'

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
  const minProps = (definition as { minProperties?: number }).minProperties ?? 0
  const maxProps =
    (definition as { maxProperties?: number }).maxProperties ?? Infinity

  // Collect known property names
  const propertyEntries = objectEntries(properties)
  const knownPropertyNames = new Set(
    propertyEntries.map(([key]) => key as string)
  )

  // Known properties — rendered once; sub-controllers handle value updates
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

  // Dynamic additional properties — MapSignal only for this section
  const additionalSection = MapSignal(controller.signal, current => {
    const currentKeys = Object.keys(current ?? {})
    const additionalKeys = currentKeys.filter(k => !knownPropertyNames.has(k))

    if (additionalKeys.length === 0) return Empty

    const canRemove = currentKeys.length > minProps && !ctx.readOnly

    return Fragment(
      ...additionalKeys.map(key => {
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
    )
  })

  // Add property button with reactive disabled state
  const addPropertyButton =
    allowAdditional && !ctx.readOnly
      ? Button(
          {
            variant: 'outline',
            size: 'sm',
            disabled: Value.map(
              controller.signal,
              current => Object.keys(current ?? {}).length >= maxProps
            ),
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
    additionalSection,
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
}
