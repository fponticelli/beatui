import { html, attr, Renderable, Value, MapSignal } from '@tempots/dom'
import type { SchemaContext } from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

/**
 * Fallback display for values without a specific schema type.
 * Detects runtime type and renders appropriately, or falls back to JSON.stringify.
 */
export function AnyDisplay({
  ctx,
  value,
  mismatches,
}: {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}): Renderable {
  const sig = Value.toSignal(value)

  const content = MapSignal(sig, v => {
    if (v === undefined || v === null) {
      return html.span(
        attr.class('bc-json-schema-display__value--null'),
        v === null ? 'null' : '\u2014'
      )
    }

    if (typeof v === 'boolean') {
      return html.span(
        attr.class(
          `bc-json-schema-display__boolean bc-json-schema-display__boolean--${v ? 'true' : 'false'}`
        ),
        String(v)
      )
    }

    if (typeof v === 'number') {
      return html.span(
        attr.class('bc-json-schema-display__value'),
        v.toLocaleString()
      )
    }

    if (typeof v === 'string') {
      return html.span(attr.class('bc-json-schema-display__value'), v)
    }

    // Objects and arrays: render as formatted JSON
    try {
      return html.pre(
        attr.class('bc-json-schema-display__pre'),
        JSON.stringify(v, null, 2)
      )
    } catch {
      return html.span(attr.class('bc-json-schema-display__value'), String(v))
    }
  })

  return DisplayWrapper({ ctx, mismatches, children: content })
}
