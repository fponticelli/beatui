import { attr, html, Renderable, Value, Fragment } from '@tempots/dom'
import { ArrayController, ObjectController, type Controller } from '../../form'
import type {
  SchemaContext,
  JSONSchemaDefinition,
  JSONSchema,
} from '../schema-context'
import {
  mergeAllOf,
  evaluateNotViolation,
  SchemaContext as SchemaContextClass,
} from '../schema-context'
import { resolveRef } from '../ref-utils'
import { WithSchemaIssues } from './schema-wrapper'

// Import all control types
import { JSONSchemaAny } from './any-control'
import { JSONSchemaEnum, JSONSchemaConst } from './enum-const-controls'
import { JSONSchemaNumber, JSONSchemaInteger } from './number-controls'
import { JSONSchemaString } from './string-control'
import { JSONSchemaBoolean } from './boolean-control'
import { JSONSchemaNull } from './null-control'
import { JSONSchemaArray } from './array-control'
import { JSONSchemaObject } from './object-control'
import { JSONSchemaUnion } from './union-control'
import { JSONSchemaAnyOf, JSONSchemaOneOf } from './composition-controls'

/**
 * Generic control dispatcher that routes to appropriate control based on schema
 */
export function JSONSchemaGenericControl<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  // Resolve $ref (in-document) if present; merge with siblings
  const baseDef = typeof ctx.definition === 'boolean' ? {} : ctx.definition
  let resolvedDef = baseDef?.$ref ? resolveRef(baseDef, ctx.schema) : baseDef
  let nextCtx = ctx.with({ definition: resolvedDef })

  // Handle allOf early by merging into effective schema
  if (resolvedDef?.allOf != null) {
    // Filter out boolean schemas (true/false) and only process object schemas
    const objectSchemas = resolvedDef.allOf.filter(
      (schema): schema is JSONSchema =>
        typeof schema === 'object' && schema !== null
    )
    if (objectSchemas.length > 0) {
      const { mergedSchema, conflicts } = mergeAllOf(objectSchemas, ctx.path)
      // Merge the allOf result with any other properties from the parent schema
      const { allOf: _allOf, ...parentProps } = resolvedDef
      resolvedDef = { ...parentProps, ...mergedSchema }
      nextCtx = ctx.with({
        definition: resolvedDef,
        schemaConflicts: [...ctx.schemaConflicts, ...conflicts],
      })
    }
  }

  // Evaluate not violations against current controller value
  let notViolations = [...nextCtx.notViolations]
  if (resolvedDef?.not != null && typeof resolvedDef.not === 'object') {
    const currentValue = Value.get(controller.value)
    const violation = evaluateNotViolation(
      resolvedDef.not,
      currentValue,
      nextCtx.ajv,
      nextCtx.path
    )
    if (violation) {
      notViolations = [...notViolations, violation]
      nextCtx = nextCtx.with({ notViolations })
    }
  }

  if (resolvedDef == null) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaAny({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.enum != null) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaEnum({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.const != null) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaConst({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.anyOf != null) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaAnyOf({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.oneOf != null) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaOneOf({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef?.type == null) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaAny({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (Array.isArray(resolvedDef.type)) {
    return WithSchemaIssues(
      nextCtx,
      JSONSchemaUnion({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  switch (resolvedDef.type) {
    case 'number':
      return WithSchemaIssues(
        nextCtx,
        JSONSchemaNumber({
          ctx: nextCtx,
          controller: controller as unknown as Controller<number>,
        }),
        controller
      )
    case 'integer':
      return WithSchemaIssues(
        nextCtx,
        JSONSchemaInteger({
          ctx: nextCtx,
          controller: controller as unknown as Controller<number>,
        }),
        controller
      )
    case 'string':
      return WithSchemaIssues(
        nextCtx,
        JSONSchemaString({
          ctx: nextCtx,
          controller: controller as unknown as Controller<string | undefined>,
        }),
        controller
      )
    case 'boolean':
      return WithSchemaIssues(
        nextCtx,
        JSONSchemaBoolean({
          ctx: nextCtx,
          controller: controller as unknown as Controller<boolean | null>,
        }),
        controller
      )
    case 'array':
      return WithSchemaIssues(
        nextCtx,
        JSONSchemaArray({
          ctx: nextCtx,
          controller:
            controller instanceof ArrayController
              ? (controller as unknown as ArrayController<unknown[]>)
              : ((
                  controller as unknown as Controller<unknown[]>
                ).array() as ArrayController<unknown[]>),
        }),
        controller
      )
    case 'object': {
      const schema = JSONSchemaObject({
        ctx: nextCtx,
        controller: (controller instanceof ObjectController
          ? controller
          : (
              controller as Controller<Record<string, unknown>>
            ).object()) as ObjectController<{
          [key: string]: unknown
        }>,
      })
      if (nextCtx.isRoot) {
        return WithSchemaIssues(nextCtx, schema, controller)
      }
      return WithSchemaIssues(
        nextCtx,
        html.div(attr.class('bc-json-schema-object'), schema),
        controller
      )
    }
    case 'null':
      return WithSchemaIssues(
        nextCtx,
        JSONSchemaNull({
          ctx: nextCtx,
          controller: controller as unknown as Controller<null>,
        }),
        controller
      )
    default:
      console.warn('Unknown type', resolvedDef.type)
      return WithSchemaIssues(
        nextCtx,
        html.div(attr.class('bc-json-schema-unknown'), 'Unknown'),
        controller
      )
  }
}

/**
 * Main entry point for JSON Schema controls
 */
export function JSONSchemaControl<T>({
  schema,
  controller,
  ajv,
}: {
  schema: JSONSchemaDefinition
  controller: Controller<T>
  ajv?: import('ajv').default
}): Renderable {
  const ctx = new SchemaContextClass({
    schema,
    definition: schema,
    horizontal: false,
    isPropertyRequired: false,
    path: [],
    ajv,
  })
  if (schema === true) {
    return JSONSchemaAny({ ctx, controller: controller as Controller<unknown> })
  }
  if (schema === false) {
    // Never type - should not be rendered
    return Fragment()
  }
  return JSONSchemaGenericControl({ ctx, controller })
}
