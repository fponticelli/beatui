import { html, attr, Renderable, Value, MapSignal } from '@tempots/dom'
import type {
  SchemaContext,
  JSONSchema,
} from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import { GenericDisplay } from './generic-display'
import { detectOneOfBranch } from '../../json-schema/oneof-branch-detection'
import { mergeAllOf } from '../../json-schema/schema-merge'
import { resolveRef, resolveAnyRef } from '../../json-schema/ref-utils'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

/**
 * Renders oneOf/anyOf by detecting the matching branch and rendering via matched schema.
 * For allOf: merges and renders as single schema.
 */
export function CompositionDisplay({
  ctx,
  value,
  mismatches,
  displayWidgetRegistry,
}: {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}): Renderable {
  const def = ctx.definition as JSONSchema

  // allOf: merge all branches and render as single schema
  if (def.allOf != null) {
    const objectSchemas = def.allOf.filter(
      (s): s is JSONSchema => typeof s === 'object' && s !== null
    )
    if (objectSchemas.length > 0) {
      const resolvedSchemas = objectSchemas.map(s =>
        resolveAnyRef(s, ctx.schema, ctx.ajv)
      )
      const { mergedSchema } = mergeAllOf(resolvedSchemas, ctx.path)
      const { allOf: _allOf, ...parentProps } = def
      const mergedDef = { ...parentProps, ...mergedSchema }
      const mergedCtx = ctx.with({ definition: mergedDef })

      return GenericDisplay({
        ctx: mergedCtx,
        value,
        mismatches,
        displayWidgetRegistry,
      })
    }
  }

  // oneOf / anyOf: detect matching branch
  const branches = def.oneOf ?? def.anyOf
  if (!Array.isArray(branches) || branches.length === 0) {
    const sig = Value.toSignal(value)
    return DisplayWrapper({
      ctx,
      mismatches,
      children: MapSignal(sig, v =>
        html.span(
          attr.class('bc-json-schema-display__value'),
          JSON.stringify(v)
        )
      ),
    })
  }

  const sig = Value.toSignal(value)

  const content = MapSignal(sig, v => {
    // Detect which branch matches
    const detection = detectOneOfBranch(ctx, v, ctx.ajv)

    if (detection.matchingBranch >= 0) {
      const branchDef = branches[detection.matchingBranch]
      const resolvedBranchDef =
        typeof branchDef === 'object' && branchDef !== null && branchDef.$ref
          ? resolveRef(branchDef as JSONSchema, ctx.schema)
          : (branchDef as JSONSchema)

      // Object branches need their own property layout via GenericDisplay
      const branchType =
        typeof resolvedBranchDef === 'object'
          ? resolvedBranchDef?.type
          : undefined
      if (branchType === 'object') {
        const branchCtx = ctx.with({ definition: resolvedBranchDef })
        return GenericDisplay({
          ctx: branchCtx,
          value: v,
          mismatches,
          displayWidgetRegistry,
        })
      }

      // Scalar branches: render value inline without a nested field wrapper
      const displayValue = typeof v === 'string' ? v : JSON.stringify(v)
      return html.span(
        attr.class('bc-json-schema-display__value'),
        displayValue
      )
    }

    // No match or ambiguous - show raw value
    if (detection.isAmbiguous) {
      return html.div(
        html.span(
          attr.class(
            'bc-json-schema-display__branch-label bc-json-schema-display__branch-label--ambiguous'
          ),
          `Ambiguous (${detection.validBranches.length} branches match)`
        ),
        html.pre(
          attr.class('bc-json-schema-display__pre'),
          JSON.stringify(v, null, 2)
        )
      )
    }

    return html.div(
      html.span(
        attr.class(
          'bc-json-schema-display__branch-label bc-json-schema-display__branch-label--no-match'
        ),
        'No matching branch'
      ),
      html.pre(
        attr.class('bc-json-schema-display__pre'),
        JSON.stringify(v, null, 2)
      )
    )
  })

  return DisplayWrapper({ ctx, mismatches, children: content })
}
