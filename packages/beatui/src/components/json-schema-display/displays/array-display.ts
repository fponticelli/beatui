import {
  html,
  attr,
  Renderable,
  Value,
  MapSignal,
} from '@tempots/dom'
import type { SchemaContext, JSONSchema } from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import { GenericDisplay } from './generic-display'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

/**
 * Get item schema for a given index.
 */
function getItemSchema(
  def: JSONSchema,
  index: number
): JSONSchema | boolean | undefined {
  // Draft 2020-12 prefixItems
  if (def.prefixItems != null && index < def.prefixItems.length) {
    return def.prefixItems[index] as JSONSchema | boolean
  }

  // Draft-07 tuple items
  if (Array.isArray(def.items) && index < def.items.length) {
    return def.items[index] as JSONSchema | boolean
  }

  // Remaining items after prefix/tuple
  if (def.prefixItems != null && index >= def.prefixItems.length) {
    return def.items != null && !Array.isArray(def.items)
      ? (def.items as JSONSchema | boolean)
      : undefined
  }

  // Single items schema
  if (def.items != null && !Array.isArray(def.items)) {
    return def.items as JSONSchema | boolean
  }

  return undefined
}

/**
 * Renders an array value with per-item schema rendering.
 */
export function ArrayDisplay({
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
  const sig = Value.toSignal(value)

  const content = MapSignal(sig, v => {
    if (!Array.isArray(v)) {
      if (v == null) {
        return html.span(
          attr.class('bc-json-schema-display__value--null'),
          '\u2014'
        )
      }
      return html.span(
        attr.class('bc-json-schema-display__value'),
        String(v)
      )
    }

    if (v.length === 0) {
      return html.span(
        attr.class('bc-json-schema-display__empty'),
        '(empty array)'
      )
    }

    return html.div(
      attr.class('bc-json-schema-display__array'),
      ...v.map((item, index) => {
        const itemSchema = getItemSchema(def, index)
        const itemCtx = ctx
          .with({
            definition: itemSchema ?? true,
          })
          .append(index)

        // Filter mismatches for this item's path
        const itemMismatches = mismatches?.filter(m => {
          const mPath = m.path.map(String)
          const expectedPath = [...ctx.path.map(String), String(index)]
          return (
            mPath.length >= expectedPath.length &&
            expectedPath.every((seg, i) => mPath[i] === seg)
          )
        })

        return html.div(
          attr.class('bc-json-schema-display__array-item'),
          html.span(
            attr.class('bc-json-schema-display__array-index'),
            `[${index}]`
          ),
          GenericDisplay({
            ctx: itemCtx,
            value: item,
            mismatches: itemMismatches,
            displayWidgetRegistry,
          })
        )
      })
    )
  })

  return DisplayWrapper({ ctx, mismatches, children: content })
}
