import { html, attr, Renderable, Value, MapSignal } from '@tempots/dom'
import type {
  SchemaContext,
  JSONSchema,
} from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

/**
 * Renders an enum or const value with mismatch indication.
 */
export function EnumConstDisplay({
  ctx,
  value,
  mismatches,
}: {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}): Renderable {
  const def = ctx.definition as JSONSchema
  const sig = Value.toSignal(value)

  const content = MapSignal(sig, v => {
    if (v == null) {
      return html.span(
        attr.class('bc-json-schema-display__value--null'),
        '\u2014'
      )
    }

    const displayValue = typeof v === 'string' ? v : JSON.stringify(v)

    // Check if value is in enum / matches const
    let isValid = true
    if (def.enum != null) {
      isValid = def.enum.some(e => JSON.stringify(e) === JSON.stringify(v))
    } else if (def.const !== undefined) {
      isValid = JSON.stringify(def.const) === JSON.stringify(v)
    }

    return html.span(
      attr.class(
        `bc-json-schema-display__value${!isValid ? ' bc-json-schema-display__mismatch--enum-mismatch' : ''}`
      ),
      displayValue,
      !isValid
        ? html.span(
            attr.class('bc-json-schema-display__mismatch-indicator'),
            def.enum != null
              ? ` (not in enum: ${def.enum.map(e => JSON.stringify(e)).join(', ')})`
              : ` (expected: ${JSON.stringify(def.const)})`
          )
        : null
    )
  })

  return DisplayWrapper({ ctx, mismatches, children: content })
}
