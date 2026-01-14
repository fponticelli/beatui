/**
 * Generic Control Dispatcher
 *
 * Routes to appropriate control based on type definition.
 */

import { attr, html, Renderable } from '@tempots/dom'
import { ObjectController, ArrayController, type Controller } from '../../form'
import type { StructureContext } from '../structure-context'
import { createStructureContext } from '../structure-context'
import type { JSONStructureSchema } from '../structure-types'
import {
  isTypeReference,
  isObjectTypeDefinition,
  isArrayTypeDefinition,
  isSetTypeDefinition,
  isMapTypeDefinition,
  isTupleTypeDefinition,
  isChoiceTypeDefinition,
  hasEnumValue,
  hasConstValue,
  isIntegerType,
  isFloatType,
  isTemporalType,
  getNonNullTypes,
} from '../structure-types'
import { resolveExtends } from '../extends-utils'
import type { WidgetRegistry } from '../widgets/widget-registry'

// Primitive control imports
import { StructureStringControl } from './string-control'
import { StructureBooleanControl } from './boolean-control'
import { StructureIntegerControl } from './integer-control'
import { StructureDecimalControl } from './decimal-control'
import { StructureUuidControl } from './uuid-control'
import { StructureTemporalControl } from './temporal-control'
import { StructureUriControl } from './uri-control'
import { StructureBinaryControl } from './binary-control'
import { StructureAnyControl } from './any-control'

// Compound control imports
import { StructureObjectControl } from './object-control'
import { StructureArrayControl } from './array-control'
import { StructureSetControl } from './set-control'
import { StructureMapControl } from './map-control'
import { StructureTupleControl } from './tuple-control'
import { StructureChoiceControl } from './choice-control'

// Enum and const control imports
import { StructureEnumControl, StructureConstControl } from './enum-const-controls'

// Union control import
import { StructureUnionControl } from './union-control'

/**
 * Props for the generic control
 */
export interface GenericControlProps<T = unknown> {
  controller: Controller<T>
  ctx: StructureContext
}

/**
 * Generic control dispatcher that routes to appropriate control based on type
 */
export function StructureGenericControl<T>({
  ctx,
  controller,
}: GenericControlProps<T>): Renderable {
  let resolvedCtx = ctx

  // Resolve $ref if type is a reference
  const typeDef = ctx.definition
  if (typeDef.type && isTypeReference(typeDef.type)) {
    const resolved = ctx.resolveRef(typeDef.type.$ref)
    if (resolved) {
      // Merge resolved definition with local properties (local takes precedence)
      const { type: _type, ...localProps } = typeDef
      const mergedDef = { ...resolved, ...localProps }
      resolvedCtx = ctx.with({ definition: mergedDef })
    }
  }

  // Resolve $extends if present
  if (resolvedCtx.definition.$extends) {
    const { merged } = resolveExtends(resolvedCtx.definition, ctx.schema)
    resolvedCtx = resolvedCtx.with({ definition: merged })
  }

  // Check for custom widget in registry
  const registry = resolvedCtx.widgetRegistry
  if (registry) {
    const customWidget = registry.findBestWidget(resolvedCtx)
    if (customWidget) {
      return customWidget.registration.factory({
        controller: controller as Controller<unknown>,
        ctx: resolvedCtx,
      })
    }
  }

  // Handle enum values
  if (hasEnumValue(resolvedCtx.definition)) {
    return StructureEnumControl({
      ctx: resolvedCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }

  // Handle const values
  if (hasConstValue(resolvedCtx.definition)) {
    return StructureConstControl({
      ctx: resolvedCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }

  // Handle union types (type arrays with multiple non-null types)
  const resolvedType = resolvedCtx.resolvedType
  if (Array.isArray(resolvedType)) {
    const nonNullTypes = getNonNullTypes(resolvedType)
    // Use union control if we have multiple non-null types
    if (nonNullTypes.length > 1) {
      return StructureUnionControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<unknown>,
      })
    }
    // If only one non-null type (e.g., ["string", "null"]), continue with single type handling
  }

  // Route based on type
  const primaryType = resolvedCtx.primaryType

  if (!primaryType) {
    // No type specified - render as 'any'
    return StructureAnyControl({
      ctx: resolvedCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }

  // Handle compound types
  if (isObjectTypeDefinition(resolvedCtx.definition)) {
    const objController = controller instanceof ObjectController
      ? controller
      : (controller as unknown as Controller<Record<string, unknown>>).object()
    return StructureObjectControl({
      ctx: resolvedCtx,
      controller: objController as ObjectController<{ [key: string]: unknown }>,
    })
  }

  if (isArrayTypeDefinition(resolvedCtx.definition)) {
    const arrController = controller instanceof ArrayController
      ? controller
      : (controller as unknown as Controller<unknown[]>).array()
    return StructureArrayControl({
      ctx: resolvedCtx,
      controller: arrController as ArrayController<unknown[]>,
    })
  }

  if (isSetTypeDefinition(resolvedCtx.definition)) {
    const arrController = controller instanceof ArrayController
      ? controller
      : (controller as unknown as Controller<unknown[]>).array()
    return StructureSetControl({
      ctx: resolvedCtx,
      controller: arrController as ArrayController<unknown[]>,
    })
  }

  if (isMapTypeDefinition(resolvedCtx.definition)) {
    const objController = controller instanceof ObjectController
      ? controller
      : (controller as unknown as Controller<Record<string, unknown>>).object()
    return StructureMapControl({
      ctx: resolvedCtx,
      controller: objController as ObjectController<{ [key: string]: unknown }>,
    })
  }

  if (isTupleTypeDefinition(resolvedCtx.definition)) {
    const arrController = controller instanceof ArrayController
      ? controller
      : (controller as unknown as Controller<unknown[]>).array()
    return StructureTupleControl({
      ctx: resolvedCtx,
      controller: arrController as ArrayController<unknown[]>,
    })
  }

  if (isChoiceTypeDefinition(resolvedCtx.definition)) {
    return StructureChoiceControl({
      ctx: resolvedCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }

  // Handle primitive types
  switch (primaryType) {
    case 'string':
      return StructureStringControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<string | undefined>,
      })
    case 'boolean':
      return StructureBooleanControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<boolean | null>,
      })
    case 'uuid':
      return StructureUuidControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<string | undefined>,
      })
    case 'uri':
      return StructureUriControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<string | undefined>,
      })
    case 'binary':
      return StructureBinaryControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<File | undefined>,
      })
    case 'null':
      return renderNullPlaceholder(resolvedCtx)
    case 'any':
      return StructureAnyControl({
        ctx: resolvedCtx,
        controller: controller as unknown as Controller<unknown>,
      })
    default:
      // Check integer types
      if (isIntegerType(primaryType)) {
        return StructureIntegerControl({
          ctx: resolvedCtx,
          controller: controller as unknown as Controller<number | bigint | null>,
          intType: primaryType,
        })
      }
      // Check float types
      if (isFloatType(primaryType)) {
        return StructureDecimalControl({
          ctx: resolvedCtx,
          controller: controller as unknown as Controller<number | null>,
          floatType: primaryType,
        })
      }
      // Check temporal types
      if (isTemporalType(primaryType)) {
        return StructureTemporalControl({
          ctx: resolvedCtx,
          controller: controller as unknown as Controller<any>,
          temporalType: primaryType,
        })
      }
      // Unknown type
      console.warn(`Unknown type: ${primaryType}`)
      return renderUnknownType(resolvedCtx, primaryType)
  }
}

/**
 * Main entry point for JSON Structure controls
 */
export function StructureControl<T>({
  schema,
  controller,
  widgetRegistry,
  readOnly,
  locale,
}: {
  schema: JSONStructureSchema
  controller: Controller<T>
  widgetRegistry?: WidgetRegistry
  readOnly?: boolean
  locale?: string
}): Renderable {
  const ctx = createStructureContext(schema, {
    widgetRegistry,
    readOnly,
    locale,
  })

  return StructureGenericControl({ ctx, controller })
}

// =============================================================================
// Placeholder Renderers
// =============================================================================

function renderNullPlaceholder(ctx: StructureContext): Renderable {
  return html.div(
    attr.class('bc-json-structure-placeholder'),
    html.span(`[Null: ${ctx.label}]`),
    html.em('null')
  )
}

function renderUnknownType(ctx: StructureContext, type: string): Renderable {
  return html.div(
    attr.class('bc-json-structure-unknown'),
    html.span(`Unknown type: ${type}`),
    html.em(`at path: ${ctx.jsonPath}`)
  )
}
