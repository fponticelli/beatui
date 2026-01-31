import { Renderable, Value } from '@tempots/dom'
import type {
  SchemaContext,
  JSONSchema,
} from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { resolveRef, resolveAnyRef } from '../../json-schema/ref-utils'
import { mergeAllOf } from '../../json-schema/schema-merge'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

import { StringDisplay } from './string-display'
import { NumberDisplay } from './number-display'
import { BooleanDisplay } from './boolean-display'
import { NullDisplay } from './null-display'
import { ArrayDisplay } from './array-display'
import { ObjectDisplay } from './object-display'
import { EnumConstDisplay } from './enum-const-display'
import { CompositionDisplay } from './composition-display'
import { AnyDisplay } from './any-display'

interface GenericDisplayProps {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}

/**
 * Generic display dispatcher.
 * Mirrors generic-control.ts: resolves $ref, merges allOf,
 * routes by schema type to the appropriate display component.
 * Checks custom display widgets first.
 */
export function GenericDisplay({
  ctx,
  value,
  mismatches,
  displayWidgetRegistry,
}: GenericDisplayProps): Renderable {
  // Resolve $ref if present
  const baseDef = typeof ctx.definition === 'boolean' ? {} : ctx.definition
  let resolvedDef = baseDef?.$ref ? resolveRef(baseDef, ctx.schema) : baseDef
  let nextCtx = ctx.with({ definition: resolvedDef })

  // Handle allOf early by merging
  if (resolvedDef?.allOf != null) {
    const objectSchemas = resolvedDef.allOf.filter(
      (schema): schema is JSONSchema =>
        typeof schema === 'object' && schema !== null
    )
    if (objectSchemas.length > 0) {
      const resolvedAllOf = objectSchemas.map(schema =>
        resolveAnyRef(schema, ctx.schema, ctx.ajv)
      )
      const { mergedSchema } = mergeAllOf(resolvedAllOf, ctx.path)
      const { allOf: _allOf, ...parentProps } = resolvedDef
      resolvedDef = { ...parentProps, ...mergedSchema }
      nextCtx = ctx.with({ definition: resolvedDef })
    }
  }

  // Check custom display widgets first
  if (displayWidgetRegistry) {
    const match = displayWidgetRegistry.findBestWidget(nextCtx)
    if (match) {
      return match.factory({
        value,
        ctx: nextCtx,
        mismatches,
      })
    }
  }

  // If definition is null/undefined, use AnyDisplay
  if (resolvedDef == null) {
    return AnyDisplay({
      ctx: nextCtx,
      value,
      mismatches,
      displayWidgetRegistry,
    })
  }

  // Enum
  if (resolvedDef.enum != null) {
    return EnumConstDisplay({
      ctx: nextCtx,
      value,
      mismatches,
      displayWidgetRegistry,
    })
  }

  // Const
  if (resolvedDef.const !== undefined) {
    return EnumConstDisplay({
      ctx: nextCtx,
      value,
      mismatches,
      displayWidgetRegistry,
    })
  }

  // anyOf / oneOf
  if (resolvedDef.anyOf != null || resolvedDef.oneOf != null) {
    return CompositionDisplay({
      ctx: nextCtx,
      value,
      mismatches,
      displayWidgetRegistry,
    })
  }

  // No type specified
  if (resolvedDef.type == null) {
    return AnyDisplay({
      ctx: nextCtx,
      value,
      mismatches,
      displayWidgetRegistry,
    })
  }

  // Union type — route by first non-null type
  if (Array.isArray(resolvedDef.type)) {
    const types = resolvedDef.type as string[]
    const nonNull = types.filter(t => t !== 'null')

    if (
      nonNull.length === 1 &&
      ['string', 'number', 'integer', 'boolean'].includes(nonNull[0])
    ) {
      return routeByType(nonNull[0], {
        ctx: nextCtx,
        value,
        mismatches,
        displayWidgetRegistry,
      })
    }

    // General union: use AnyDisplay
    return AnyDisplay({
      ctx: nextCtx,
      value,
      mismatches,
      displayWidgetRegistry,
    })
  }

  return routeByType(resolvedDef.type, {
    ctx: nextCtx,
    value,
    mismatches,
    displayWidgetRegistry,
  })
}

function routeByType(type: string, props: GenericDisplayProps): Renderable {
  switch (type) {
    case 'string':
      return StringDisplay(props)
    case 'number':
    case 'integer':
      return NumberDisplay(props)
    case 'boolean':
      return BooleanDisplay(props)
    case 'array':
      return ArrayDisplay(props)
    case 'object':
      return ObjectDisplay(props)
    case 'null':
      return NullDisplay(props)
    default:
      return AnyDisplay(props)
  }
}
