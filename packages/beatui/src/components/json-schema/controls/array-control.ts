import { Renderable, attr, computedOf, When, MapSignal } from '@tempots/dom'
import { ListControl, type ArrayController, type Controller } from '../../form'
import type {
  SchemaContext,
  JSONSchema,
  JSONSchemaDefinition,
} from '../schema-context'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
} from './shared-utils'
import { JSONSchemaGenericControl } from './generic-control'
import { Stack } from '../../layout'
import { Label } from '../../typography'

/**
 * Tuple detection utilities
 */
type TupleInfo = {
  isTuple: boolean
  prefixItems: JSONSchemaDefinition[]
  additionalItemsSchema: JSONSchemaDefinition | false
  tupleLabels?: string[]
}

function detectTupleSchema(schema: JSONSchema): TupleInfo {
  // Draft 2020-12: prefixItems + items
  if (schema.prefixItems != null) {
    return {
      isTuple: true,
      prefixItems: schema.prefixItems,
      additionalItemsSchema: Array.isArray(schema.items)
        ? true
        : (schema.items ?? true),
      tupleLabels: getXUITupleLabels(schema),
    }
  }

  // Draft-07: items array + additionalItems
  if (Array.isArray(schema.items)) {
    return {
      isTuple: true,
      prefixItems: schema.items,
      additionalItemsSchema: schema.additionalItems ?? true,
      tupleLabels: getXUITupleLabels(schema),
    }
  }

  // Regular homogeneous array
  return {
    isTuple: false,
    prefixItems: [],
    additionalItemsSchema: schema.items ?? true,
  }
}

function getXUITupleLabels(schema: JSONSchema): string[] | undefined {
  if (typeof schema === 'boolean') return undefined
  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  return Array.isArray(xui?.tupleLabels)
    ? (xui.tupleLabels as string[])
    : undefined
}

/**
 * Control for array schemas with tuple support
 */
export function JSONSchemaArray({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: ArrayController<unknown[]>
}): Renderable {
  const schema = ctx.definition as JSONSchema
  const tupleInfo = detectTupleSchema(schema)

  // Determine if add button should be disabled based on constraints
  const canAddItems = computedOf(controller.value)(value => {
    const currentLength = value?.length ?? 0

    // Check maxItems constraint
    if (schema.maxItems != null && currentLength >= schema.maxItems) {
      return false
    }

    // For tuples, check if additional items are allowed
    if (tupleInfo.isTuple) {
      const beyondPrefix = currentLength >= tupleInfo.prefixItems.length
      if (beyondPrefix && tupleInfo.additionalItemsSchema === false) {
        return false
      }
    }

    return true
  })

  // Determine if remove button should be disabled based on minItems
  const canRemoveItems = computedOf(controller.value)(value => {
    const currentLength = value?.length ?? 0
    return schema.minItems == null || currentLength > schema.minItems
  })

  // Get duplicate indices for highlighting
  const duplicateIndices = computedOf(controller.value)(value => {
    if (!schema.uniqueItems || !value) return new Set<number>()

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

  // Contains validation logic
  const containsInfo = computedOf(controller.value)(value => {
    if (!schema.contains || !value) {
      return { matchingIndices: new Set<number>(), count: 0, isValid: true }
    }

    const matchingIndices = new Set<number>()
    let count = 0

    // Prefer AJV when available, otherwise use a basic fallback matcher for common cases
    if (ctx.ajv) {
      try {
        const validate = ctx.ajv.compile(schema.contains)
        for (let i = 0; i < value.length; i++) {
          if (validate(value[i])) {
            matchingIndices.add(i)
            count++
          }
        }
      } catch {
        // If validation fails, assume no matches
      }
    } else {
      // Fallback matcher: supports simple numeric/string constraints used in tests
      const contains = schema.contains
      const basicMatch = (item: unknown): boolean => {
        if (typeof contains === 'boolean') return contains
        if (typeof contains !== 'object' || contains == null) return false

        const c = contains as JSONSchema
        const tp = c.type

        if (tp === 'integer' || tp === 'number') {
          if (typeof item !== 'number' || !Number.isFinite(item)) return false
          if (tp === 'integer' && !Number.isInteger(item)) return false
          if (typeof c.minimum === 'number' && item < c.minimum) return false
          if (
            typeof c.exclusiveMinimum === 'number' &&
            item <= c.exclusiveMinimum
          )
            return false
          if (typeof c.maximum === 'number' && item > c.maximum) return false
          if (
            typeof c.exclusiveMaximum === 'number' &&
            item >= c.exclusiveMaximum
          )
            return false
          if (typeof c.multipleOf === 'number' && item % c.multipleOf !== 0)
            return false
          return true
        }

        if (tp === 'string') {
          if (typeof item !== 'string') return false
          if (typeof c.minLength === 'number' && item.length < c.minLength)
            return false
          if (typeof c.maxLength === 'number' && item.length > c.maxLength)
            return false
          if (typeof c.pattern === 'string') {
            try {
              const re = new RegExp(c.pattern)
              if (!re.test(item)) return false
            } catch {
              // ignore invalid patterns in fallback
            }
          }
          return true
        }

        // Default conservative behavior
        return false
      }

      for (let i = 0; i < value.length; i++) {
        if (basicMatch(value[i])) {
          matchingIndices.add(i)
          count++
        }
      }
    }

    const minContains = schema.minContains ?? (schema.contains ? 1 : 0)
    const maxContains = schema.maxContains
    const isValid =
      count >= minContains && (maxContains == null || count <= maxContains)

    return { matchingIndices, count, isValid, minContains, maxContains }
  })

  // Create contains summary helper text
  const containsSummary = schema.contains
    ? containsInfo.map(info => {
        const containsTitle =
          typeof schema.contains === 'object' && schema.contains.title
            ? schema.contains.title
            : 'required pattern'

        if (!info.isValid) {
          if (info.count < (info.minContains ?? 0)) {
            return `Must contain at least ${info.minContains ?? 0} item(s) matching ${containsTitle} (currently ${info.count})`
          } else if (
            info.maxContains != null &&
            info.count > info.maxContains
          ) {
            return `Must contain at most ${info.maxContains} item(s) matching ${containsTitle} (currently ${info.count})`
          }
        }
        return `Contains ${info.count} item(s) matching ${containsTitle}`
      })
    : null

  const listControl = ListControl({
    ...definitionToInputWrapperOptions({ ctx }),
    createItem: () => {
      const currentLength = controller.value.value?.length ?? 0

      if (tupleInfo.isTuple && currentLength < tupleInfo.prefixItems.length) {
        // Creating item for tuple prefix position
        const prefixSchema = tupleInfo.prefixItems[currentLength]
        return makePlaceholder(prefixSchema as JSONSchema, () => undefined)
      } else {
        // Creating item for additional/overflow position
        return makePlaceholder(
          tupleInfo.additionalItemsSchema as JSONSchema,
          () => undefined
        )
      }
    },
    controller,
    // Always render add/remove controls but disable them when constraints forbid actions
    showAdd: true,
    addDisabled: computedOf(canAddItems)(v => !v),
    showRemove: true,
    removeDisabled: computedOf(canRemoveItems)(v => !v),
    element: payload => {
      const item = payload.item as Controller<unknown>
      const index = payload.position.index

      let definition: JSONSchemaDefinition
      let label: string | undefined

      if (tupleInfo.isTuple && index < tupleInfo.prefixItems.length) {
        // Tuple prefix item
        definition = tupleInfo.prefixItems[index]

        // Get label from tuple labels, schema title, or generate from index
        if (tupleInfo.tupleLabels?.[index]) {
          label = tupleInfo.tupleLabels[index]
        } else if (typeof definition === 'object' && definition.title) {
          label = definition.title
        } else {
          label = `Item ${index + 1}`
        }
      } else {
        // Additional/overflow item or regular array item
        definition = tupleInfo.additionalItemsSchema

        if (tupleInfo.isTuple) {
          label = `Additional Item ${index - tupleInfo.prefixItems.length + 1}`
        }
      }

      const control = JSONSchemaGenericControl({
        ctx: ctx
          .with({ definition: definition as JSONSchemaDefinition })
          .append(index),
        controller: item,
      })

      // Check if this item is a duplicate
      const isDuplicate = duplicateIndices.map(indices => indices.has(index))

      // Check if this item matches the contains schema
      const matchesContains = containsInfo.map(info =>
        info.matchingIndices.has(index)
      )

      // Create the main content
      let content = control

      // Wrap with label for tuple items
      if (label && tupleInfo.isTuple) {
        content = Stack(
          attr.class('bc-stack--gap-1'),
          Label(attr.class('bc-array-control__item-label'), label),
          content
        )
      }

      // Add validation indicators
      const indicators = []

      // Duplicate indicator
      if (schema.uniqueItems) {
        indicators.push(
          When(isDuplicate, () =>
            Label(
              attr.class(
                'bc-array-control__indicator bc-array-control__indicator--error'
              ),
              '⚠️ Duplicate value'
            )
          )
        )
      }

      // Contains match indicator
      if (schema.contains) {
        indicators.push(
          When(matchesContains, () =>
            Label(
              attr.class(
                'bc-array-control__indicator bc-array-control__indicator--success'
              ),
              '✓ Matches required pattern'
            )
          )
        )
      }

      if (indicators.length > 0) {
        return Stack(attr.class('bc-stack--gap-1'), content, ...indicators)
      }

      return content
    },
  })

  // If there's contains validation, wrap with summary
  if (schema.contains && containsSummary) {
    return Stack(
      attr.class('bc-stack--gap-2'),
      listControl,
      MapSignal(
        computedOf(
          containsInfo,
          containsSummary
        )((info, summary) => ({
          info,
          summary,
        })),
        ({ info, summary }) =>
          Label(
            attr.class(
              info.isValid
                ? 'bc-array-control__summary bc-array-control__summary--success'
                : 'bc-array-control__summary bc-array-control__summary--error'
            ),
            summary
          )
      )
    )
  }

  return listControl
}
